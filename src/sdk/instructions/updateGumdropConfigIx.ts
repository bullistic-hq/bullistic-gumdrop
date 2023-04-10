import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { GumdropProgram } from "sdk/idl";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";

type Accounts = {
  configAuthority: PublicKey;
  configCreatorAuthority: PublicKey;
  gumdropProgramId: PublicKey;
  newAuthority: PublicKey;
  payer: PublicKey;
};

type Args = {
  program: GumdropProgram;
};

export default async function updateGumdropConfigIx(
  {
    configAuthority,
    configCreatorAuthority,
    gumdropProgramId,
    newAuthority,
    payer,
  }: Accounts,
  { program }: Args
): Promise<TransactionInstruction> {
  const [gumdropConfig] = findGumdropConfigPda(
    configCreatorAuthority,
    gumdropProgramId
  );
  return program.methods
    .updateGumdropConfig()
    .accounts({
      configAuthority,
      gumdropConfig,
      newAuthority,
      payer,
    })
    .instruction();
}
