import {
  randomNumberInRange,
  serializeMerkleProof,
} from "@bullistic-hq/bullistic-program-shared";
import { Keypair, PublicKey } from "@solana/web3.js";
import constructMerkleTree from "sdk/merkle-tree/constructMerkleTree";
import { ClaimantInfoForTest } from "tests/types/ClaimantInfoForTest";

export default function getClaimantsListForTest(
  mint: PublicKey,
  keypairs: Array<Keypair>,
  amount?: number
): Array<ClaimantInfoForTest> {
  const claimants = keypairs.map((keypair) => ({
    address: keypair.publicKey,
    amount: amount ?? randomNumberInRange(1, 3),
  }));

  const { tree } = constructMerkleTree(claimants, mint);

  return claimants.map((claimant, idx) => {
    const proof = tree.getProof(idx);
    return {
      ...claimant,
      keypair: keypairs[idx],
      proof,
      serializedProof: serializeMerkleProof(proof),
    };
  });
}
