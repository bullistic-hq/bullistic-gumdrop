import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { GumdropProgram } from "sdk/idl";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";

type Accounts = {
  configAuthority: PublicKey;
  configCreator?: PublicKey;
  gumdropProgramId: PublicKey;
  payer: PublicKey;
};

type Args = {
  program: GumdropProgram;
};

export default async function createGumdropConfigIx(
  { payer, configCreator, configAuthority, gumdropProgramId }: Accounts,
  { program }: Args
): Promise<TransactionInstruction> {
  const [gumdropConfig, bump] = findGumdropConfigPda(
    configAuthority,
    gumdropProgramId
  );
  return program.methods
    .createGumdropConfig(bump)
    .accounts({
      configAuthority,
      configCreator: configCreator ?? configAuthority,
      gumdropConfig,
      payer,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}
