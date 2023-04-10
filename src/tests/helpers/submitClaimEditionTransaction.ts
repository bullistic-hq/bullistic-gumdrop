import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import FormfnGumdropSdk from "sdk/FormfnGumdropSdk";
import { ClaimantInfoForTest } from "tests/types/ClaimantInfoForTest";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";

export default async function submitClaimEditionTransaction(
  gumdropSdk: FormfnGumdropSdk,
  connection: Connection,
  limitedEditionUpdateAuthority: PublicKey,
  claimant: ClaimantInfoForTest,
  distributor: PublicKey,
  mint: PublicKey
) {
  const newMint = Keypair.generate();
  const edition = await gumdropSdk.findNextEditionNumber(mint);
  const claimTx = await gumdropSdk.claimEditionTx(
    {
      distributor,
      limitedEditionUpdateAuthority,
      mint,
      newMint: newMint.publicKey,
      wallet: claimant.keypair.publicKey,
    },
    {
      claimant,
      edition,
    }
  );

  await sendTransactionForTest(connection, claimTx, [
    claimant.keypair,
    newMint,
  ]);

  return newMint;
}
