import { AnchorProvider } from "@project-serum/anchor";
import FormfnGumdropSdk from "sdk/FormfnGumdropSdk";
import getEnvironmentFromAnchorUrl from "sdk/utils/getEnvironmentFromAnchorUrl";

const provider = AnchorProvider.env();
const { wallet, connection } = provider;

export default function getConnectionAndSdk() {
  const environment = getEnvironmentFromAnchorUrl();
  const gumdropSdk = new FormfnGumdropSdk({
    connection,
    environment,
    wallet,
  });
  return { connection, environment, gumdropSdk };
}
