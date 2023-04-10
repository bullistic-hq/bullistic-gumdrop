export default function assertMerkleRootsNotEqual(
  rootA: Array<number>,
  rootB: Array<number>
) {
  expect(Buffer.from(rootA).equals(Buffer.from(rootB))).toBe(false);
}
