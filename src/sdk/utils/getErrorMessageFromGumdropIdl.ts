import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { IDL } from "sdk/idl/FormfnGumdrop";

export default function getErrorMessageFromGumdropIdl(
  errorCode: number
): Maybe<string> {
  const idlError = IDL.errors.find((e) => e.code === errorCode);
  return idlError?.msg ?? null;
}
