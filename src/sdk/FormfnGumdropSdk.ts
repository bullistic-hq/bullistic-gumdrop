import {
  AnchorWallet,
  createAccountIx,
  createAtaIx,
  createMintIx,
  createMintToIx,
  createTransferIx,
  Environment,
  filterNulls,
  findAtaPda,
  getEditionNumber,
  ixsToTx,
} from "@formfunction-hq/formfunction-program-shared";
import createAtaIxIfNotExists from "@formfunction-hq/formfunction-program-shared/dist/instructions/createAtaIxIfNotExists";
import { AnchorProvider, Idl, Program } from "@project-serum/anchor";
import { MintLayout } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { FORMFN_GUMDROP_IDL, GumdropProgram } from "sdk/idl";
import { FormfnGumdrop } from "sdk/idl/FormfnGumdrop";
import claimEditionIx from "sdk/instructions/claimEditionIx";
import closeDistributorAtaIx from "sdk/instructions/closeDistributorAtaIx";
import closeDistributorIx from "sdk/instructions/closeDistributorIx";
import createGumdropConfigIx from "sdk/instructions/createGumdropConfigIx";
import newDistributorIx from "sdk/instructions/newDistributorIx";
import updateDistributorIx from "sdk/instructions/updateDistributorIx";
import updateGumdropConfigIx from "sdk/instructions/updateGumdropConfigIx";
import findDistributorPda from "sdk/pdas/findDistributorPda";
import ClaimantInfo from "sdk/types/ClaimantInfo";
import ClaimantWithProof from "sdk/types/ClaimantWithProof";
import getProgramIdsFromEnvironment from "sdk/utils/getProgramIdsFromEnvironment";

export default class FormfnGumdropSdk {
  private _connection: Connection;

  private _idl: Idl = FORMFN_GUMDROP_IDL;

  private _program: GumdropProgram;

  private _gumdropConfigCreator: PublicKey;

  private _gumdropConfigAuthority: PublicKey;

  private _gumdropProgramId: PublicKey;

