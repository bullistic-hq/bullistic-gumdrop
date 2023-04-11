import modifyProgramIdlScript from "@bullistic-hq/bullistic-program-shared/dist/scripts/modifyProgramIdlScript";

modifyProgramIdlScript({
  decodedTransactionResultTypeFilePath:
    "src/sdk/types/DecodedBullisticGumdropTransactionResult.ts",
  idlFilePath: "src/sdk/idl/BullisticGumdrop.ts",
  programName: "BullisticGumdrop",
});
