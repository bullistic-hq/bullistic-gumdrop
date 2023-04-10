import { PublicKey } from "@solana/web3.js";

type GumdropProgramIds = {
  gumdropConfigAuthority: PublicKey;
  gumdropConfigCreator: PublicKey;
  gumdropProgramId: PublicKey;
};

export const LOCALNET_PROGRAM_IDS: GumdropProgramIds = {
  gumdropConfigAuthority: PublicKey.default,
  gumdropConfigCreator: PublicKey.default,
  gumdropProgramId: new PublicKey(
    "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
  ),
};

export const TESTNET_PROGRAM_IDS: GumdropProgramIds = {
  gumdropConfigAuthority: new PublicKey(
    "dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"
  ),
  gumdropConfigCreator: new PublicKey(
    "dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"
  ),
  gumdropProgramId: new PublicKey(
    "dgumN6t8fDjoHAbb1K4ySqcP2sWJHaqX9JLNQMDPT9U"
  ),
};

export const DEVNET_PROGRAM_IDS: GumdropProgramIds = {
  gumdropConfigAuthority: new PublicKey(
    "dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"
  ),
  gumdropConfigCreator: new PublicKey(
    "dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"
  ),
  gumdropProgramId: new PublicKey(
    "dgumN6t8fDjoHAbb1K4ySqcP2sWJHaqX9JLNQMDPT9U"
  ),
};

export const MAINNET_PROGRAM_IDS: GumdropProgramIds = {
  gumdropConfigAuthority: new PublicKey(
    "2VC3M7t1Uj63yxPvrFKNCa9A14F3AVXujdjTHUATzxb8"
  ),
  gumdropConfigCreator: new PublicKey(
    "2VC3M7t1Uj63yxPvrFKNCa9A14F3AVXujdjTHUATzxb8"
  ),
  gumdropProgramId: new PublicKey(
    "gum8aDxTHP5HSXxQzVHDdSQJGUQFLreGDX2cUa133tk"
  ),
};
