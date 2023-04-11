import { PdaResult } from "@bullistic-hq/bullistic-program-shared";
import { PublicKey } from "@solana/web3.js";

export default function findDistributorWalletPda(
  distributor: PublicKey,
  gumdropProgramId: PublicKey
): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("Wallet"), distributor.toBuffer()],
    gumdropProgramId
  );
}
