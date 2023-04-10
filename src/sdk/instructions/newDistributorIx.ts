import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { GumdropProgram } from "sdk/idl";
import constructMerkleTree from "sdk/merkle-tree/constructMerkleTree";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";
import ClaimantInfo from "sdk/types/ClaimantInfo";

type Accounts = {
  configAuthority: PublicKey;
  creatorAuthority?: PublicKey;
  distributor: PublicKey;
  gumdropProgramId: PublicKey;
  mint: PublicKey;
  payer?: PublicKey;
  wallet: PublicKey;
};

type Args = {
  claimants: Array<ClaimantInfo>;
  distributorBump: number;
  program: GumdropProgram;
};

export default async function newDistributorIx(
  {
    distributor,
    wallet,
    mint,
    payer,
    gumdropProgramId,
    creatorAuthority,
    configAuthority,
  }: Accounts,
  { claimants, distributorBump, program }: Args
): Promise<TransactionInstruction> {
  const { root } = constructMerkleTree(claimants, mint);
  const [gumdropConfig] = findGumdropConfigPda(
    configAuthority,
    gumdropProgramId
  );
  return program.methods
    .newDistributor(distributorBump, [...root])
    .accounts({
      configAuthority,
      creatorAuthority: creatorAuthority ?? wallet,
      distributor,
      gumdropConfig,
      mint,
      payer: payer ?? wallet,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
