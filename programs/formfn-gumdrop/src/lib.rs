//! Program for distributing NFT prints (Participation NFTs) efficiently using
//! a Merkle root for claim verifications. This is a port of the Metaplex
//! Gumdrop program, which does the same thing but with additional functionality.
//! https://github.com/metaplex-foundation/metaplex-program-library/blob/master/gumdrop/program/src/lib.rs

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use mpl_token_metadata::state::get_master_edition;
use solana_program::{program::invoke_signed, system_instruction};

pub mod merkle_proof;

// This is the mainnet program ID
declare_id!("gum8aDxTHP5HSXxQzVHDdSQJGUQFLreGDX2cUa133tk");

const DISTRIBUTOR_PREFIX: &str = "MerkleDistributor";
const GUMDROP_CONFIG_PREFIX: &str = "GumdropConfig";
const CLAIM_COUNT_PREFIX: &str = "ClaimCount";
const WALLET_PREFIX: &str = "Wallet";

/// The [formfn_gumdrop] program.
#[program]
pub mod formfn_gumdrop {
    use super::*;

    /// Set the global formfn_authority on the GumdropConfig account.
    pub fn create_gumdrop_config(ctx: Context<CreateGumdropConfig>, bump: u8) -> Result<()> {
        let config_creator = &ctx.accounts.config_authority;
        let config_authority = &ctx.accounts.config_authority;
        let gumdrop_config = &mut ctx.accounts.gumdrop_config;

        gumdrop_config.bump = bump;
        gumdrop_config.config_creator = config_creator.key();
        gumdrop_config.config_authority = config_authority.key();

        msg!(
            "Created GumdropConfig with config_creator {} and config_authority {}",
            config_creator.key(),
            config_authority.key()
        );

        Ok(())
    }

    /// Update the global formfn_authority on the GumdropConfig account.
    pub fn update_gumdrop_config(ctx: Context<UpdateGumdropConfig>) -> Result<()> {
        let gumdrop_config = &mut ctx.accounts.gumdrop_config;
        let new_authority = &mut ctx.accounts.new_authority;

        let previous_authority = gumdrop_config.config_authority;

        gumdrop_config.config_authority = new_authority.key();

        msg!(
            "Updated GumdropConfig config_authority from {} to {}",
            previous_authority.key(),
            new_authority.key()
        );

        Ok(())
    }

    /// Creates a new [MerkleDistributor].
    pub fn new_distributor(ctx: Context<NewDistributor>, bump: u8, root: [u8; 32]) -> Result<()> {
        let mint = &ctx.accounts.mint;
        let distributor = &mut ctx.accounts.distributor;

        let config_authority = &ctx.accounts.config_authority;
        let creator_authority = &ctx.accounts.creator_authority;
        let is_valid = creator_authority.is_signer || config_authority.is_signer;
        require!(is_valid, GumdropErrorCode::Unauthorized);

        distributor.root = root;
        distributor.bump = bump;
        distributor.mint = mint.key();
        distributor.creator_authority = ctx.accounts.creator_authority.key();

        msg!(
            "Created new distributor for mint {} by creator {}",
            mint.key(),
            creator_authority.key()
        );

        Ok(())
    }

    /// Updates an existing [MerkleDistributor]. This is used to support
    /// concurrent auctions where a creator wants to reuse a Participation NFT
    /// across multiple ongoing auctions using a single Master Edition mint.
    pub fn update_distributor(
        ctx: Context<UpdateDistributor>,
        updated_root: [u8; 32],
    ) -> Result<()> {
        let mint = &ctx.accounts.mint;
        let distributor = &mut ctx.accounts.distributor;
        let config_authority = &ctx.accounts.config_authority;
        let creator_authority = &ctx.accounts.creator_authority;
        let gumdrop_config = &ctx.accounts.gumdrop_config;

        validate_account_access(
            gumdrop_config,
            distributor,
            creator_authority,
            config_authority,
        )?;

        // Update the merkle root.
        distributor.root = updated_root;

        msg!("Updated distributor root for mint {}", mint.key());

        Ok(())
    }

