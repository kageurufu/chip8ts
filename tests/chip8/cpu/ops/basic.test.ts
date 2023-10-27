import { expect, test } from "bun:test";

import { makeChip8 } from "../utils";
import exp from "constants";

test("0nnn :: SYS addr", () => {
  const chip8 = makeChip8();

  const freeze = new Uint8Array(chip8.cpu.r.raw);
  chip8.cpu.execute({ op: "SYS addr", addr: 0 });

  expect(chip8.cpu.r.raw).toEqual(freeze);
});

test("Cxkk :: RND Vx, kk", () => {
  const c = makeChip8();

  {
    let results = new Array(2).fill(false);
    let i = 100;
    while (results.indexOf(false) !== -1 && --i > 0) {
      c.cpu.execute({ op: "RND Vx, kk", x: 0, kk: 1 });
      expect(c.cpu.r.V0).toBeWithin(0, 2);
    }
  }

  {
    let results = new Array(10).fill(false);
    let i = 100;
    while (results.indexOf(false) !== -1 && --i > 0) {
      c.cpu.execute({ op: "RND Vx, kk", x: 0, kk: 10 });
      expect(c.cpu.r.V0).toBeWithin(0, 11);
    }
  }
});

test("3xkk :: SE Vx, kk", () => {
  const c = makeChip8();

  c.cpu.r.Vx.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  for (let i = 0; i <= 0xf; i++) {
    c.cpu.r.PC = 0x200;

    c.cpu.execute({ op: "SE Vx, kk", x: i, kk: 0xff - i });
    expect(c.cpu.r.PC).toBe(0x200);

    c.cpu.execute({ op: "SE Vx, kk", x: i, kk: i });
    expect(c.cpu.r.PC).toBe(0x202);
  }
});

test("4xkk :: SNE Vx, kk", () => {
  const c = makeChip8();

  c.cpu.r.Vx.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  for (let i = 0; i <= 0xf; i++) {
    c.cpu.r.PC = 0x200;

    c.cpu.execute({ op: "SNE Vx, kk", x: i, kk: i });
    expect(c.cpu.r.PC).toBe(0x200);

    c.cpu.execute({ op: "SNE Vx, kk", x: i, kk: 0xff - i });
    expect(c.cpu.r.PC).toBe(0x202);
  }
});

test("5xy0 :: SE Vx, Vy", () => {
  const c = makeChip8();

  c.cpu.r.Vx.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  for (let y = 1; y <= 0xf; y++) {
    c.cpu.r.PC = 0x200;

    c.cpu.r.V0 = 0;
    c.cpu.execute({ op: "SE Vx, Vy", x: 0, y });
    expect(c.cpu.r.PC).toBe(0x200);

    c.cpu.r.V0 = c.cpu.r.Vx[y];
    c.cpu.execute({ op: "SE Vx, Vy", x: 0, y });
    expect(c.cpu.r.PC).toBe(0x202);
  }
});

test("9xy0 :: SNE Vx, Vy", () => {
  const c = makeChip8();

  c.cpu.r.Vx.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  for (let i = 1; i <= 0xf; i++) {
    c.cpu.r.PC = 0x200;

    c.cpu.r.V0 = 0;
    c.cpu.execute({ op: "SNE Vx, Vy", x: 0, y: i });
    expect(c.cpu.r.PC).toBe(0x202);

    c.cpu.r.V0 = c.cpu.r.Vx[i];
    c.cpu.execute({ op: "SNE Vx, Vy", x: 0, y: i });
    expect(c.cpu.r.PC).toBe(0x202);
  }
});

test("1nnn :: JP addr", () => {
  const c = makeChip8();

  c.cpu.execute({ op: "JP addr", addr: 0x234 });
  expect(c.cpu.r.PC).toBe(0x234);

  c.cpu.execute({ op: "JP addr", addr: 0xfff });
  expect(c.cpu.r.PC).toBe(0xfff);

  c.cpu.execute({ op: "JP addr", addr: 0x0 });
  expect(c.cpu.r.PC).toBe(0x0);
});

