import { PublicKey } from "@solana/web3.js";
import FormfnGumdropSdk from "sdk/FormfnGumdropSdk";
import findGumdropConfigPda from "sdk/pdas/findGumdropConfigPda";
import assertPublicKeysEqual from "tests/utils/assertPublicKeysEqual";

export default async function assertGumdropConfigState(
  gumdropSdk: FormfnGumdropSdk,
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
