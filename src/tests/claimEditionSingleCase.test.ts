import { requestAirdrops } from "@formfunction-hq/formfunction-program-shared";
import { Keypair } from "@solana/web3.js";
import logIfNotProd from "sdk/utils/logIfNotProd";
import getClaimantsListForTest from "tests/helpers/getClaimantsListForTest";
import setupAndTestPreTestConditions from "tests/helpers/setupAndTestPreTestConditions";
import testSubmitClaims from "tests/helpers/testSubmitClaims";
import expectToThrow from "tests/utils/expectToThrow";

describe("ClaimEdition Single Case", () => {
  it("A distributor can be created with only a single claimant and the claim can be fulfilled.", async () => {
    const { claimants, connection, distributor, gumdropSdk, mint, wallet } =
      await setupAndTestPreTestConditions({
        claimAmount: 1,
        numberOfClaimants: 1,
      });

    await testSubmitClaims(
      gumdropSdk,
      connection,
      wallet.publicKey,
      claimants,
      distributor,
      mint
    );

    logIfNotProd("Created distributor with 1 claimant and fulfilled 1 claim.");
  });

  it("A distributor with a single claimant who has multiple claim amounts works.", async () => {
    const claimAmount = 5;
    const { claimants, connection, distributor, gumdropSdk, mint, wallet } =
      await setupAndTestPreTestConditions({
        claimAmount,
        numberOfClaimants: 1,
      });

    await testSubmitClaims(
      gumdropSdk,
      connection,
      wallet.publicKey,
      claimants,
      distributor,
      mint
    );

    logIfNotProd(
      `Created distributor with 1 claimant and fulfilled ${claimAmount} claims.`
    );
  });

  it("Invalid claims on a distributor with only one valid claim are rejected.", async () => {
    const { connection, distributor, gumdropSdk, mint, wallet } =
      await setupAndTestPreTestConditions({
        claimAmount: 1,
        numberOfClaimants: 1,
      });

    const invalidKeypair = Keypair.generate();
    await requestAirdrops({ connection, wallets: [invalidKeypair] });
    const invalidClaimants = getClaimantsListForTest(mint, [invalidKeypair], 1);

    await expectToThrow(() =>
      testSubmitClaims(
        gumdropSdk,
        connection,
        wallet.publicKey,
        invalidClaimants,
        distributor,
        mint
      )
    );

    logIfNotProd(
      "Invalid claims are rejected for a distributor with 1 valid claimant."
    );
  });
});
