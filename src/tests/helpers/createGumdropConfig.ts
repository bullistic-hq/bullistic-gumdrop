import { Connection, Keypair } from "@solana/web3.js";
import BullisticGumdropSdk from "sdk/BullisticGumdropSdk";
import logIfNotProd from "sdk/utils/logIfNotProd";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";

export default async function createGumdropConfig(
  gumdropSdk: BullisticGumdropSdk,
  connection: Connection,
  configAuthority: Keypair
) {
  const setGumdropConfigTx = await gumdropSdk.createGumdropConfigTx({
    configAuthority: configAuthority.publicKey,
    payer: configAuthority.publicKey,
  });
  await sendTransactionForTest(connection, setGumdropConfigTx, [
    configAuthority,
  ]);
  gumdropSdk.gumdropConfigCreator = configAuthority.publicKey;
  gumdropSdk.gumdropConfigAuthority = configAuthority.publicKey;
  logIfNotProd("Successfully created GumdropConfig");
}
