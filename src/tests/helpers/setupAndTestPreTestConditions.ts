import { mintMasterEditionForTest } from "@formfunction-hq/formfunction-program-shared";
import getConnectionAndSdk from "sdk/utils/getConnectionAndSdk";
import getClaimantsListForTest from "tests/helpers/getClaimantsListForTest";
import getTestWallets from "tests/helpers/getTestWallets";
import testCreateGumdropConfig from "tests/helpers/testCreateGumdropConfig";
import testNewDistributor from "tests/helpers/testNewDistributor";

type Args = {
  claimAmount?: number;
  numberOfClaimants?: number;
};

/**
 * This function is responsible for running shared logic and some assertions
 * before all tests, which includes the following:
 *
 * - Setup SDK and provider Connection.
 * - Setup and fund test wallet keypairs.
 * - Mint a new master edition NFT.
 * - Create the GumdropConfig account.
 * - Create a new new distributor program for the newly created mint.
 *
 * It also runs some assertions during the GumdropConfig setup and
 * NewDistributor setup. It's a bit tricky to separate the setup steps
 * and test assertions without duplicating code, which is why they are combined
 * here.
 *
 * Each test generally assumes it is starting with a newly created distributor
 * and a new mint, which is why this setup is run multiple times.
 */
export default async function setupAndTestPreTestConditions(
  args: Args = { numberOfClaimants: 5 }
) {
  const { numberOfClaimants = 5, claimAmount } = args;
  const { gumdropSdk, connection } = getConnectionAndSdk();

  const [configAuthority, wallet, ...claimantWallets] = await getTestWallets(
    connection,
    numberOfClaimants + 2
  );

  const mint = await mintMasterEditionForTest(wallet, connection);

  await testCreateGumdropConfig(gumdropSdk, connection, configAuthority);

  const claimants = getClaimantsListForTest(mint, claimantWallets, claimAmount);
  const { distributor } = await testNewDistributor(
    {
      configAuthority: configAuthority.publicKey,
      mint,
      wallet,
    },
    {
      claimants,
      connection,
      gumdropSdk,
    }
  );

  return {
    claimants,
    configAuthority,
    connection,
    distributor,
    gumdropSdk,
    mint,
    wallet,
  };
}
