import {
  assertUnreachable,
  Environment,
} from "@formfunction-hq/formfunction-program-shared";
import { Keypair } from "@solana/web3.js";
import fs from "fs";

export default function getConfigAuthorityKeypair(
  environment:
    | Environment.Testnet
    | Environment.Development
    | Environment.Production
) {
  switch (environment) {
    case Environment.Testnet: {
      const path = `keys/testnet/config-authority-keypair.json`;
      const seed = fs.readFileSync(path, "utf-8");
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(seed)));
    }
    case Environment.Development: {
      const path = `keys/devnet/config-authority-keypair.json`;
      const seed = fs.readFileSync(path, "utf-8");
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(seed)));
    }
    case Environment.Production: {
      throw new Error("[TODO]: mainnet keypair needs to be provided.");
    }
    default: {
      return assertUnreachable(environment);
    }
  }
}
