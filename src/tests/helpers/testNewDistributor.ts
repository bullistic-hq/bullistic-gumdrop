import { getEditionNumber } from "@bullistic-hq/bullistic-program-shared";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import BullisticGumdropSdk from "sdk/BullisticGumdropSdk";
import findDistributorPda from "sdk/pdas/findDistributorPda";
import ClaimantInfo from "sdk/types/ClaimantInfo";
import logIfNotProd from "sdk/utils/logIfNotProd";
import assertMasterEditionSupply from "tests/helpers/assertMasterEditionSupply";
import assertTokenOwnerHasAmount from "tests/helpers/assertTokenOwnerHasAmount";
import createNewDistributor from "tests/helpers/createNewDistributor";
import assertPublicKeysEqual from "tests/utils/assertPublicKeysEqual";

type Accounts = {
  configAuthority: PublicKey;
  mint: PublicKey;
  wallet: Keypair;
};

type Args = {
  claimants: Array<ClaimantInfo>;
  connection: Connection;
  expectedEdition?: number;
  expectedMasterEditionSupply?: number;
  gumdropSdk: BullisticGumdropSdk;
};

export default async function testNewDistributor(
  { configAuthority, mint, wallet }: Accounts,
  {
    claimants,
    connection,
    expectedMasterEditionSupply = 0,
    expectedEdition = 0,
    gumdropSdk,
  }: Args
) {
  await assertTokenOwnerHasAmount(connection, mint, wallet.publicKey, 1);

  await createNewDistributor(
    gumdropSdk,
    connection,
    mint,
    wallet,
    configAuthority,
    claimants
  );

  const [distributor] = findDistributorPda(
    mint,
    wallet.publicKey,
    gumdropSdk.programId
  );

  await assertTokenOwnerHasAmount(connection, mint, distributor, 1);
  await assertTokenOwnerHasAmount(connection, mint, wallet.publicKey, 0);

  const {
    root,
    creatorAuthority,
    mint: distributorMint,
  } = await gumdropSdk.program.account.merkleDistributor.fetch(distributor);

  expect(Array.isArray(root)).toBe(true);
  expect(await getEditionNumber(connection, mint)).toBe(expectedEdition);
  assertPublicKeysEqual(mint, distributorMint);
  assertPublicKeysEqual(wallet.publicKey, creatorAuthority);

  await assertMasterEditionSupply(
    connection,
    mint,
    expectedMasterEditionSupply
  );

  logIfNotProd(`distributor root: ${root}`);

  return { distributor, root };
}
