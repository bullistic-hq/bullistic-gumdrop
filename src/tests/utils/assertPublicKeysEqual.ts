import { PublicKey } from "@solana/web3.js";

export default function assertPublicKeysEqual(a: PublicKey, b: PublicKey) {
  expect(a.toBase58()).toBe(b.toBase58());
}