    /// Closes distributor-owned token accounts.
    pub fn close_distributor_token_account(
        ctx: Context<CloseDistributorTokenAccount>,
    ) -> Result<()> {
        let distributor = &ctx.accounts.distributor;
        let config_authority = &ctx.accounts.config_authority;
        let creator_authority = &ctx.accounts.creator_authority;
        let gumdrop_config = &ctx.accounts.gumdrop_config;

        validate_account_access(
            gumdrop_config,
            distributor,
            creator_authority,
            config_authority,
        )?;

        let seeds = [
            DISTRIBUTOR_PREFIX.as_bytes(),
            &distributor.mint.to_bytes(),
            &creator_authority.key().to_bytes(),
            &[ctx.accounts.distributor.bump],
        ];

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.distributor_token_account.to_account_info(),
                    to: ctx.accounts.token_receiver.to_account_info(),
                    authority: ctx.accounts.distributor.to_account_info(),
                },
            )
            .with_signer(&[&seeds[..]]),
            ctx.accounts.distributor_token_account.amount,
        )?;

        token::close_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::CloseAccount {
                    account: ctx.accounts.distributor_token_account.to_account_info(),
                    destination: ctx.accounts.rent_receiver.to_account_info(),
                    authority: ctx.accounts.distributor.to_account_info(),
                },
            )
            .with_signer(&[&seeds[..]]),
        )?;

        Ok(())
    }

    /// Closes an existing [MerkleDistributor].
    /// Moves all tokens from the [MerkleDistributor] to the specified account
    /// and closes distributor accounts.
    /// Must `close_distributor_token_account` first.
    pub fn close_distributor<'info>(
        ctx: Context<'_, '_, '_, 'info, CloseDistributor<'info>>,
        wallet_bump: u8,
    ) -> Result<()> {
        let distributor = &ctx.accounts.distributor;
        let config_authority = &ctx.accounts.config_authority;
        let creator_authority = &ctx.accounts.creator_authority;
        let gumdrop_config = &ctx.accounts.gumdrop_config;

        validate_account_access(
            gumdrop_config,
            distributor,
            creator_authority,
            config_authority,
        )?;

        let wallet_seeds = [
            WALLET_PREFIX.as_bytes(),
            &distributor.key().to_bytes(),
            &[wallet_bump],
        ];

        invoke_signed(
            &system_instruction::transfer(
                ctx.accounts.distributor_wallet.key,
                ctx.accounts.receiver.key,
                ctx.accounts.distributor_wallet.lamports(),
            ),
            &[
                ctx.accounts.distributor_wallet.to_account_info().clone(),
                ctx.accounts.receiver.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            &[&wallet_seeds],
        )?;

        msg!("Successfully closed distributor {}", distributor.key());

        Ok(())
    }

    /// Claims NFTs by calling MintNewEditionFromMasterEditionViaToken.
    pub fn claim_edition(
        ctx: Context<ClaimEdition>,
        edition_bump: u8,
        edition_number: u64,
        amount: u8,
        proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        let claim_count = &mut ctx.accounts.claim_count;
        let distributor = &mut ctx.accounts.distributor;
        let metadata_new_mint_authority = &mut ctx.accounts.limited_edition_mint_authority;

        // Note: The claimant_pubkey must be a signer to the transaction to ensure
        // proper leaf construction for the merkle proof verification. Because
        // the claimant must sign and pay for the transaction, we use payer for
        // this rather than add an additional account to the instruction accounts.
        let claimant_pubkey = &mut ctx.accounts.payer.key.clone();

        // Claimant pubkey must match the metadata_new_mint_authority account key.
        require!(
            *claimant_pubkey == metadata_new_mint_authority.key(),
            GumdropErrorCode::Unauthorized
        );

        // Reconstruct the leaf node for this claim.
        let leaf = solana_program::keccak::hashv(&[
            &[0x00],
            &claimant_pubkey.to_bytes(),
            &ctx.accounts.master_edition_mint.key.to_bytes(),
            &amount.to_le_bytes(),
        ]);

        // Verify the submitted proof.
        require!(
            merkle_proof::verify(proof, distributor.root, leaf.0),
            GumdropErrorCode::InvalidProof
        );

        // Verify the provided master edition metadata account.
        let metadata_master_edition = &ctx.accounts.master_edition_pda;
        let derivation_result = assert_pda_derivation(
            &mpl_token_metadata::id(),
            &metadata_master_edition.to_account_info(),
            &[
                mpl_token_metadata::state::PREFIX.as_bytes(),
                mpl_token_metadata::id().as_ref(),
                ctx.accounts.master_edition_mint.key().as_ref(),
                mpl_token_metadata::state::EDITION.as_bytes(),
                &[edition_bump],
            ],
        );

        if let Err(_e) = derivation_result {
            return Err(GumdropErrorCode::InvalidMasterEditionAccount.into());
        }

        // Increment the edition for the claim.
        let master_edition = get_master_edition(metadata_master_edition)?;
        let edition = (*master_edition).supply().checked_add(1).unwrap();

        if edition_number != edition {
            return Err(GumdropErrorCode::InvalidEdition.into());
        }

        // The claim_count must be less than the amount value stored in the
        // merkle tree.
        require!(
            claim_count.count < amount,
            GumdropErrorCode::DropAlreadyClaimed
        );

        // Mark the claim as fulfilled.
        let clock = Clock::get()?;
        claim_count.claimed_at = clock.unix_timestamp;

        let count = claim_count.count.checked_add(1).unwrap();
        claim_count.count = count;

        claim_count.claimant = ctx.accounts.payer.key();

        let seeds = [
            DISTRIBUTOR_PREFIX.as_bytes(),
            &distributor.mint.to_bytes(),
            &distributor.creator_authority.to_bytes(),
            &[distributor.bump],
        ];

        #[rustfmt::skip]
        let metadata_infos = [
            ctx.accounts.token_metadata_program.to_account_info().clone(),
            ctx.accounts.limited_edition_metadata.to_account_info().clone(),
            ctx.accounts.limited_edition_pda.to_account_info().clone(),
            ctx.accounts.master_edition_pda.to_account_info().clone(),
            ctx.accounts.limited_edition_mint.to_account_info().clone(),
            ctx.accounts.edition_marker_pda.to_account_info().clone(),
            ctx.accounts.limited_edition_mint_authority.to_account_info().clone(),
            ctx.accounts.payer.to_account_info().clone(),
            ctx.accounts.distributor.to_account_info().clone(),
            ctx.accounts.master_edition_token_account.to_account_info().clone(),
            ctx.accounts.limited_edition_update_authority.to_account_info().clone(),
            ctx.accounts.master_edition_metadata.to_account_info().clone(),
            ctx.accounts.master_edition_mint.to_account_info().clone(),
            ctx.accounts.rent.to_account_info().clone(),
        ];

        invoke_signed(
            &mpl_token_metadata::instruction::mint_new_edition_from_master_edition_via_token(
                *ctx.accounts.token_metadata_program.key,
                *ctx.accounts.limited_edition_metadata.key,
                *ctx.accounts.limited_edition_pda.key,
                *ctx.accounts.master_edition_pda.key,
                *ctx.accounts.limited_edition_mint.key,
                *ctx.accounts.limited_edition_mint_authority.key,
                *ctx.accounts.payer.key,
                ctx.accounts.distributor.key(),
                *ctx.accounts.master_edition_token_account.key,
                *ctx.accounts.limited_edition_update_authority.key,
                *ctx.accounts.master_edition_metadata.key,
                *ctx.accounts.master_edition_mint.key,
                edition,
            ),
            &metadata_infos,
            &[&seeds],
        )?;

        msg!(
            "Claimed edition #{} for mint {} by claimant {}",
            edition,
            ctx.accounts.master_edition_mint.key(),
            claimant_pubkey
        );

        Ok(())
    }
}

