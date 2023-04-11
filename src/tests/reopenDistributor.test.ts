import { getEditionNumber } from "@bullistic-hq/bullistic-program-shared";
import logIfNotProd from "sdk/utils/logIfNotProd";
import assertMerkleRootsNotEqual from "tests/helpers/assertMerkleRootsNotEqual";
import getClaimantsListForTest from "tests/helpers/getClaimantsListForTest";
import getTestWallets from "tests/helpers/getTestWallets";
import setupAndTestPreTestConditions from "tests/helpers/setupAndTestPreTestConditions";
import testCloseDistributor from "tests/helpers/testCloseDistributor";
import testNewDistributor from "tests/helpers/testNewDistributor";
import testSubmitClaims from "tests/helpers/testSubmitClaims";
import assertPublicKeysEqual from "tests/utils/assertPublicKeysEqual";
import expectToThrow from "tests/utils/expectToThrow";

describe("Reopen a closed distributor", () => {
  it("A distributor can be recreated after being closed by a user.", async () => {
    const {
      claimants,
      configAuthority,
      connection,
      distributor,
      gumdropSdk,
      mint,
      wallet,
    } = await setupAndTestPreTestConditions({
      claimAmount: 1,
      numberOfClaimants: 3,
    });

    await testSubmitClaims(
      gumdropSdk,
      connection,
      wallet.publicKey,
      claimants,
      distributor,
      mint
    );

    const initialDistributorState =
      await gumdropSdk.program.account.merkleDistributor.fetch(distributor);

    await testCloseDistributor(
      {
        configAuthority,
        configCreatorAuthority: configAuthority.publicKey,
        distributor,
        mint,
        wallet,
      },
      {
        connection,
        gumdropSdk,
      }
    );

    const [otherKeypair, ...claimantWallets] = await getTestWallets(
      connection,
      3
    );

    const nextClaimants = getClaimantsListForTest(mint, claimantWallets, 1);

    logIfNotProd("Recreating distributor with other keypair should fail.");
    await expectToThrow(() =>
      testNewDistributor(
        {
          configAuthority: configAuthority.publicKey,
          mint,
          wallet: otherKeypair,
        },
        {
          claimants: nextClaimants,
          connection,
          expectedEdition: claimants.length,
          expectedMasterEditionSupply: claimants.length,
          gumdropSdk,
        }
      )
    );

    logIfNotProd(
      `Recreating distributor ${distributor.toBase58()} by initial creator.`
    );
    await testNewDistributor(
      {
        configAuthority: configAuthority.publicKey,
        mint,
        wallet,
      },
      {
        claimants: nextClaimants,
        connection,
        expectedEdition: claimants.length,
        expectedMasterEditionSupply: claimants.length,
        gumdropSdk,
      }
    );

    const newDistributorState =
      await gumdropSdk.program.account.merkleDistributor.fetch(distributor);

    const edition = await getEditionNumber(connection, mint);
    expect(edition).toBe(claimants.length);

    logIfNotProd("Submitting original set of claimants should fail.");
    await expectToThrow(() =>
      testSubmitClaims(
        gumdropSdk,
        connection,
        wallet.publicKey,
        claimants,
        distributor,
        mint
      )
    );

    logIfNotProd("Submitting new set of claims should succeed.");
    await testSubmitClaims(
      gumdropSdk,
      connection,
      wallet.publicKey,
      nextClaimants,
      distributor,
      mint
    );

    assertMerkleRootsNotEqual(
      initialDistributorState.root,
      newDistributorState.root
    );

    assertPublicKeysEqual(
      initialDistributorState.creatorAuthority,
      newDistributorState.creatorAuthority
    );

    assertPublicKeysEqual(
      initialDistributorState.mint,
      newDistributorState.mint
    );
  });
});
