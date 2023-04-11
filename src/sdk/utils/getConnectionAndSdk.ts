import { AnchorProvider } from "@project-serum/anchor";
import BullisticGumdropSdk from "sdk/BullisticGumdropSdk";
import getEnvironmentFromAnchorUrl from "sdk/utils/getEnvironmentFromAnchorUrl";

const provider = AnchorProvider.env();
const { wallet, connection } = provider;

export default function getConnectionAndSdk() {
  const environment = getEnvironmentFromAnchorUrl();
  const gumdropSdk = new BullisticGumdropSdk({
    connection,
    environment,
    wallet,
  });
  return { connection, environment, gumdropSdk };
}