// Validate provided accounts for access control. The method enforces the
// provided accounts are either signed by the GumdropConfig config_authority
// or the creator_authority on a given MerkleDistributor account.
fn validate_account_access(
    gumdrop_config: &Account<GumdropConfig>,
    distributor: &Account<MerkleDistributor>,
    creator_authority: &UncheckedAccount,
    config_authority: &UncheckedAccount,
) -> Result<()> {
    let is_creator =
        creator_authority.key() == distributor.creator_authority && creator_authority.is_signer;

    let is_config_authority =
        config_authority.key() == gumdrop_config.config_authority && config_authority.is_signer;

    let is_valid = is_creator || is_config_authority;

    require!(is_valid, GumdropErrorCode::Unauthorized);

    Ok(())
}

pub fn assert_pda_derivation(
    program_id: &Pubkey,
    account: &AccountInfo,
    path: &[&[u8]],
) -> Result<Pubkey> {
    let result = Pubkey::create_program_address(path, program_id);
    match result {
        Ok(pda) => {
            if pda != *account.key {
                return Err(GumdropErrorCode::DerivedKeyInvalid.into());
            }

            Ok(pda)
        }
        Err(_e) => Err(GumdropErrorCode::DerivedKeyInvalid.into()),
    }
}

#[derive(Accounts)]
#[instruction()]
pub struct CreateGumdropConfig<'info> {
    /// [GumdropConfig].
    #[account(
        init,
        seeds = [
          GUMDROP_CONFIG_PREFIX.as_bytes(),
          config_creator.key().to_bytes().as_ref(),
        ],
        bump,
        payer = payer,
        space = GUMDROP_CONFIG_SPACE
    )]
    gumdrop_config: Account<'info, GumdropConfig>,

    #[account()]
    config_authority: Signer<'info>,

    #[account()]
    config_creator: Signer<'info>,

    #[account(mut)]
    payer: Signer<'info>,

    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGumdropConfig<'info> {
    /// [GumdropConfig].
    #[account(
        mut,
        seeds = [
          GUMDROP_CONFIG_PREFIX.as_bytes(),
          gumdrop_config.config_creator.to_bytes().as_ref(),
        ],
        bump = gumdrop_config.bump,
        has_one = config_authority
    )]
    gumdrop_config: Account<'info, GumdropConfig>,

    #[account()]
    config_authority: Signer<'info>,

    /// CHECK: Can be any PublicKey.
    #[account()]
    new_authority: UncheckedAccount<'info>,

    #[account(mut)]
    payer: Signer<'info>,
}

