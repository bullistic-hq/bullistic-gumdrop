import { PublicKey } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js";
import { GumdropProgram } from "sdk/idl";
import constructMerkleTree from "sdk/merkle-tree/constructMerkleTree";
import findDistributorPda from "sdk/pdas/findDistributorPda";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";
import ClaimantInfo from "sdk/types/ClaimantInfo";

type Accounts = {
  configAuthority: PublicKey;
  creatorAuthority: PublicKey;
  gumdropProgramId: PublicKey;
  mint: PublicKey;
  payer?: PublicKey;
  wallet: PublicKey;
};

type Args = {
  claimants: Array<ClaimantInfo>;
  program: GumdropProgram;
};

export default async function updateDistributorIx(
  {
    wallet,
    mint,
    payer,
    creatorAuthority,
    gumdropProgramId,
    configAuthority,
  }: Accounts,
  { claimants, program }: Args
): Promise<TransactionInstruction> {
  const { root } = constructMerkleTree(claimants, mint);
  const [gumdropConfig] = findGumdropConfigPda(
    configAuthority,
    gumdropProgramId
  );
  const [distributor] = findDistributorPda(
    mint,
    creatorAuthority,
    gumdropProgramId
  );
  return program.methods
    .updateDistributor([...root])
    .accounts({
      configAuthority,
      creatorAuthority,
      distributor,
      gumdropConfig,
      mint,
      payer: payer ?? wallet,
    })
    .instruction();
}
