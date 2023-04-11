import { MerkleProof } from "@bullistic-hq/bullistic-program-shared";
import { Keypair } from "@solana/web3.js";
import ClaimantWithProof from "sdk/types/ClaimantWithProof";

export interface ClaimantInfoForTest extends ClaimantWithProof {
  keypair: Keypair;
  proof: MerkleProof;
}
