import { PublicKey } from "@solana/web3.js";

interface ClaimantInfo {
  address: PublicKey;
  amount: number;
}

export default ClaimantInfo;
