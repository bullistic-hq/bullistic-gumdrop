import {
  deserializeMerkleProof,
  MerkleProof,
  serializeMerkleProof,
} from "@bullistic-hq/bullistic-program-shared";
import { Keypair } from "@solana/web3.js";
import constructMerkleTree from "sdk/merkle-tree/constructMerkleTree";
import getClaimantsListForTest from "tests/helpers/getClaimantsListForTest";

function assertProofsAreEqual(proofA: MerkleProof, proofB: MerkleProof) {
  proofA.forEach((buffer, i) => {
    expect(Buffer.compare(buffer, proofB[i])).toBe(0);
  });
}

describe("Merkle tree proof serialization and deserialization", () => {
  test("serializeProof and deserializeProof", () => {
    const numberOfClaimantsToTest = [0, 1, 25];
    numberOfClaimantsToTest.forEach((num) => {
      const keypairs = new Array(num).fill(null).map((_) => Keypair.generate());
      const mint = Keypair.generate().publicKey;
      const claimantsWithProof = getClaimantsListForTest(mint, keypairs);

      const serializedProofs = claimantsWithProof.map((claimant) =>
        serializeMerkleProof(claimant.proof)
      );

      const deserializedProofs = serializedProofs.map((proofString) =>
        deserializeMerkleProof(proofString)
      );

      deserializedProofs.forEach((proof, index) => {
        const originalProof = claimantsWithProof[index].proof;
        assertProofsAreEqual(proof, originalProof);
      });

      const { root, tree } = constructMerkleTree(claimantsWithProof, mint);
      deserializedProofs.forEach((proof, index) => {
        const valid = tree.verifyProof(index, proof, root);
        expect(valid).toBe(true);
      });
    });
  });
});
