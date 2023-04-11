import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import BullisticGumdropSdk from "sdk/BullisticGumdropSdk";
import assertTokenOwnerHasAmount from "tests/helpers/assertTokenOwnerHasAmount";
import closeDistributor from "tests/helpers/closeDistributor";
import expectToThrow from "tests/utils/expectToThrow";

type Accounts = {
  configAuthority: Keypair;
  configCreatorAuthority: PublicKey;
  distributor: PublicKey;
  mint: PublicKey;
  wallet: Keypair;
};

type Args = {
  connection: Connection;
  gumdropSdk: BullisticGumdropSdk;
  shouldConfigAuthorityClose?: boolean;
};

export default async function testCloseDistributor(
  {
    configAuthority,
    configCreatorAuthority,
    distributor,
    mint,
    wallet,
  }: Accounts,
  { gumdropSdk, connection, shouldConfigAuthorityClose = false }: Args
) {
  await assertTokenOwnerHasAmount(connection, mint, distributor, 1);

  await closeDistributor(
    {
      configAuthority,
      configCreatorAuthority,
      mint,
      wallet,
    },
    {
      connection,
      gumdropSdk,
      shouldConfigAuthorityClose,
    }
  );

  await assertTokenOwnerHasAmount(connection, mint, wallet.publicKey, 1);

  expectToThrow(async () => {
    await gumdropSdk.program.account.merkleDistributor.fetch(distributor);
  }, `Account does not exist or has no data ${distributor}`);
}
