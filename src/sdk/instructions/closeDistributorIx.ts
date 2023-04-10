import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { GumdropProgram } from "sdk/idl";
import findDistributorPda from "sdk/pdas/findDistributorPda";
import findDistributorWalletPda from "sdk/pdas/findDistributorWalletPda";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";

type Accounts = {
  configAuthority: PublicKey;
  configCreatorAuthority: PublicKey;
  creatorAuthority: PublicKey;
  gumdropProgramId: PublicKey;
  mint: PublicKey;
  receiver?: PublicKey;
  wallet: PublicKey;
};

type Args = {
  program: GumdropProgram;
};

export default async function closeDistributorIx(
  {
    configAuthority,
    configCreatorAuthority,
    creatorAuthority,
    mint,
    receiver,
    wallet,
    gumdropProgramId,
  }: Accounts,
  { program }: Args
): Promise<TransactionInstruction> {
  const [distributor] = findDistributorPda(
    mint,
    creatorAuthority,
    gumdropProgramId
  );

  const [gumdropConfig] = findGumdropConfigPda(
    configCreatorAuthority,
    gumdropProgramId
  );
  const [distributorWallet, distributorWalletBump] = findDistributorWalletPda(
    distributor,
    gumdropProgramId
  );
  return program.methods
    .closeDistributor(distributorWalletBump)
    .accounts({
      configAuthority,
      creatorAuthority: creatorAuthority ?? wallet,
      distributor,
      distributorWallet,
      gumdropConfig,
      mint,
      receiver: receiver ?? wallet,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