test("Bnnn :: JP Vx, addr", () => {
  const c = makeChip8();
  c.quirks.Jumping = false;

  c.cpu.r.V0 = 0x0;
  c.cpu.execute({ op: "JP Vx, addr", x:0, addr: 0x234 });
  expect(c.cpu.r.PC).toBe(0x234);

  c.cpu.r.V0 = 0x10;
  c.cpu.execute({ op: "JP Vx, addr", x:0, addr: 0x234 });
  expect(c.cpu.r.PC).toBe(0x244);

  c.cpu.r.V0 = 0x0;
  c.cpu.execute({ op: "JP Vx, addr", x:0, addr: 0xfff });
  expect(c.cpu.r.PC).toBe(0xfff);

  c.cpu.r.V0 = 0x10;
  c.cpu.execute({ op: "JP Vx, addr", x:0, addr: 0xfff });
  expect(c.cpu.r.PC).toBe(0x00f);

  c.cpu.r.V0 = 0x0;
  c.cpu.execute({ op: "JP Vx, addr", x:0, addr: 0x0 });
  expect(c.cpu.r.PC).toBe(0x000);

  c.cpu.r.V0 = 0x10;
  c.cpu.execute({ op: "JP Vx, addr", x:0, addr: 0x0 });
  expect(c.cpu.r.PC).toBe(0x010);
});

test("Bnnn :: JP Vx, addr", () => {
  const c = makeChip8();
  c.quirks.Jumping = true;

  c.cpu.r.VE = 0x0;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xe, addr: 0xe00 });
  expect(c.cpu.r.PC).toBe(0xe00);

  c.cpu.r.VE = 0x10;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xe, addr: 0xe00 });
  expect(c.cpu.r.PC).toBe(0xe10);

  c.cpu.r.VE = 0xff;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xe, addr: 0xe00 });
  expect(c.cpu.r.PC).toBe(0xeff);

  c.cpu.r.VE = 0x0;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xe, addr: 0xeff });
  expect(c.cpu.r.PC).toBe(0xeff);

  c.cpu.r.VE = 0x10;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xe, addr: 0xeff });
  expect(c.cpu.r.PC).toBe(0xf0f);

  c.cpu.r.VE = 0xff;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xe, addr: 0xeff });
  expect(c.cpu.r.PC).toBe(0xffe);

  c.cpu.r.VF = 0x0;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xf, addr: 0xfff });
  expect(c.cpu.r.PC).toBe(0xfff);

  c.cpu.r.VF = 0x1;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xf, addr: 0xfff });
  expect(c.cpu.r.PC).toBe(0x000);

  c.cpu.r.VF = 0xff;
  c.cpu.execute({ op: "JP Vx, addr", x: 0xf, addr: 0xfff });
  expect(c.cpu.r.PC).toBe(0x0fe);
});

test("2nnn :: CALL addr", () => {
  const c = makeChip8();

  c.cpu.r.PC = 0x200;
  c.cpu.execute({ op: "CALL addr", addr: 0x400 });
  expect(c.cpu.r.PC).toEqual(0x400);
  expect(c.cpu.r.Stack.subarray(0, c.cpu.r.SP)).toEqual(
    new Uint16Array([0x200])
  );

  c.cpu.r.PC = 0x400;
  c.cpu.execute({ op: "CALL addr", addr: 0x400 });
  expect(c.cpu.r.PC).toEqual(0x400);
  expect(c.cpu.r.Stack.subarray(0, c.cpu.r.SP)).toEqual(
    new Uint16Array([0x200, 0x400])
  );
});

test("00EE :: RET", () => {
  const c = makeChip8();

  c.cpu.r.push(0x200);
  c.cpu.r.push(0x400);
  c.cpu.r.push(0x600);
  c.cpu.r.push(0x800);

  expect(c.cpu.r.Stack.subarray(0, c.cpu.r.SP)).toEqual(
    new Uint16Array([0x200, 0x400, 0x600, 0x800])
  );

  c.cpu.r.PC = 0x210;
  c.cpu.execute({ op: "RET" });
  expect(c.cpu.r.PC).toBe(0x800);

  c.cpu.execute({ op: "RET" });
  expect(c.cpu.r.PC).toBe(0x600);
  expect(c.cpu.r.Stack.subarray(0, c.cpu.r.SP)).toEqual(
    new Uint16Array([0x200, 0x400])
  );

  c.cpu.execute({ op: "RET" });
  expect(c.cpu.r.PC).toBe(0x400);

  c.cpu.execute({ op: "RET" });
  expect(c.cpu.r.PC).toBe(0x200);
  expect(c.cpu.r.SP).toBe(0);
});
