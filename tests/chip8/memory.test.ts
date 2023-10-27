import { expect, test } from "bun:test";
import Memory from "../../src/chip8/memory";

test("Memory can be dumped and loaded", () => {
  const m1 = new Memory();
  const m2 = new Memory();

  const testData = new Uint8Array(0x200).map((_, i) => i);

  m1.load(testData);

  m1.write(0xffe, 0xb0);
  m1.write(0xfff, 0x0b);

  m2.restore(m1.dump());

  expect(m2.dump()).toEqual(m1.dump());
});
