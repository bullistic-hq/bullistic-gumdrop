import { getEmptyRoot } from "@bullistic-hq/bullistic-program-shared";
import setupAndTestPreTestConditions from "tests/helpers/setupAndTestPreTestConditions";

describe("NewDistributor with empty claimants list", () => {
  it("A distributor can be initialized with a list of zero claimants.", async () => {
    const { distributor, gumdropSdk } = await setupAndTestPreTestConditions({
      numberOfClaimants: 0,
    });

    const { root } = await gumdropSdk.program.account.merkleDistributor.fetch(
      distributor
    );

    expect(root).toEqual([...getEmptyRoot()]);
  });
});
