import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import FormfnGumdropSdk from "sdk/FormfnGumdropSdk";
import ClaimantInfo from "sdk/types/ClaimantInfo";
import logIfNotProd from "sdk/utils/logIfNotProd";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";

export default async function createNewDistributor(
  gumdropSdk: FormfnGumdropSdk,
  connection: Connection,
  mint: PublicKey,
  wallet: Keypair,
  configAuthority: PublicKey,
  claimants: Array<ClaimantInfo>
) {
  const newDistributorTx =
    await gumdropSdk.newDistributorAndTransferMasterEditionTx(
      {
        configAuthority: configAuthority,
        mint,
        wallet: wallet.publicKey,
      },
      {
        claimants,
      }
    );
  logIfNotProd(
    "Successfully created new distributor and transferred master edition"
  );
  await sendTransactionForTest(connection, newDistributorTx, [wallet]);
}