  constructor({
    connection,
    environment,
    wallet,
  }: {
    connection: Connection;
    environment: Environment;
    wallet: AnchorWallet;
  }) {
    this._connection = connection;

    const programIds = getProgramIdsFromEnvironment(environment);

    this._gumdropConfigCreator = programIds.gumdropConfigCreator;
    this._gumdropConfigAuthority = programIds.gumdropConfigAuthority;
    this._gumdropProgramId = programIds.gumdropProgramId;

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "recent",
    });

    this._program = new Program<FormfnGumdrop>(
      // Don't know why the types don't match.
      FORMFN_GUMDROP_IDL as any,
      this._gumdropProgramId,
      provider
    );
  }

  get connection() {
    return this._connection;
  }

  get idl() {
    return this._idl;
  }

  get program() {
    return this._program;
  }

  get programId() {
    return this._gumdropProgramId;
  }

  get gumdropConfigCreator() {
    const configCreator = this._gumdropConfigCreator;

    // Shouldn't happen, but check anyway to stop clients from using
    // uninitialized values.
    if (configCreator.toBase58() === PublicKey.default.toBase58()) {
      throw new Error("GumdropSDK configCreator is not defined yet.");
    }

    return configCreator;
  }

  set gumdropConfigCreator(gumdropConfigCreator: PublicKey) {
    this._gumdropConfigCreator = gumdropConfigCreator;
  }

  get gumdropConfigAuthority() {
    const configAuthority = this._gumdropConfigAuthority;

    // Shouldn't happen, but check anyway to stop clients from using
    // uninitialized values.
    if (configAuthority.toBase58() === PublicKey.default.toBase58()) {
      throw new Error("GumdropSDK configAuthority is not defined yet.");
    }

    return configAuthority;
  }

  set gumdropConfigAuthority(gumdropConfigAuthority: PublicKey) {
    this._gumdropConfigAuthority = gumdropConfigAuthority;
  }

  async claimEditionTx(
    accounts: {
      distributor: PublicKey;
      limitedEditionUpdateAuthority: PublicKey;
      mint: PublicKey;
      newMint: PublicKey;
      payer?: PublicKey;
      wallet: PublicKey;
    },
    args: {
      claimant: ClaimantWithProof;
      edition: number;
    }
  ): Promise<Transaction> {
    const {
      distributor,
      limitedEditionUpdateAuthority,
      mint,
      wallet,
      payer,
      newMint,
    } = accounts;
    const { claimant, edition } = args;

    const [[newMintAta], createTokenAccountIx, minRentLamports] =
      await Promise.all([
        findAtaPda(wallet, newMint),
        createAtaIx(newMint, wallet, wallet),
        this.connection.getMinimumBalanceForRentExemption(MintLayout.span),
      ]);

    const createAccount = createAccountIx(wallet, newMint, minRentLamports);
    const initMint = createMintIx({
      mint: newMint,
      wallet,
    });
    const mintToIx = createMintToIx(newMint, newMintAta, wallet, [], 1);

    const claimEdition = await claimEditionIx(
      {
        distributor,
        gumdropProgramId: this.programId,
        limitedEditionUpdateAuthority,
        mint,
        newMint,
        payer,
        wallet,
      },
      { claimant, edition, program: this.program }
    );

    return ixsToTx([
      createAccount,
      initMint,
      createTokenAccountIx,
      mintToIx,
      claimEdition,
    ]);
  }

  async closeDistributorTx(accounts: {
    configAuthority: PublicKey;
    configCreatorAuthority: PublicKey;
    creatorAuthority: PublicKey;
    mint: PublicKey;
    rentReceiver?: PublicKey;
    tokenReceiver: PublicKey;
    wallet: PublicKey;
  }): Promise<Transaction> {
    const {
      configAuthority,
      configCreatorAuthority,
      creatorAuthority,
      mint,
      rentReceiver,
      tokenReceiver,
      wallet,
    } = accounts;

    const ixs = await Promise.all([
      createAtaIxIfNotExists(this.connection, tokenReceiver, mint, wallet),
      closeDistributorAtaIx(
        {
          configAuthority,
          configCreatorAuthority,
          creatorAuthority,
          gumdropProgramId: this.programId,
          mint,
          rentReceiver,
          tokenReceiver,
          wallet,
        },
        {
          program: this.program,
        }
      ),
      closeDistributorIx(
        {
          configAuthority,
          configCreatorAuthority,
          creatorAuthority,
          gumdropProgramId: this.programId,
          mint,
          wallet,
        },
        { program: this.program }
      ),
    ]);

    return ixsToTx(filterNulls(ixs));
  }

  async createGumdropConfigTx(accounts: {
    configAuthority: PublicKey;
    payer: PublicKey;
  }): Promise<Transaction> {
    const { payer, configAuthority } = accounts;
    const createGumdropConfig = await createGumdropConfigIx(
      {
        configAuthority,
        gumdropProgramId: this.programId,
        payer,
      },
      { program: this.program }
    );
    return ixsToTx([createGumdropConfig]);
  }

  async findDistributorPda(mint: PublicKey, creatorAuthority: PublicKey) {
    return findDistributorPda(mint, creatorAuthority, this.programId);
  }

  async findNextEditionNumber(mint: PublicKey) {
    const edition = await getEditionNumber(this.connection, mint);
    return edition + 1;
  }

  async newDistributorAndTransferMasterEditionTx(
    accounts: {
      configAuthority: PublicKey;
      creatorAuthority?: PublicKey;
      mint: PublicKey;
      payer?: PublicKey;
      wallet: PublicKey;
    },
    args: {
      claimants: Array<ClaimantInfo>;
    }
  ): Promise<Transaction> {
    const [newDistributorIxs, transferIxs] = (
      await Promise.all([
        this.newDistributorTx(accounts, args),
        this.transferMasterEditionToDistributorTx({
          mint: accounts.mint,
          wallet: accounts.wallet,
        }),
      ])
    ).map((tx) => tx.instructions);

    return ixsToTx([...newDistributorIxs, ...transferIxs]);
  }

  async newDistributorTx(
    accounts: {
      configAuthority: PublicKey;
      creatorAuthority?: PublicKey;
      mint: PublicKey;
      payer?: PublicKey;
      wallet: PublicKey;
    },
    args: {
      claimants: Array<ClaimantInfo>;
    }
  ): Promise<Transaction> {
    const { wallet, mint, payer, creatorAuthority, configAuthority } = accounts;
    const { claimants } = args;
    const [distributor, distributorBump] = findDistributorPda(
      mint,
      wallet,
      this.programId
    );
    const newDistributor = await newDistributorIx(
      {
        configAuthority,
        creatorAuthority,
        distributor,
        gumdropProgramId: this.programId,
        mint,
        payer,
        wallet,
      },
      {
        claimants,
        distributorBump,
        program: this.program,
      }
    );
    return ixsToTx([newDistributor]);
  }

  async transferMasterEditionToDistributorTx(accounts: {
    mint: PublicKey;
    wallet: PublicKey;
  }): Promise<Transaction> {
    const { wallet, mint } = accounts;
    const [distributor] = findDistributorPda(mint, wallet, this.programId);

    const transferMasterEdition = await createTransferIx(
      mint,
      distributor,
      wallet,
      wallet,
      [],
      1
    );

    const [ata] = findAtaPda(distributor, mint);
    const accountInfo = await this.connection.getAccountInfo(ata);

    // It's technically possible ata is already created, in which case we
    // don't need the createAtaIx here.
    if (accountInfo == null) {
      const createDistributorTokenAccount = await createAtaIx(
        mint,
        distributor,
        wallet
      );
      return ixsToTx([createDistributorTokenAccount, transferMasterEdition]);
    } else {
      return ixsToTx([transferMasterEdition]);
    }
  }

  async updateDistributorTx(
    accounts: {
      configAuthority: PublicKey;
      creatorAuthority: PublicKey;
      mint: PublicKey;
      payer?: PublicKey;
      wallet: PublicKey;
    },
    args: {
      claimants: Array<ClaimantInfo>;
    }
  ): Promise<Transaction> {
    const { mint, creatorAuthority, configAuthority, wallet, payer } = accounts;
    const { claimants } = args;
    const updateDistributor = await updateDistributorIx(
      {
        configAuthority,
        creatorAuthority,
        gumdropProgramId: this.programId,
        mint,
        payer,
        wallet,
      },
      { claimants, program: this.program }
    );
    return ixsToTx([updateDistributor]);
  }

  async updateGumdropConfigTx(accounts: {
    configAuthority: PublicKey;
    configCreatorAuthority: PublicKey;
    newAuthority: PublicKey;
    payer: PublicKey;
  }): Promise<Transaction> {
    const { payer, newAuthority, configAuthority, configCreatorAuthority } =
      accounts;
    const updateGumdropConfig = await updateGumdropConfigIx(
      {
        configAuthority,
        configCreatorAuthority,
        gumdropProgramId: this.programId,
        newAuthority,
        payer,
      },
      { program: this.program }
    );
    return ixsToTx([updateGumdropConfig]);
  }
}
