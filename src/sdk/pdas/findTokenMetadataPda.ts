import {
  PdaResult,
  TOKEN_METADATA_PROGRAM_ID,
} from "@bullistic-hq/bullistic-program-shared";
import { PublicKey } from "@solana/web3.js";

export default function findTokenMetadataPda(mint: PublicKey): PdaResult {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}
