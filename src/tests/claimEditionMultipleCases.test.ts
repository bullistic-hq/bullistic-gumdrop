import { Keypair } from "@solana/web3.js";
import logIfNotProd from "sdk/utils/logIfNotProd";
import assertMasterEditionSupply from "tests/helpers/assertMasterEditionSupply";
import assertMerkleRootsNotEqual from "tests/helpers/assertMerkleRootsNotEqual";
import getClaimantsListForTest from "tests/helpers/getClaimantsListForTest";
import getTestWallets from "tests/helpers/getTestWallets";
import setupAndTestPreTestConditions from "tests/helpers/setupAndTestPreTestConditions";
import testSubmitClaims from "tests/helpers/testSubmitClaims";
import expectToThrow from "tests/utils/expectToThrow";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";

describe("ClaimEdition Multiple Cases", () => {
  it("A distributor supports valid claims and supports updating the claims list.", async () => {
    const {
      claimants,
      configAuthority,
      connection,
      distributor,
      gumdropSdk,
      mint,
      wallet,
    } = await setupAndTestPreTestConditions();

    // Should be zero editions minted currently.
    await assertMasterEditionSupply(connection, mint, 0);

    // Cutoff for initial set of valid claims before updating root.
    const cutoff = 5;

    // Checking initial set of valid claims.
    const initialClaims = claimants.slice(0, cutoff);
    await testSubmitClaims(
      gumdropSdk,
      connection,
      wallet.publicKey,
      initialClaims,
      distributor,
      mint
    );

    // Get a new set of test wallets.
    const secondaryWalletSet = await getTestWallets(connection, 15);
    const initialRemainingClaims = claimants.slice(cutoff);

    const secondaryClaimsList = getClaimantsListForTest(
      mint,
      secondaryWalletSet
    );

    // Construct new claims list (combine original remaining half and new ones).
    const updatedClaimsList = getClaimantsListForTest(
      mint,
      initialRemainingClaims.concat(secondaryClaimsList).map((c) => c.keypair)
    );

    // Get the root before updating the distributor
    const { root } = await gumdropSdk.program.account.merkleDistributor.fetch(
      distributor
    );

    logIfNotProd(
      "update_distributor without the original update_authority wallet should fail."
    );
    await expectToThrow(async () => {
      const otherWallet = Keypair.generate().publicKey;
      const updateTx = await gumdropSdk.updateDistributorTx(
        {
          configAuthority: configAuthority.publicKey,
          creatorAuthority: otherWallet,
          mint,
          wallet: otherWallet,
        },
        {
          claimants: updatedClaimsList,
        }
      );
      await sendTransactionForTest(connection, updateTx, [wallet]);
    });

    // Update gumdrop distributor merkle root based on new claimants list.
    const updateTx = await gumdropSdk.updateDistributorTx(
      {
        configAuthority: configAuthority.publicKey,
        creatorAuthority: wallet.publicKey,
        mint,
        wallet: wallet.publicKey,
      },
      {
        claimants: updatedClaimsList,
      }
    );
    await sendTransactionForTest(connection, updateTx, [wallet]);

    const updatedDistributorState =
      await gumdropSdk.program.account.merkleDistributor.fetch(distributor);
    logIfNotProd(
      `Successfully updated distributor with new merkle root: ${updatedDistributorState.root}`
    );

    // Sanity check the two roots are different.
    assertMerkleRootsNotEqual(root, updatedDistributorState.root);

    // Submit the new set of updated claimants.
    await testSubmitClaims(
      gumdropSdk,
      connection,
      wallet.publicKey,
      updatedClaimsList,
      distributor,
      mint
    );
  });
});
