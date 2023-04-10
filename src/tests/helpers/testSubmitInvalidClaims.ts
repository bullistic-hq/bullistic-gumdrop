import { Connection, PublicKey } from "@solana/web3.js";
import FormfnGumdropSdk from "sdk/FormfnGumdropSdk";
import logIfNotProd from "sdk/utils/logIfNotProd";
import submitClaimEditionTransaction from "tests/helpers/submitClaimEditionTransaction";
import { ClaimantInfoForTest } from "tests/types/ClaimantInfoForTest";
import expectToThrow from "tests/utils/expectToThrow";

export default async function testSubmitInvalidClaims(
  gumdropSdk: FormfnGumdropSdk,
  connection: Connection,
  limitedEditionUpdateAuthority: PublicKey,
  claimants: Array<ClaimantInfoForTest>,
  distributor: PublicKey,
  mint: PublicKey
) {
  await Promise.all(
    claimants.map(async (claimant) => {
      await expectToThrow(async () => {
        await submitClaimEditionTransaction(
          gumdropSdk,
          connection,
          limitedEditionUpdateAuthority,
          claimant,
          distributor,
          mint
        );
      });
    })
  );

  logIfNotProd(`${claimants.length} invalid claims rejected.`);
}
