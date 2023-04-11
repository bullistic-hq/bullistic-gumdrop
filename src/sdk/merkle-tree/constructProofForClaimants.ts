import { serializeMerkleProof } from "@bullistic-hq/bullistic-program-shared";
import { PublicKey } from "@solana/web3.js";
import constructMerkleTree from "sdk/merkle-tree/constructMerkleTree";
import ClaimantInfo from "sdk/types/ClaimantInfo";
import ClaimantWithProof from "sdk/types/ClaimantWithProof";

export default function constructProofForClaimants(
  mint: PublicKey,
  claimants: Array<ClaimantInfo>
): Array<ClaimantWithProof> {
  const { tree } = constructMerkleTree(claimants, mint);
  return claimants.map((claimant, idx) => {
    const proof = tree.getProof(idx);
    return {
      ...claimant,
      proof,
      serializedProof: serializeMerkleProof(proof),
    };
  });
}
