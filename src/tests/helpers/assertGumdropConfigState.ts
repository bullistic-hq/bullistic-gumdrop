import { PublicKey } from "@solana/web3.js";
import BullisticGumdropSdk from "sdk/BullisticGumdropSdk";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";
import assertPublicKeysEqual from "tests/utils/assertPublicKeysEqual";

export default async function assertGumdropConfigState(
  gumdropSdk: BullisticGumdropSdk,
  creator: PublicKey,
  authority: PublicKey
) {
  const [gumdropConfigPda] = findGumdropConfigPda(
    creator,
    gumdropSdk.programId
  );
  const config = await gumdropSdk.program.account.gumdropConfig.fetch(
    gumdropConfigPda
  );

  assertPublicKeysEqual(config.configCreator, creator);
  assertPublicKeysEqual(config.configAuthority, authority);
}
