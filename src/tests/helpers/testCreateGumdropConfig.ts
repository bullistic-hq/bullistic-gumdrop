import { Connection, Keypair } from "@solana/web3.js";
import BullisticGumdropSdk from "sdk/BullisticGumdropSdk";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";
import logIfNotProd from "sdk/utils/logIfNotProd";
import createGumdropConfig from "tests/helpers/createGumdropConfig";
import assertPublicKeysEqual from "tests/utils/assertPublicKeysEqual";
import expectToThrow from "tests/utils/expectToThrow";

export default async function testCreateGumdropConfig(
  gumdropSdk: BullisticGumdropSdk,
  connection: Connection,
  configAuthority: Keypair
) {
  await createGumdropConfig(gumdropSdk, connection, configAuthority);

  expectToThrow(
    async () =>
      await createGumdropConfig(gumdropSdk, connection, configAuthority)
  );
  logIfNotProd("Trying to reinitialize GumdropConfig fails");

  const [gumdropConfigPda] = findGumdropConfigPda(
    configAuthority.publicKey,
    gumdropSdk.programId
  );

  const gumdropConfig = await gumdropSdk.program.account.gumdropConfig.fetch(
    gumdropConfigPda
  );

  assertPublicKeysEqual(
    gumdropConfig.configAuthority,
    configAuthority.publicKey
  );
  assertPublicKeysEqual(gumdropConfig.configCreator, configAuthority.publicKey);
}
