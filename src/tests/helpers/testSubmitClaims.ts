import {
  findEditionPda,
  forEachAsync,
  getEditionNumber,
  getLimitedEdition,
  getMasterEditionSupply,
  range,
} from "@formfunction-hq/formfunction-program-shared";
import { Connection, PublicKey } from "@solana/web3.js";
import FormfnGumdropSdk from "sdk/FormfnGumdropSdk";
import logIfNotProd from "sdk/utils/logIfNotProd";
import assertMasterEditionSupply from "tests/helpers/assertMasterEditionSupply";
import assertTokenOwnerHasAmount from "tests/helpers/assertTokenOwnerHasAmount";
import getTotalClaimAmount from "tests/helpers/getTotalClaimedAmount";
import submitClaimEditionTransaction from "tests/helpers/submitClaimEditionTransaction";
import { ClaimantInfoForTest } from "tests/types/ClaimantInfoForTest";
import assertPublicKeysEqual from "tests/utils/assertPublicKeysEqual";

/**
 * NOTE: Claims must be processed sequentially since edition is tracked on
 * chain. If two users tried to claim the same edition, the second tx would
 * fail.
 */
export default async function testSubmitClaims(
  gumdropSdk: FormfnGumdropSdk,
  connection: Connection,
  limitedEditionUpdateAuthority: PublicKey,
  claimants: Array<ClaimantInfoForTest>,
  distributor: PublicKey,
  mint: PublicKey
) {
  const initialSupply = await getMasterEditionSupply(connection, mint);

  await forEachAsync(claimants, async (claimant) => {
    const amountRange = range(claimant.amount);
    await forEachAsync(amountRange, async () => {
      const edition = await getEditionNumber(connection, mint);

      const newMint = await submitClaimEditionTransaction(
        gumdropSdk,
        connection,
        limitedEditionUpdateAuthority,
        claimant,
        distributor,
        mint
      );

      assertTokenOwnerHasAmount(
        connection,
        newMint.publicKey,
        claimant.address,
        1
      );

      const expectedEdition = edition + 1;

      const [masterEditionPda] = findEditionPda(mint);
      const print = await getLimitedEdition(connection, newMint.publicKey);
      assertPublicKeysEqual(new PublicKey(print.parent), masterEditionPda);
      expect(
        typeof print.edition === "number"
          ? print.edition
          : print.edition.toNumber()
      ).toBe(expectedEdition);
      expect(await getEditionNumber(connection, mint)).toBe(expectedEdition);
    });

    logIfNotProd(
      `Submitted ${amountRange.length} claims for claimant ${claimant.address} successfully.`
    );
  });

  const totalClaimantAmount = getTotalClaimAmount(claimants);
  const expectedSupply = totalClaimantAmount + initialSupply;
  await assertMasterEditionSupply(connection, mint, expectedSupply);
}
