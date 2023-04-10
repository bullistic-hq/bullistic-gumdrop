import { getMasterEditionSupply } from "@formfunction-hq/formfunction-program-shared";
import { Connection, PublicKey } from "@solana/web3.js";

export default async function assertMasterEditionSupply(
  connection: Connection,
  mint: PublicKey,
  expectedSupply: number
) {
  const supply = await getMasterEditionSupply(connection, mint);
  expect(supply).toBe(expectedSupply);
}
