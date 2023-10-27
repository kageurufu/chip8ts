import { expect, test } from "bun:test";

import { makeChip8 } from "../utils";

test("Fx0A :: LD Vx, K", () => {
  const c = makeChip8();

  c.cpu.r.PC = 0x200;
  c.cpu.execute({ op: "LD Vx, K", x: 0 });
  expect(c.cpu.r.V0).toEqual(0);
  expect(c.cpu.r.PC).toEqual(0x200 - 2);

  c.cpu.r.PC = 0x200;
  c.input.press(3);
  c.cpu.execute({ op: "LD Vx, K", x: 0 });
  expect(c.cpu.r.V0).toEqual(3);
  expect(c.cpu.r.PC).toEqual(0x200);
});

test("Ex9E :: SKP Vx", () => {
  const c = makeChip8();

  c.cpu.r.PC = 0x200;
  c.cpu.r.V0 = 5;
  c.cpu.execute({ op: "SKP Vx", x: 0 });
  expect(c.cpu.r.PC).toBe(0x200);

  c.input.press(3);
  c.cpu.execute({ op: "SKP Vx", x: 0 });
  expect(c.cpu.r.PC).toBe(0x200);

  c.input.press(5);
  c.cpu.execute({ op: "SKP Vx", x: 0 });
  expect(c.cpu.r.PC).toBe(0x202);
});

test("ExA1 :: SKNP Vx", () => {
  const c = makeChip8();

  c.cpu.r.PC = 0x200;
  c.cpu.r.V0 = 5;
  c.cpu.execute({ op: "SKNP Vx", x: 0 });
  expect(c.cpu.r.PC).toBe(0x202);

  c.input.press(3);
  c.cpu.execute({ op: "SKNP Vx", x: 0 });
  expect(c.cpu.r.PC).toBe(0x204);

  c.input.press(5);
  c.cpu.execute({ op: "SKNP Vx", x: 0 });
  expect(c.cpu.r.PC).toBe(0x204);
});
