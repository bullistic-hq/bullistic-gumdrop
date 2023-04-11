import { Maybe } from "@bullistic-hq/bullistic-program-shared";
import { IDL } from "sdk/idl/BullisticGumdrop";

export default function getErrorMessageFromGumdropIdl(
  errorCode: number
): Maybe<string> {
  const idlError = IDL.errors.find((e) => e.code === errorCode);
  return idlError?.msg ?? null;
}
