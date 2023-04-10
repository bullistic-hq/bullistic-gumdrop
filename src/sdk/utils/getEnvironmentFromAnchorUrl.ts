import { Environment } from "@formfunction-hq/formfunction-program-shared";

export default function getEnvironmentFromAnchorUrl() {
  const url = process.env.ANCHOR_PROVIDER_URL;
  switch (url) {
    case "https://api.testnet.solana.com":
      return Environment.Testnet;
    case "https://api.devnet.solana.com":
      return Environment.Development;
    case "http://localhost:8899":
      return Environment.Local;
    case "https://api.mainnet-beta.solana.com":
      return Environment.Production;
    default: {
      throw new Error(
        `Unrecognized ANCHOR_PROVIDER_URL url, received: ${url}. Did you run the program with Anchor setup correctly?`
      );
    }
  }
}
