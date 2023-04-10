import { Idl } from "@project-serum/anchor";

const FORMFN_GUMDROP_IDL: Idl = {
  accounts: [
    {
      docs: [
        "Global Gumdrop program authority account. This is for Formfunction to",
        "authorize certain program instructions.",
      ],
      name: "GumdropConfig",
      type: {
        fields: [
          {
            docs: ["Account bump."],
            name: "bump",
            type: "u8",
          },
          {
            docs: ["The Pubkey for this authority account."],
            name: "configAuthority",
            type: "publicKey",
          },
          {
            docs: ["The creator of the config account."],
            name: "configCreator",
            type: "publicKey",
          },
        ],
        kind: "struct",
      },
    },
    {
      docs: ["State for the account which distributes tokens."],
      name: "MerkleDistributor",
      type: {
        fields: [
          {
            docs: ["Bump seed."],
            name: "bump",
            type: "u8",
          },
          {
            docs: [
              "Creator authority who can update the distributor in the",
              "future via the update_distributor instruction.",
            ],
            name: "creatorAuthority",
            type: "publicKey",
          },
          {
            docs: ["Mint PublicKey associated with a distributor."],
            name: "mint",
            type: "publicKey",
          },
          {
            docs: ["The 256-bit merkle root."],
            name: "root",
            type: {
              array: ["u8", 32],
            },
          },
        ],
        kind: "struct",
      },
    },
    {
      name: "ClaimCount",
      type: {
        fields: [
          {
            docs: ["Authority that claimed the tokens."],
            name: "claimant",
            type: "publicKey",
          },
          {
            docs: ["When the edition was claimed."],
            name: "claimedAt",
            type: "i64",
          },
          {
            docs: [
              "Number of NFTs claimed. Should match `amount` in merkle tree data/proof.",
            ],
            name: "count",
            type: "u8",
          },
        ],
        kind: "struct",
      },
    },
  ],
  docs: ["The [formfn_gumdrop] program."],
  errors: [
    {
      code: 7000,
      msg: "Invalid Merkle proof.",
      name: "InvalidProof",
    },
    {
      code: 7001,
      msg: "Drop already claimed.",
      name: "DropAlreadyClaimed",
    },
    {
      code: 7002,
      msg: "Account is not authorized to execute this instruction.",
      name: "Unauthorized",
    },
    {
      code: 7003,
      msg: "Token account owner did not match intended owner.",
      name: "OwnerMismatch",
    },
    {
      code: 7004,
      msg: "Invalid metadata_master_edition account provided for master edition mint account.",
      name: "InvalidMasterEditionAccount",
    },
    {
      code: 7005,
      msg: "Derived key invalid.",
      name: "DerivedKeyInvalid",
    },
    {
      code: 7006,
      msg: "Someone already claimed this edition of the NFT. Please try again.",
      name: "InvalidEdition",
    },
  ],
  instructions: [
    {
      accounts: [
        {
          docs: ["[GumdropConfig]."],
          isMut: true,
          isSigner: false,
          name: "gumdropConfig",
        },
        {
          isMut: false,
          isSigner: true,
          name: "configAuthority",
        },
        {
          isMut: false,
          isSigner: true,
          name: "configCreator",
        },
        {
          isMut: true,
          isSigner: true,
          name: "payer",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
      ],
      docs: ["Set the global formfn_authority on the GumdropConfig account."],
      name: "createGumdropConfig",
    },
    {
      accounts: [
        {
          docs: ["[GumdropConfig]."],
          isMut: true,
          isSigner: false,
          name: "gumdropConfig",
        },
        {
          isMut: false,
          isSigner: true,
          name: "configAuthority",
        },
        {
          isMut: false,
          isSigner: false,
          name: "newAuthority",
        },
        {
          isMut: true,
          isSigner: true,
          name: "payer",
        },
      ],
      args: [],
      docs: [
        "Update the global formfn_authority on the GumdropConfig account.",
      ],
      name: "updateGumdropConfig",
    },
    {
      accounts: [
        {
          docs: ["Mint PublicKey associated with the distributor."],
          isMut: false,
          isSigner: false,
          name: "mint",
        },
        {
          docs: ["[MerkleDistributor]."],
          isMut: true,
          isSigner: false,
          name: "distributor",
        },
        {
          docs: [
            "Account which can later update the distributor. This should normally",
            "be the same as the one who creates it.",
          ],
          isMut: false,
          isSigner: false,
          name: "creatorAuthority",
        },
        {
          docs: ["[GumdropConfig]."],
          isMut: false,
          isSigner: false,
          name: "gumdropConfig",
        },
        {
          isMut: false,
          isSigner: false,
          name: "configAuthority",
        },
        {
          isMut: true,
          isSigner: true,
          name: "payer",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
        {
          name: "root",
          type: {
            array: ["u8", 32],
          },
        },
      ],
      docs: ["Creates a new [MerkleDistributor]."],
      name: "newDistributor",
    },
    {
      accounts: [
        {
          docs: ["Mint PublicKey associated with the distributor."],
          isMut: false,
          isSigner: false,
          name: "mint",
        },
        {
          docs: ["[MerkleDistributor]."],
          isMut: true,
          isSigner: false,
          name: "distributor",
        },
        {
          docs: ["Creator authority who can update the distributor."],
          isMut: false,
          isSigner: false,
          name: "creatorAuthority",
        },
        {
          docs: ["[GumdropConfig]."],
          isMut: false,
          isSigner: false,
          name: "gumdropConfig",
        },
        {
          isMut: false,
          isSigner: false,
          name: "configAuthority",
        },
        {
          isMut: false,
          isSigner: true,
          name: "payer",
        },
      ],
      args: [
        {
          name: "updatedRoot",
          type: {
            array: ["u8", 32],
          },
        },
      ],
      docs: [
        "Updates an existing [MerkleDistributor]. This is used to support",
        "concurrent auctions where a creator wants to reuse a Participation NFT",
        "across multiple ongoing auctions using a single Master Edition mint.",
      ],
      name: "updateDistributor",
    },
    {
      accounts: [
        {
          docs: ["Mint PublicKey associated with the distributor."],
          isMut: false,
          isSigner: false,
          name: "mint",
        },
        {
          docs: ["[MerkleDistributor]."],
          isMut: false,
          isSigner: false,
          name: "distributor",
        },
        {
          docs: ["Creator authority who can update the distributor."],
          isMut: false,
          isSigner: false,
          name: "creatorAuthority",
        },
        {
          docs: ["Distributor containing the tokens to distribute."],
          isMut: true,
          isSigner: false,
          name: "distributorTokenAccount",
        },
        {
          docs: ["Account to send the claimed tokens to."],
          isMut: true,
          isSigner: false,
          name: "tokenReceiver",
        },
        {
          docs: ["Who is receiving the remaining rent allocation."],
          isMut: true,
          isSigner: false,
          name: "rentReceiver",
        },
        {
          docs: ["[GumdropConfig]."],
          isMut: false,
          isSigner: false,
          name: "gumdropConfig",
        },
        {
          isMut: false,
          isSigner: false,
          name: "configAuthority",
        },
        {
          isMut: false,
          isSigner: false,
          name: "tokenProgram",
        },
      ],
      args: [],
      docs: ["Closes distributor-owned token accounts."],
      name: "closeDistributorTokenAccount",
    },
    {
      accounts: [
        {
          docs: ["Mint PublicKey associated with the distributor."],
          isMut: false,
          isSigner: false,
          name: "mint",
        },
        {
          docs: ["[MerkleDistributor]."],
          isMut: true,
          isSigner: false,
          name: "distributor",
        },
        {
          docs: ["Creator authority who can update the distributor."],
          isMut: false,
          isSigner: false,
          name: "creatorAuthority",
        },
        {
          isMut: true,
          isSigner: false,
          name: "distributorWallet",
        },
        {
          docs: ["Who is receiving the remaining tokens and rent allocations."],
          isMut: false,
          isSigner: false,
          name: "receiver",
        },
        {
          docs: ["[GumdropConfig]."],
          isMut: false,
          isSigner: false,
          name: "gumdropConfig",
        },
        {
          isMut: false,
          isSigner: false,
          name: "configAuthority",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
      ],
      args: [
        {
          name: "walletBump",
          type: "u8",
        },
      ],
      docs: [
        "Closes an existing [MerkleDistributor].",
        "Moves all tokens from the [MerkleDistributor] to the specified account",
        "and closes distributor accounts.",
        "Must `close_distributor_token_account` first.",
      ],
      name: "closeDistributor",
    },
    {
      accounts: [
        {
          docs: ["[MerkleDistributor]."],
          isMut: true,
          isSigner: false,
          name: "distributor",
        },
        {
          docs: [
            "Status of the claim. Created on first invocation of this function.",
          ],
          isMut: true,
          isSigner: false,
          name: "claimCount",
        },
        {
          docs: ["The claimant who is claiming the limited edition print."],
          isMut: true,
          isSigner: true,
          name: "payer",
        },
        {
          docs: ["Master edition mint account."],
          isMut: false,
          isSigner: false,
          name: "masterEditionMint",
        },
        {
          docs: ["Master edition mint metadata account."],
          isMut: false,
          isSigner: false,
          name: "masterEditionMetadata",
        },
        {
          docs: ["Edition account of the master edition mint."],
          isMut: true,
          isSigner: false,
          name: "masterEditionPda",
        },
        {
          docs: ["New mint address for the claim limited edition print."],
          isMut: true,
          isSigner: false,
          name: "limitedEditionMint",
        },
        {
          docs: ["Metadata account of the new limited edition mint."],
          isMut: true,
          isSigner: false,
          name: "limitedEditionMetadata",
        },
        {
          docs: ["Edition account of the new limited edition mint."],
          isMut: true,
          isSigner: false,
          name: "limitedEditionPda",
        },
        {
          docs: ["Edition marker PDA."],
          isMut: true,
          isSigner: false,
          name: "editionMarkerPda",
        },
        {
          docs: ["Distributor token account for the master edition mint."],
          isMut: false,
          isSigner: false,
          name: "masterEditionTokenAccount",
        },
        {
          docs: ["The new mint authority (the claimant)."],
          isMut: false,
          isSigner: true,
          name: "limitedEditionMintAuthority",
        },
        {
          docs: [
            "Update authority for new metadata (should be original creator).",
          ],
          isMut: false,
          isSigner: false,
          name: "limitedEditionUpdateAuthority",
        },
        {
          docs: ["SPL [TokenMetadata] program."],
          isMut: false,
          isSigner: false,
          name: "tokenMetadataProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "tokenProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "rent",
        },
      ],
      args: [
        {
          name: "editionBump",
          type: "u8",
        },
        {
          name: "editionNumber",
          type: "u64",
        },
        {
          name: "amount",
          type: "u8",
        },
        {
          name: "proof",
          type: {
            vec: {
              array: ["u8", 32],
            },
          },
        },
      ],
      docs: ["Claims NFTs by calling MintNewEditionFromMasterEditionViaToken."],
      name: "claimEdition",
    },
  ],
  name: "formfn_gumdrop",
  version: "0.0.1",
};

export default FORMFN_GUMDROP_IDL;
