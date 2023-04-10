import { Environment } from "@formfunction-hq/formfunction-program-shared";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import getConfigAuthorityKeypair from "scripts/getConfigAuthorityKeypair";
import getConnectionAndSdk from "sdk/utils/getConnectionAndSdk";
import invariant from "tiny-invariant";

async function createGumdropConfigScript() {
  const { connection, environment, gumdropSdk } = getConnectionAndSdk();

  invariant(
    environment === Environment.Development ||
      environment === Environment.Testnet ||
      environment === Environment.Production
  );
  const configAuthority = getConfigAuthorityKeypair(environment);
  console.log(
    `Setting ${environment} config authority pubkey: ${configAuthority.publicKey.toBase58()}`
  );
  console.log("Note: This account needs to be funded with SOL.");

  const setGumdropConfigTx = await gumdropSdk.createGumdropConfigTx({
    configAuthority: configAuthority.publicKey,
    payer: configAuthority.publicKey,
  });

  const txid = await sendAndConfirmTransaction(connection, setGumdropConfigTx, [
    configAuthority,
  ]);
  console.log(`Transaction submitted, txid: ${txid}`);
}

createGumdropConfigScript();
