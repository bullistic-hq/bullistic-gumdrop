import {
  decodeTransactionUsingProgramIdl,
  Maybe,
} from "@bullistic-hq/bullistic-program-shared";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { GUMDROP_IDL } from "index";
import DecodedBullisticGumdropTransactionResult from "sdk/types/BullisticGumdropInstructionAccountNames";

export default function decodeGumdropTransaction(
  programId: PublicKey,
  parsedTransaction: ParsedTransactionWithMeta
): Maybe<DecodedBullisticGumdropTransactionResult> {
  for (const idl of [GUMDROP_IDL]) {
    const result =
      decodeTransactionUsingProgramIdl<DecodedBullisticGumdropTransactionResult>(
        idl,
        programId,
        parsedTransaction
      );
    if (result != null) {
      return result;
    }
  }

  return null;
}
