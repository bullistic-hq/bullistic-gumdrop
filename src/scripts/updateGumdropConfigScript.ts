import { Environment } from "@bullistic-hq/bullistic-program-shared";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import getConfigAuthorityKeypair from "scripts/getConfigAuthorityKeypair";
import getUpdateConfigAuthorityKeypair from "scripts/getUpdateConfigAuthorityKeypair";
import getConnectionAndSdk from "sdk/utils/getConnectionAndSdk";
import invariant from "tiny-invariant";

async function updateGumdropConfigScript() {
  const { connection, environment, gumdropSdk } = getConnectionAndSdk();

  invariant(
    environment === Environment.Development ||
      environment === Environment.Testnet ||
      environment === Environment.Production
  );
  const configAuthority = getConfigAuthorityKeypair(environment);
  const updateConfigAuthority = getUpdateConfigAuthorityKeypair(environment);
  console.log(
    `Updating ${environment} config authority from authority ${
      configAuthority.publicKey
    } to ${updateConfigAuthority.publicKey.toBase58()}`
  );
  console.log("Note: This account needs to be funded with SOL.");

  const setGumdropConfigTx = await gumdropSdk.updateGumdropConfigTx({
    configAuthority: configAuthority.publicKey,
    configCreatorAuthority: gumdropSdk.gumdropConfigCreator,
    newAuthority: updateConfigAuthority.publicKey,
    payer: configAuthority.publicKey,
  });

  const txid = await sendAndConfirmTransaction(connection, setGumdropConfigTx, [
    configAuthority,
  ]);
  console.log(`Transaction submitted, txid: ${txid}`);
}

updateGumdropConfigScript();
