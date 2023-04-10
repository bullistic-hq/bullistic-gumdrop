import ClaimantInfo from "sdk/types/ClaimantInfo";

export default function getTotalClaimAmount(claimants: Array<ClaimantInfo>) {
  return claimants.reduce((sum, c) => sum + c.amount, 0);
}
