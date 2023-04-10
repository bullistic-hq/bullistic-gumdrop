import { getEditionNumber } from "@formfunction-hq/formfunction-program-shared";
import { Keypair, PublicKey } from "@solana/web3.js";
import assertMasterEditionSupply from "tests/helpers/assertMasterEditionSupply";
import getClaimantsListForTest from "tests/helpers/getClaimantsListForTest";
import getTestWallets from "tests/helpers/getTestWallets";
import setupAndTestPreTestConditions from "tests/helpers/setupAndTestPreTestConditions";
import testSubmitClaims from "tests/helpers/testSubmitClaims";
import testSubmitInvalidClaims from "tests/helpers/testSubmitInvalidClaims";
import { ClaimantInfoForTest } from "tests/types/ClaimantInfoForTest";

describe("ClaimEdition Invalid Cases", () => {
  it("The distributor rejects invalid claim attempts.", async () => {
    const { mint, claimants, distributor, connection, gumdropSdk, wallet } =
      await setupAndTestPreTestConditions();

    // Helper for submitting invalid claims.
    const submitInvalidClaims = (
      claimantsList: Array<ClaimantInfoForTest>,
      mintPubkey: PublicKey = mint,
      distributorPubkey: PublicKey = distributor
    ) => {
      return testSubmitInvalidClaims(
        gumdropSdk,
        connection,
        wallet.publicKey,
        claimantsList,
        distributorPubkey,
        mintPubkey
      );
    };

    const edition = await getEditionNumber(connection, mint);

    const invalidClaimantWallets = await getTestWallets(
      connection,
      claimants.length
    );

    const invalidClaimantList = getClaimantsListForTest(
      mint,
      invalidClaimantWallets,
      1
    );
    await submitInvalidClaims(invalidClaimantList);

    // Change the claim amount to an invalid amount.
    const invalidClaimantListByAmount = claimants.map((claimant) => ({
      ...claimant,
      amount: 10,
    }));

    await submitInvalidClaims(invalidClaimantListByAmount);

    // Using a different mint address fails.
    await submitInvalidClaims(claimants, Keypair.generate().publicKey);

    // Using a different distributor address fails.
    await submitInvalidClaims(claimants, mint, Keypair.generate().publicKey);

    expect(await getEditionNumber(connection, mint)).toBe(edition);

    // Check no editions have been printed.
    await assertMasterEditionSupply(connection, mint, 0);

    // Now submit the valid claims.
    await testSubmitClaims(
      gumdropSdk,
      connection,
      wallet.publicKey,
      claimants,
      distributor,
      mint
    );

    // Try resubmitting initial valid claimants and expect failure.
    await submitInvalidClaims(claimants, mint);
  });
});
