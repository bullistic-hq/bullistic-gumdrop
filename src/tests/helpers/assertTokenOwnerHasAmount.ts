import { findAtaPda } from "@formfunction-hq/formfunction-program-shared";
import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import logIfNotProd from "sdk/utils/logIfNotProd";

export default async function assertTokenOwnerHasAmount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  expectedAmount: number
) {
  const [ata] = findAtaPda(owner, mint);
  const accountInfo = await connection.getParsedAccountInfo(ata);
  if (accountInfo) {
    const data = accountInfo.value?.data as ParsedAccountData;
    const { info } = data.parsed;
    const supply = info.tokenAmount.uiAmount;
    expect(supply).toBe(expectedAmount);
    expect(info.owner).toBe(owner.toBase58());
    logIfNotProd(
      `${owner.toBase58()} has ${expectedAmount} of mint ${mint.toBase58()}`
    );
  } else {
    throw new Error(
      `Failed to find ata ${ata.toBase58()} for owner ${owner.toBase58()}`
    );
  }
}
