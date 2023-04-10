import { Keypair } from "@solana/web3.js";
import getClaimantsListForTest from "tests/helpers/getClaimantsListForTest";

/**
 * A script to estimate merkle proof sizes in bytes based on the merkle tree
 * size. Large trees require larger proofs, which at some size are limited
 * by the transaction size the proof is submitted in.
 *
 * Note: See original investigation here: https://github.com/formfunction-hq/formfn-gumdrop/pull/95
 *
 * Run this with: yarn estimate-merkle-proof-sizes
 *
 * Results:
 *   {
      [claimants number]: proof length (length of [u8; 32] byte hashes in the proof).
      '1': 0,
      '2': 1,
      '3': 2,
      '4': 2,
      '5': 3,
      '6': 3,
      '7': 3,
      '8': 3,
      '9': 4,
      '10': 4,
      '100': 7,
      '250': 8, (This is around the current limit for the Gumdrop program)
      '500': 9,
      '1000': 10,
      '2500': 12,
      '5000': 13,
      '10000': 14,
      '100000': 17 (640 bytes)
      '1000000': 20 (640 bytes)
      '2500000': 22 (704 bytes)
      '5000000': 23 (736 bytes)
      -> FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
    }
 */

function estimateMerkleProofSizes() {
  console.log("Estimating merkle proof sizes, wait a moment...");

  const kp = Keypair.generate();
  const mint = Keypair.generate().publicKey;

  const result: { [key: number]: number } = {};
  // Doesn't match values in comment above because the big numbers are too big.
  const numberOfClaimantsToTest = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 250, 500, 1_000, 2_500, 5_000, 10_000,
    100_000,
  ];

  numberOfClaimantsToTest.forEach((num) => {
    const keypairs = new Array(num).fill(null).map((_) => kp);
    const { proof } = getClaimantsListForTest(mint, keypairs, 1)[0];
    result[num] = proof.length;
  });

  console.log(result);
}

estimateMerkleProofSizes();
