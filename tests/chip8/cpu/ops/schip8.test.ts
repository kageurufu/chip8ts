import { describe, expect, it, mock, jest, test, beforeEach } from "bun:test";

import Chip8, { Chip8Dump } from "../../../../src/chip8";
import { NullDisplay } from "../../../../src/chip8/display";
import { NullSound } from "../../../../src/chip8/sound";
import { makeChip8 } from "../utils";
import { cpuUsage } from "process";

test("00FD :: EXIT", () => {
  const chip8 = makeChip8();

  chip8.cpu.execute({ op: "EXIT" });
  expect(chip8.running).toBeFalse();
});

describe("Scrolling operations", () => {
  const resetDisplay = (c: Chip8) => {
    c.display.resize(5, 5);
    c.display.set(0, 2, 0b00100000);

    expect(c.display.dump_debug()).toEqual([
      "     ",
      "     ",
      "  █  ",
      "     ",
      "     ",
    ]);
  };

  test("00Cn :: SCD n", () => {
    const c = makeChip8();

    resetDisplay(c);
    c.cpu.execute({ op: "SCD n", n: 1 });
    expect(c.display.dump_debug()).toEqual([
      "     ",
      "     ",
      "     ",
      "  █  ",
      "     ",
    ]);

    resetDisplay(c);
    c.cpu.execute({ op: "SCD n", n: 2 });
    expect(c.display.dump_debug()).toEqual([
      "     ",
      "     ",
      "     ",
      "     ",
      "  █  ",
    ]);
  });

  test("00FB :: SCR", () => {
    const c = makeChip8();
    resetDisplay(c);

    c.cpu.execute({ op: "SCR" });
    expect(c.display.dump_debug()).toEqual([
      "     ",
      "     ",
      "    █",
      "     ",
      "     ",
    ]);

    c.cpu.execute({ op: "SCR" });
    expect(c.display.dump_debug()).toEqual([
      "     ",
      "     ",
      "     ",
      "     ",
      "     ",
    ]);
  });

  test("00FC :: SCL", () => {
    const c = makeChip8();
    resetDisplay(c);

    c.cpu.execute({ op: "SCL" });
    expect(c.display.dump_debug()).toEqual([
      "     ",
      "     ",
      "█    ",
      "     ",
      "     ",
    ]);

    c.cpu.execute({ op: "SCL" });
    expect(c.display.dump_debug()).toEqual([
      "     ",
      "     ",
      "     ",
      "     ",
      "     ",
    ]);
  });
});

test("00FE :: LORES", () => {
  const c = makeChip8();
  c.display.resize(5, 5);

  c.cpu.execute({ op: "LORES" });
  expect([c.display.width, c.display.height]).toEqual([64, 32]);
});

test("00FF :: HIRES", () => {
  const c = makeChip8();
  c.display.resize(5, 5);

  c.cpu.execute({ op: "HIRES" });
  expect([c.display.width, c.display.height]).toEqual([128, 64]);
});

// test("Dxy0 :: DRW16 Vx, Vy", () => { expect().fail("unimplemented") })
// test("Fx30 :: LD HF, Vx", () => { expect().fail("unimplemented") })
test("Fx75 :: SAVE Vx", () => {
  const c = makeChip8();

  c.cpu.r.Vx.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  c.cpu.execute({ op: "SAVE Vx", x: 0 });
  expect(Array.from(c.cpu.r.Save)).toEqual([1, 0, 0, 0, 0, 0, 0, 0]);

  c.cpu.execute({ op: "SAVE Vx", x: 2 });
  expect(Array.from(c.cpu.r.Save)).toEqual([1, 2, 3, 0, 0, 0, 0, 0]);

  c.cpu.execute({ op: "SAVE Vx", x: 9 });
  expect(Array.from(c.cpu.r.Save)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test("Fx85 :: LOAD Vx", () => {
  const c = makeChip8();

  c.cpu.r.Save.set([1, 2, 3, 4, 5, 6, 7, 8]);
  c.cpu.execute({ op: "LOAD Vx", x: 0 });
  expect(Array.from(c.cpu.r.Vx)).toEqual([
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  c.cpu.execute({ op: "LOAD Vx", x: 2 });
  expect(Array.from(c.cpu.r.Vx)).toEqual([
    1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  c.cpu.execute({ op: "LOAD Vx", x: 9 });
  expect(Array.from(c.cpu.r.Vx)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
});
