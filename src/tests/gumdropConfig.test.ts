import { requestAirdrops } from "@bullistic-hq/bullistic-program-shared";
import { Keypair } from "@solana/web3.js";
import logIfNotProd from "sdk/utils/logIfNotProd";
import assertGumdropConfigState from "tests/helpers/assertGumdropConfigState";
import getTestWallets from "tests/helpers/getTestWallets";
import setupAndTestPreTestConditions from "tests/helpers/setupAndTestPreTestConditions";
import testCloseDistributor from "tests/helpers/testCloseDistributor";
import expectToThrow from "tests/utils/expectToThrow";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";

describe("GumdropConfig", () => {
  it("A global authority account can be set and used to update and close a distributor.", async () => {
    const {
      claimants,
      configAuthority,
      connection,
      distributor,
      gumdropSdk,
      mint,
      wallet,
    } = await setupAndTestPreTestConditions();

    const updateTx = await gumdropSdk.updateDistributorTx(
      {
        configAuthority: configAuthority.publicKey,
        creatorAuthority: wallet.publicKey,
        mint,
        wallet: configAuthority.publicKey,
      },
      {
        claimants,
      }
    );

    await sendTransactionForTest(connection, updateTx, [configAuthority]);
    logIfNotProd("Successfully updated distributor using configAuthority.");

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
        shouldConfigAuthorityClose: true,
      }
    );
    logIfNotProd("GumdropConfig configAuthority closed distributor.");
  });

  it("The GumdropConfig config_authority can be updated by the original authority.", async () => {
    const {
      configAuthority,
      connection,
      distributor,
      gumdropSdk,
      mint,
      wallet,
    } = await setupAndTestPreTestConditions();

    const [newAuthority, invalidAuthority] = await getTestWallets(
      connection,
      2
    );

    logIfNotProd(
      "Updating the GumdropConfig without the original signer should fail."
    );
    await expectToThrow(async () => {
      await requestAirdrops({ connection, wallets: [invalidAuthority] });
      const updateTx = await gumdropSdk.updateGumdropConfigTx({
        configAuthority: invalidAuthority.publicKey,
        configCreatorAuthority: configAuthority.publicKey,
        newAuthority: invalidAuthority.publicKey,
        payer: configAuthority.publicKey,
      });

      await sendTransactionForTest(connection, updateTx, [invalidAuthority]);
    });

    await assertGumdropConfigState(
      gumdropSdk,
      configAuthority.publicKey,
      configAuthority.publicKey
    );

    const updateTx = await gumdropSdk.updateGumdropConfigTx({
      configAuthority: configAuthority.publicKey,
      configCreatorAuthority: configAuthority.publicKey,
      newAuthority: newAuthority.publicKey,
      payer: configAuthority.publicKey,
    });

    await sendTransactionForTest(connection, updateTx, [configAuthority]);
    logIfNotProd("Successfully updated GumdropConfig using configAuthority.");

    await assertGumdropConfigState(
      gumdropSdk,
      configAuthority.publicKey,
      newAuthority.publicKey
    );

    await testCloseDistributor(
      {
        configAuthority: newAuthority,
        configCreatorAuthority: configAuthority.publicKey,
        distributor,
        mint,
        wallet,
      },
      {
        connection,
        gumdropSdk,
        shouldConfigAuthorityClose: true,
      }
    );
    logIfNotProd("GumdropConfig configAuthority closed distributor.");
  });

  it("Trying to update a distributor fails with wrong accounts or signers.", async () => {
    const { claimants, configAuthority, connection, gumdropSdk, mint, wallet } =
      await setupAndTestPreTestConditions();

    const invalidAuthority = Keypair.generate();
    await requestAirdrops({ connection, wallets: [invalidAuthority] });

    // Invalid accounts, valid signer.
    await expectToThrow(async () => {
      const updateTx = await gumdropSdk.updateDistributorTx(
        {
          configAuthority: invalidAuthority.publicKey,
          creatorAuthority: wallet.publicKey,
          mint,
          wallet: wallet.publicKey,
        },
        {
          claimants,
        }
      );

      await sendTransactionForTest(connection, updateTx, [configAuthority]);
    });

    // Correct wallet, invalid signer.
    await expectToThrow(async () => {
      const updateTx = await gumdropSdk.updateDistributorTx(
        {
          configAuthority: configAuthority.publicKey,
          creatorAuthority: wallet.publicKey,
          mint,
          wallet: configAuthority.publicKey,
        },
        {
          claimants,
        }
      );

      await sendTransactionForTest(connection, updateTx, [invalidAuthority]);
    });
  });
});
