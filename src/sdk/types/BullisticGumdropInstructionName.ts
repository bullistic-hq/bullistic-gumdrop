import { GUMDROP_IDL } from "index";

const INSTRUCTION_NAMES = GUMDROP_IDL.instructions.map((ix) => ix.name);

type BullisticGumdropInstructionName = typeof INSTRUCTION_NAMES[0];

export default BullisticGumdropInstructionName;
