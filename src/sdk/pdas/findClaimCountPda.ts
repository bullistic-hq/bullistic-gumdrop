import { PdaResult } from "@formfunction-hq/formfunction-program-shared";
import { PublicKey } from "@solana/web3.js";

export default function findClaimCountPda(
  distributor: PublicKey,
  claimant: PublicKey,
  gumdropProgramId: PublicKey
): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("ClaimCount"), distributor.toBuffer(), claimant.toBuffer()],
    gumdropProgramId
  );
}
