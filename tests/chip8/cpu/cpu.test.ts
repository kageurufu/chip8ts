import { expect, test } from "bun:test";
import { makeChip8 } from "./utils";

test("CPU state can be dumped and restored", () => {
  const c1 = makeChip8();
  const c2 = makeChip8();

  c1.cpu.r.raw.set(new Uint8Array(c1.cpu.r.raw.length).map((_, i) => i + 1));
  c1.cpu.r.Save.set(new Uint8Array(c1.cpu.r.Save.length).map((_, i) => i + 1));

  c2.cpu.restore(c1.cpu.dump())

  expect(c1.cpu.r.raw).toEqual(c2.cpu.r.raw)
  expect(c1.cpu.r.Save).toEqual(c2.cpu.r.Save)
});
