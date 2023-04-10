import isProd from "sdk/utils/isProd";

export default function logIfNotProd(...args: Array<any>): void {
  if (!isProd()) {
    console.log(...args);
  }
}
