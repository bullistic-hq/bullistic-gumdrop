import {
  assertUnreachable,
  Environment,
} from "@bullistic-hq/bullistic-program-shared";
import { Keypair } from "@solana/web3.js";
import fs from "fs";

export default function getUpdateConfigAuthorityKeypair(
  environment:
    | Environment.Testnet
    | Environment.Development
    | Environment.Production
) {
  switch (environment) {
    case Environment.Testnet: {
      const path = `keys/testnet/update-config-authority-keypair.json`;
      const seed = fs.readFileSync(path, "utf-8");
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(seed)));
    }
    case Environment.Development: {
      const path = `keys/devnet/update-config-authority-keypair.json`;
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
