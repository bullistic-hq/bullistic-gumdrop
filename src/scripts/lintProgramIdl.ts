import lintProgramIdlScript from "@bullistic-hq/bullistic-program-shared/dist/scripts/lintProgramIdlScript";

function lintProgramIdl() {
  lintProgramIdlScript("src/sdk/idl/BullisticGumdrop.ts");
}

lintProgramIdl();
