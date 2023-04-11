import { Program } from "@project-serum/anchor";
import { BullisticGumdrop } from "sdk/idl/BullisticGumdrop";
import BULLISTIC_GUMDROP_IDL from "sdk/idl/idl";

export { BULLISTIC_GUMDROP_IDL };

export type GumdropProgram = Program<BullisticGumdrop>;
