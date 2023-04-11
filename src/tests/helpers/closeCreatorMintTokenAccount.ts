import {
  createCloseAtaIx,
  ixsToTx,
} from "@bullistic-hq/bullistic-program-shared";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import logIfNotProd from "sdk/utils/logIfNotProd";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";

type Accounts = {
  mint: PublicKey;
  wallet: Keypair;
};

type Args = {
  connection: Connection;
};

export default async function closeCreatorMintTokenAccount(
  { mint, wallet }: Accounts,
  { connection }: Args
) {
  const tx = await createCloseAtaIx(mint, wallet.publicKey);
  await sendTransactionForTest(connection, ixsToTx([tx]), [wallet]);
  logIfNotProd(`Successfully closed owner token account`);
}
