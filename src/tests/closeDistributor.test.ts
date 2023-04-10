import closeCreatorMintTokenAccount from "tests/helpers/closeCreatorMintTokenAccount";
import setupAndTestPreTestConditions from "tests/helpers/setupAndTestPreTestConditions";
import testCloseDistributor from "tests/helpers/testCloseDistributor";

describe("NewDistributor and CloseDistributor", () => {
  it("A distributor can be created and closed by a user.", async () => {
    const {
      configAuthority,
      connection,
      distributor,
      gumdropSdk,
      mint,
      wallet,
    } = await setupAndTestPreTestConditions();

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
  });

  it("A distributor can be closed by the GumdropConfig config_authority.", async () => {
    const {
      configAuthority,
      connection,
      distributor,
      gumdropSdk,
      mint,
      wallet,
    } = await setupAndTestPreTestConditions();

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
  });

  it("Closing a distributor works if the user token account was independently closed beforehand.", async () => {
    const {
      configAuthority,
      connection,
      distributor,
      gumdropSdk,
      mint,
      wallet,
    } = await setupAndTestPreTestConditions();

    await closeCreatorMintTokenAccount({ mint, wallet }, { connection });

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
  });
});
