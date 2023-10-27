import { expect, test } from "bun:test";

import { makeChip8 } from "../utils";

test("00E0 :: CLS", () => {
  const chip8 = makeChip8();

  chip8.display.pixmap32.fill(chip8.display.white);
  chip8.cpu.execute({ op: "CLS" });

  expect(chip8.display.pixmap32[0]).toEqual(chip8.display.black);
});

// test("Dxyn :: DRW Vx, Vy, n", () => { expect().fail("unimplemented") })
