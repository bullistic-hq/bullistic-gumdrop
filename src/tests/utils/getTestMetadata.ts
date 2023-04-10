import { Data } from "@metaplex-foundation/mpl-token-metadata";

export default function getTestMetadata(): Data {
  return {
    creators: null,
    name: "test",
    sellerFeeBasisPoints: 0,
    symbol: "test",
    uri: "test",
  };
}
