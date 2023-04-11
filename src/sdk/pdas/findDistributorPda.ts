import { PdaResult } from "@bullistic-hq/bullistic-program-shared";
import { PublicKey } from "@solana/web3.js";

export default function findDistributorPda(
  mint: PublicKey,
  creator_authority: PublicKey,
  gumdropProgramId: PublicKey
): PdaResult {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("MerkleDistributor"),
      mint.toBuffer(),
      creator_authority.toBuffer(),
    ],
    gumdropProgramId
  );
}
