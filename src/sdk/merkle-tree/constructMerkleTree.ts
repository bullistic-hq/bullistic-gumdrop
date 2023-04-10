import { MerkleTree } from "@formfunction-hq/formfunction-program-shared";
import { PublicKey } from "@solana/web3.js";
import constructMerkleLeafNode from "sdk/merkle-tree/constructMerkleLeafNode";
import ClaimantInfo from "sdk/types/ClaimantInfo";

export default function constructMerkleTree(
  claimants: Array<ClaimantInfo>,
  mint: PublicKey
) {
  const leafs: Array<Buffer> = [];

  claimants.forEach((claimant) => {
    leafs.push(constructMerkleLeafNode(claimant, mint));
  });

  const tree = new MerkleTree(leafs);
  const root = tree.getRoot();

  return { root, tree };
}
