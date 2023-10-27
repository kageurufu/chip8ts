import { expect, test } from "bun:test";
import CPU from "../../../src/chip8/cpu";
import { makeChip8 } from "./utils";

test("CPU can parse opcodes", () => {
  const c = makeChip8();

  expect(c.cpu.parse(0x01, 0x23)).toEqual({ op: "SYS addr", addr: 0x123 });
  expect(c.cpu.parse(0x00, 0xc4)).toEqual({ op: "SCD n", n: 4 });
});