/// Accounts for [merkle_distributor::new_distributor].
#[derive(Accounts)]
#[instruction()]
pub struct NewDistributor<'info> {
    /// Mint PublicKey associated with the distributor.
    #[account()]
    mint: Account<'info, Mint>,

    /// [MerkleDistributor].
    #[account(
        init,
        space = MERKLE_DISTRIBUTOR_SPACE,
        seeds = [
            DISTRIBUTOR_PREFIX.as_bytes(),
            mint.key().to_bytes().as_ref(),
            creator_authority.key().to_bytes().as_ref()
        ],
        bump,
        payer = payer
    )]
    distributor: Account<'info, MerkleDistributor>,

    /// Account which can later update the distributor. This should normally
    /// be the same as the one who creates it.
    /// CHECK: Account is validated in the instruction handler.
    #[account()]
    creator_authority: UncheckedAccount<'info>,

    /// [GumdropConfig].
    #[account(
        seeds = [
          GUMDROP_CONFIG_PREFIX.as_bytes(),
          gumdrop_config.config_creator.to_bytes().as_ref(),
        ],
        bump = gumdrop_config.bump,
        has_one = config_authority,
    )]
    gumdrop_config: Account<'info, GumdropConfig>,

    /// CHECK: Account is validated in the instruction handler.
    #[account()]
    config_authority: UncheckedAccount<'info>,

    #[account(mut)]
    payer: Signer<'info>,

    system_program: Program<'info, System>,
}

/// Accounts for [merkle_distributor::update_distributor].
#[derive(Accounts)]
pub struct UpdateDistributor<'info> {
    /// Mint PublicKey associated with the distributor.
    #[account()]
    mint: Account<'info, Mint>,

    /// [MerkleDistributor].
    #[account(
        mut,
        seeds = [
            DISTRIBUTOR_PREFIX.as_bytes(),
            mint.key().to_bytes().as_ref(),
            creator_authority.key().to_bytes().as_ref()
        ],
        bump = distributor.bump,
    )]
    distributor: Account<'info, MerkleDistributor>,

    /// Creator authority who can update the distributor.
    /// CHECK: Account is checked by validate_account_access.
    #[account()]
    creator_authority: UncheckedAccount<'info>,

    /// [GumdropConfig].
    #[account(
        seeds = [
          GUMDROP_CONFIG_PREFIX.as_bytes(),
          gumdrop_config.config_creator.to_bytes().as_ref(),
        ],
        bump = gumdrop_config.bump,
        has_one = config_authority,
    )]
    gumdrop_config: Account<'info, GumdropConfig>,

    /// CHECK: Account is checked by validate_account_access.
    #[account()]
    config_authority: UncheckedAccount<'info>,

    #[account()]
    payer: Signer<'info>,
}

