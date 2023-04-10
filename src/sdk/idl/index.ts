import { Program } from "@project-serum/anchor";
import { FormfnGumdrop } from "sdk/idl/FormfnGumdrop";
import FORMFN_GUMDROP_IDL from "sdk/idl/idl";

export { FORMFN_GUMDROP_IDL };

export type GumdropProgram = Program<FormfnGumdrop>;
