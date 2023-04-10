import {
  decodeTransactionUsingProgramIdl,
  Maybe,
} from "@formfunction-hq/formfunction-program-shared";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { GUMDROP_IDL } from "index";
import DecodedFormfnGumdropTransactionResult from "sdk/types/FormfnGumdropInstructionAccountNames";

export default function decodeGumdropTransaction(
  programId: PublicKey,
  parsedTransaction: ParsedTransactionWithMeta
): Maybe<DecodedFormfnGumdropTransactionResult> {
  for (const idl of [GUMDROP_IDL]) {
    const result =
      decodeTransactionUsingProgramIdl<DecodedFormfnGumdropTransactionResult>(
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
