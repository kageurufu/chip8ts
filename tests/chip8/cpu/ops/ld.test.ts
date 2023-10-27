import { expect, test } from "bun:test";

import { makeChip8 } from "../utils";

test("Annn :: LD I, addr", () => {
  const chip8 = makeChip8();

  expect(chip8.cpu.r.I).toBe(0);

  chip8.cpu.execute({ op: "LD I, addr", addr: 0x444 });

  expect(chip8.cpu.r.I).toBe(0x444);
});

test("6xkk :: LD Vx, kk", () => {
  const chip8 = makeChip8();

  expect(chip8.cpu.r.V4).toBe(0);

  chip8.cpu.execute({ op: "LD Vx, kk", x: 4, kk: 0x69 });

  expect(chip8.cpu.r.V4).toBe(0x69);
});

test("8xy0 :: LD Vx, Vy", () => {
  const chip8 = makeChip8();

  chip8.cpu.r.Vx.set([
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff,
  ]);

  expect(chip8.cpu.r.V6).toBe(0x66);
  expect(chip8.cpu.r.V9).toBe(0x99);

  chip8.cpu.execute({ op: "LD Vx, Vy", x: 6, y: 9 });

  expect(chip8.cpu.r.V6).toBe(0x99);
  expect(chip8.cpu.r.V9).toBe(0x99);
});

test("Fx07 :: LD Vx, DT", () => {
  const chip8 = makeChip8();

  expect(chip8.cpu.r.V0).toBe(0);
  expect(chip8.cpu.r.DT).toBe(0);

  chip8.cpu.r.DT = 0x66;

  expect(chip8.cpu.r.V0).toBe(0);
  expect(chip8.cpu.r.DT).toBe(0x66);

  chip8.cpu.execute({ op: "LD Vx, DT", x: 0 });

  expect(chip8.cpu.r.V0).toBe(0x66);
  expect(chip8.cpu.r.DT).toBe(0x66);
});

test("Fx15 :: LD DT, Vx", () => {
  const chip8 = makeChip8();

  expect(chip8.cpu.r.V0).toBe(0);
  expect(chip8.cpu.r.DT).toBe(0);

  chip8.cpu.r.V0 = 0x66;

  expect(chip8.cpu.r.V0).toBe(0x66);
  expect(chip8.cpu.r.DT).toBe(0);

  chip8.cpu.execute({ op: "LD DT, Vx", x: 0 });

  expect(chip8.cpu.r.V0).toBe(0x66);
  expect(chip8.cpu.r.DT).toBe(0x66);
});

test("Fx18 :: LD ST, Vx", () => {
  const chip8 = makeChip8();

  expect(chip8.cpu.r.V0).toBe(0);
  expect(chip8.cpu.r.ST).toBe(0);

  chip8.cpu.r.V0 = 0x66;

  expect(chip8.cpu.r.V0).toBe(0x66);
  expect(chip8.cpu.r.ST).toBe(0);

  chip8.cpu.execute({ op: "LD ST, Vx", x: 0 });

  expect(chip8.cpu.r.V0).toBe(0x66);
  expect(chip8.cpu.r.ST).toBe(0x66);
});

test("Fx29 :: LD F, Vx", () => {
  const chip8 = makeChip8();
  chip8.cpu.r.Vx.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  for (let i = 0; i <= 0xf; i++) {
    chip8.cpu.execute({ op: "LD F, Vx", x: i });
    expect(chip8.cpu.r.Vx[i]).toBe(i);
    expect(chip8.cpu.r.I).toBe(i * 5);
  }
});

test("Fx33 :: LD B, Vx", () => {
  const chip8 = makeChip8();

  const results: Record<number, [number, [number, number, number]]> = {
    0: [0x00, [0, 0, 0]], // 0
    1: [0x11, [0, 1, 7]], // 17
    2: [0x22, [0, 3, 4]], // 34
    0x3: [0x33, [0, 5, 1]], // 51
    0x4: [0x44, [0, 6, 8]], // 68
    0x5: [0x55, [0, 8, 5]], // 85
    0x6: [0x66, [1, 0, 2]], // 102
    0x7: [0x77, [1, 1, 9]], // 119
    0x8: [0x88, [1, 3, 6]], // 136
    0x9: [0x99, [1, 5, 3]], // 153
    0xa: [0xaa, [1, 7, 0]], // 170
    0xb: [0xbb, [1, 8, 7]], // 187
    0xc: [0xcc, [2, 0, 4]], // 204
    0xd: [0xdd, [2, 2, 1]], // 221
    0xe: [0xee, [2, 3, 8]], // 238
    0xf: [0xff, [2, 5, 5]], // 255
  };

  chip8.cpu.r.Vx.set([
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff,
  ]);
  chip8.cpu.r.I = 0x400;

  for (let i = 0; i <= 0xf; i++) {
    chip8.cpu.r.I = 0x400;
    chip8.cpu.execute({ op: "LD B, Vx", x: i });

    let [reg, bcd] = results[i];
    expect(chip8.cpu.r.Vx[i]).toBe(reg);
    expect(chip8.memory.mem8.subarray(0x400, 0x403)).toEqual(
      new Uint8Array(bcd)
    );
  }
});

test("Fx55 :: LD [I], Vx", () => {
  const c = makeChip8();

  c.cpu.r.I = 0x400;
  c.cpu.r.Vx.set([
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff,
  ]);

  for (let i = 0; i <= 0xf; i++) {
    c.cpu.execute({ op: "LD [I], Vx", x: i });

    expect(Array.from(c.memory.mem8.subarray(0x400, 0x410))).toEqual([
      ...c.cpu.r.Vx.slice(0, i + 1),
      ...new Array(0xf - i).fill(0),
    ]);
  }
});

test("Fx65 :: LD Vx, [I]", () => {
  const c = makeChip8();

  c.cpu.r.I = 0x300;
  c.memory.mem8.set(
    new Array(16).fill(0).map((_, i) => i + 0x10),
    c.cpu.r.I
  );

  expect(c.cpu.r.Vx.toString()).toBe("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");

  c.cpu.execute({ op: "LD Vx, [I]", x: 0 });

  expect(c.cpu.r.Vx.toString()).toBe("16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0");

  c.cpu.execute({ op: "LD Vx, [I]", x: 6 });

  expect(c.cpu.r.Vx.toString()).toBe("16,17,18,19,20,21,22,0,0,0,0,0,0,0,0,0");
});

