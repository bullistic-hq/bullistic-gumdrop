import { findAtaPda } from "@formfunction-hq/formfunction-program-shared";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { GumdropProgram } from "sdk/idl";
import findDistributorPda from "sdk/pdas/findDistributorPda";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";

type Accounts = {
  configAuthority: PublicKey;
  configCreatorAuthority: PublicKey;
  creatorAuthority: PublicKey;
  gumdropProgramId: PublicKey;
  mint: PublicKey;
  rentReceiver?: PublicKey;
  tokenReceiver: PublicKey;
  wallet: PublicKey;
};

type Args = {
  program: GumdropProgram;
};

export default async function closeDistributorAtaIx(
  {
    wallet,
    mint,
    tokenReceiver,
    rentReceiver,
    creatorAuthority,
    configAuthority,
    gumdropProgramId,
    configCreatorAuthority,
  }: Accounts,
  { program }: Args
): Promise<TransactionInstruction> {
  const [distributor] = findDistributorPda(
    mint,
    creatorAuthority,
    gumdropProgramId
  );
  const [distributorTokenAccount] = findAtaPda(distributor, mint);
  const [walletTokenAccount] = findAtaPda(tokenReceiver, mint);
  const [gumdropConfig] = findGumdropConfigPda(
    configCreatorAuthority,
    gumdropProgramId
  );

  return program.methods
    .closeDistributorTokenAccount()
    .accounts({
      configAuthority,
      creatorAuthority,
      distributor,
      distributorTokenAccount,
      gumdropConfig,
      mint,
      rentReceiver: rentReceiver ?? wallet,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenReceiver: walletTokenAccount,
    })
    .instruction();
}
