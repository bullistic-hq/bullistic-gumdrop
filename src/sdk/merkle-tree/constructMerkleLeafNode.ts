import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import ClaimantInfo from "sdk/types/ClaimantInfo";

export default function constructMerkleLeafNode(
  claimant: ClaimantInfo,
  mint: PublicKey
) {
  return Buffer.from([
    ...claimant.address.toBuffer(),
    ...mint.toBuffer(),
    ...new BN(claimant.amount).toArray("le", 1),
  ]);
}