/// [merkle_distributor::close_distributor_token_account] accounts.
#[derive(Accounts)]
pub struct CloseDistributorTokenAccount<'info> {
    /// Mint PublicKey associated with the distributor.
    #[account()]
    mint: Account<'info, Mint>,

    /// [MerkleDistributor].
    #[account(
      seeds = [
          DISTRIBUTOR_PREFIX.as_bytes(),
          mint.key().to_bytes().as_ref(),
          creator_authority.key().to_bytes().as_ref(),
      ],
      bump = distributor.bump,
    )]
    distributor: Account<'info, MerkleDistributor>,

    /// Creator authority who can update the distributor.
    /// CHECK: Account is checked by validate_account_access.
    #[account()]
    creator_authority: UncheckedAccount<'info>,

    /// Distributor containing the tokens to distribute.
    #[account(mut, constraint = distributor_token_account.amount == 1)]
    distributor_token_account: Account<'info, TokenAccount>,

    /// Account to send the claimed tokens to.
    #[account(mut)]
    token_receiver: Account<'info, TokenAccount>,

    /// Who is receiving the remaining rent allocation.
    /// CHECK: This is used in a Transfer instruction.
    #[account(mut)]
    rent_receiver: UncheckedAccount<'info>,

    /// [GumdropConfig].
    #[account(
        seeds = [
          GUMDROP_CONFIG_PREFIX.as_bytes(),
          gumdrop_config.config_creator.to_bytes().as_ref(),
        ],
        bump = gumdrop_config.bump,
        has_one = config_authority,
    )]
    gumdrop_config: Account<'info, GumdropConfig>,

    /// CHECK: Account is checked by validate_account_access.
    #[account()]
    config_authority: UncheckedAccount<'info>,

    token_program: Program<'info, Token>,
}

/// [merkle_distributor::close_distributor] accounts.
#[derive(Accounts)]
#[instruction(wallet_bump: u8)]
pub struct CloseDistributor<'info> {
    /// Mint PublicKey associated with the distributor.
    #[account()]
    mint: Account<'info, Mint>,

    /// [MerkleDistributor].
    #[account(
      mut,
      seeds = [
          DISTRIBUTOR_PREFIX.as_bytes(),
          mint.key().to_bytes().as_ref(),
          creator_authority.key().to_bytes().as_ref()
      ],
      bump = distributor.bump,
      close = receiver,
    )]
    distributor: Account<'info, MerkleDistributor>,

    /// Creator authority who can update the distributor.
    /// CHECK: Account is checked by validate_account_access.
    #[account()]
    creator_authority: UncheckedAccount<'info>,

    /// CHECK: This is used in a Transfer instruction.
    #[account(
      mut,
      seeds = [
          WALLET_PREFIX.as_bytes(),
          distributor.key().to_bytes().as_ref()
      ],
      bump = wallet_bump,
    )]
    distributor_wallet: UncheckedAccount<'info>,

    /// Who is receiving the remaining tokens and rent allocations.
    /// CHECK: This is used in a Transfer instruction.
    receiver: UncheckedAccount<'info>,

    /// [GumdropConfig].
    #[account(
        seeds = [
          GUMDROP_CONFIG_PREFIX.as_bytes(),
          gumdrop_config.config_creator.to_bytes().as_ref(),
        ],
        bump = gumdrop_config.bump,
        has_one = config_authority,
    )]
    gumdrop_config: Account<'info, GumdropConfig>,

    /// CHECK: Account is checked by validate_account_access.
    #[account()]
    config_authority: UncheckedAccount<'info>,

    system_program: Program<'info, System>,
}

