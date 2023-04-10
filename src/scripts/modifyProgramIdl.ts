import modifyProgramIdlScript from "@formfunction-hq/formfunction-program-shared/dist/scripts/modifyProgramIdlScript";

modifyProgramIdlScript({
  decodedTransactionResultTypeFilePath:
    "src/sdk/types/DecodedFormfnGumdropTransactionResult.ts",
  idlFilePath: "src/sdk/idl/FormfnGumdrop.ts",
  programName: "FormfnGumdrop",
});
