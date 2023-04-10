import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import FormfnGumdropSdk from "sdk/FormfnGumdropSdk";
import logIfNotProd from "sdk/utils/logIfNotProd";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";

type Accounts = {
  configAuthority: Keypair;
  configCreatorAuthority: PublicKey;
  mint: PublicKey;
  wallet: Keypair;
};

type Args = {
  connection: Connection;
  gumdropSdk: FormfnGumdropSdk;
  shouldConfigAuthorityClose?: boolean;
};

export default async function closeDistributor(
  { configAuthority, configCreatorAuthority, mint, wallet }: Accounts,
  { gumdropSdk, connection, shouldConfigAuthorityClose = false }: Args
) {
  const closeDistributorTx = await gumdropSdk.closeDistributorTx({
    configAuthority: configAuthority.publicKey,
    configCreatorAuthority,
    creatorAuthority: wallet.publicKey,
    mint,
    tokenReceiver: wallet.publicKey,
    wallet: wallet.publicKey,
  });
  const signer = shouldConfigAuthorityClose ? configAuthority : wallet;
  await sendTransactionForTest(connection, closeDistributorTx, [signer]);
  logIfNotProd(
    `Successfully closed distributor using wallet: ${signer.publicKey.toBase58()}`
  );
}