/// [merkle_distributor::claim_edition] accounts. Wrapper around
/// MintNewEditionFromMasterEditionViaToken.
#[derive(Accounts)]
#[instruction()]
pub struct ClaimEdition<'info> {
    /// [MerkleDistributor].
    #[account(
        mut,
        seeds = [
            DISTRIBUTOR_PREFIX.as_bytes(),
            master_edition_mint.key().to_bytes().as_ref(),
            distributor.creator_authority.to_bytes().as_ref()
        ],
        bump = distributor.bump,
    )]
    distributor: Account<'info, MerkleDistributor>,

    /// Status of the claim. Created on first invocation of this function.
    #[account(
        init_if_needed,
        space = CLAIM_COUNT_SPACE,
        owner = ID,
        seeds = [
            CLAIM_COUNT_PREFIX.as_bytes(),
            distributor.key().to_bytes().as_ref(),
            limited_edition_mint_authority.key().to_bytes().as_ref()
        ],
        bump,
        payer = payer,
    )]
    claim_count: Account<'info, ClaimCount>,

    /// The claimant who is claiming the limited edition print.
    #[account(mut)]
    payer: Signer<'info>,

    /// Master edition mint account.
    /// CHECK: Account is passed through to mpl program.
    master_edition_mint: UncheckedAccount<'info>,

    /// Master edition mint metadata account.
    /// CHECK: Account is passed through to mpl program.
    master_edition_metadata: UncheckedAccount<'info>,

    /// Edition account of the master edition mint.
    /// CHECK: Account is passed through to mpl program.
    #[account(mut)]
    master_edition_pda: UncheckedAccount<'info>,

    /// New mint address for the claim limited edition print.
    /// CHECK: Account is passed through to mpl program.
    #[account(mut)]
    limited_edition_mint: UncheckedAccount<'info>,

    /// Metadata account of the new limited edition mint.
    /// CHECK: Account is passed through to mpl program.
    #[account(mut)]
    limited_edition_metadata: UncheckedAccount<'info>,

    /// Edition account of the new limited edition mint.
    /// CHECK: Account is passed through to mpl program.
    #[account(mut)]
    limited_edition_pda: UncheckedAccount<'info>,

    /// Edition marker PDA.
    /// CHECK: Account is passed through to mpl program.
    #[account(mut)]
    edition_marker_pda: UncheckedAccount<'info>,

    /// Distributor token account for the master edition mint.
    /// CHECK: Account is passed through to mpl program.
    master_edition_token_account: UncheckedAccount<'info>,

    /// The new mint authority (the claimant).
    limited_edition_mint_authority: Signer<'info>,

    /// Update authority for new metadata (should be original creator).
    /// CHECK: Account is passed through to mpl program.
    limited_edition_update_authority: UncheckedAccount<'info>,

    /// SPL [TokenMetadata] program.
    /// CHECK: Account is passed through to mpl program.
    token_metadata_program: UncheckedAccount<'info>,

    token_program: Program<'info, Token>,

    system_program: Program<'info, System>,

    rent: Sysvar<'info, Rent>,
}

/// Global Gumdrop program authority account. This is for Formfunction to
/// authorize certain program instructions.
#[account]
#[derive(Default)]
pub struct GumdropConfig {
    /// Account bump.
    bump: u8,
    /// The Pubkey for this authority account.
    config_authority: Pubkey,
    /// The creator of the config account.
    config_creator: Pubkey,
}

pub const GUMDROP_CONFIG_SPACE: usize = 8 + // key
1 + //  bump
32 + // config_authority
32 + // config_creator
3200; // padding

/// State for the account which distributes tokens.
#[account]
#[derive(Default)]
pub struct MerkleDistributor {
    /// Bump seed.
    bump: u8,
    /// Creator authority who can update the distributor in the
    /// future via the update_distributor instruction.
    creator_authority: Pubkey,
    /// Mint PublicKey associated with a distributor.
    mint: Pubkey,
    /// The 256-bit merkle root.
    root: [u8; 32],
}

pub const MERKLE_DISTRIBUTOR_SPACE: usize = 8 + // key
1 + // bump
32 + // creator_authority
32 + // mint
32 + // root
128; // padding

#[account]
#[derive(Default)]
pub struct ClaimCount {
    /// Authority that claimed the tokens.
    claimant: Pubkey,
    /// When the edition was claimed.
    claimed_at: i64,
    /// Number of NFTs claimed. Should match `amount` in merkle tree data/proof.
    count: u8,
}

pub const CLAIM_COUNT_SPACE: usize = 8 + // key
32 + // claimant
8 + // claimed_at
1 + // count
128; // padding

#[error_code]
pub enum GumdropErrorCode {
    #[msg("Invalid Merkle proof.")]
    InvalidProof = 1000,
    #[msg("Drop already claimed.")]
    DropAlreadyClaimed,
    #[msg("Account is not authorized to execute this instruction.")]
    Unauthorized,
    #[msg("Token account owner did not match intended owner.")]
    OwnerMismatch,
    #[msg("Invalid metadata_master_edition account provided for master edition mint account.")]
    InvalidMasterEditionAccount,
    #[msg("Derived key invalid.")]
    DerivedKeyInvalid,
    #[msg("Someone already claimed this edition of the NFT. Please try again.")]
    InvalidEdition,
}
