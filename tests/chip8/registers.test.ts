import { describe, expect, test } from "bun:test";
import Registers from "../../src/chip8/registers";

describe("registers should not clobber each other", () => {
  test("Registers should be unique within the buffer", () => {
    const r = new Registers();
    r.raw.set(new Array(r.raw.length).fill(0).map((_, i) => i));

    expect(Array.from(r.raw)).toEqual([
      // 0x0 - 0x036
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
      0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
      0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23,
      0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
      0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36,
    ]);

    expect(Array.from(r.Stack)).toEqual([
      // little-endian 0x00 - 0x1F
      0x0100, 0x0302, 0x0504, 0x0706, 0x0908, 0x0b0a, 0x0d0c, 0x0f0e, 0x1110,
      0x1312, 0x1514, 0x1716, 0x1918, 0x1b1a, 0x1d1c, 0x1f1e,
    ]);

    expect(Array.from(r.Reg16)).toEqual([0x2120, 0x2322]);

    expect(Array.from(r.Vx)).toEqual([
      0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
      0x30, 0x31, 0x32, 0x33,
    ]);

    expect(Array.from(r.Reg8)).toEqual([0x34, 0x35, 0x36]);
  });

  test("The stack should push and pop", () => {
    const r = new Registers();

    expect(r.SP).toBe(0);
    expect(Array.from(r.Stack)).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    r.push(0x0001);

    expect(r.SP).toBe(1);
    expect(Array.from(r.Stack)).toEqual([
      0x0001, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    r.push(0x0002);
    r.push(0x0003);

    expect(r.SP).toBe(3);
    expect(Array.from(r.Stack)).toEqual([
      0x0001, 0x0002, 0x0003, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    expect(r.pop()).toBe(0x0003);
    expect(r.SP).toBe(2);
    expect(Array.from(r.Stack)).toEqual([
      0x0001, 0x0002, 0x0003, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    expect(r.pop()).toBe(0x0002);
    expect(r.SP).toBe(1);
    expect(Array.from(r.Stack)).toEqual([
      0x0001, 0x0002, 0x0003, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    r.push(0x1111);
    expect(r.SP).toBe(2);
    expect(Array.from(r.Stack)).toEqual([
      0x0001, 0x1111, 0x0003, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  test("Register accessors should be unique", () => {
    const r = new Registers();
    r.raw.set(new Array(r.raw.length).fill(0).map((_, i) => i));

    expect(Array.from(r.Stack)).toEqual([
      0x0100, 0x0302, 0x0504, 0x0706, 0x0908, 0x0b0a, 0x0d0c, 0x0f0e, 0x1110,
      0x1312, 0x1514, 0x1716, 0x1918, 0x1b1a, 0x1d1c, 0x1f1e,
    ]);

    expect(r.I).toBe(0x2120);
    expect(r.PC).toBe(0x2322);

    expect(r.V0).toBe(0x24);
    expect(r.V1).toBe(0x25);
    expect(r.V2).toBe(0x26);
    expect(r.V3).toBe(0x27);
    expect(r.V4).toBe(0x28);
    expect(r.V5).toBe(0x29);
    expect(r.V6).toBe(0x2a);
    expect(r.V7).toBe(0x2b);
    expect(r.V8).toBe(0x2c);
    expect(r.V9).toBe(0x2d);
    expect(r.VA).toBe(0x2e);
    expect(r.VB).toBe(0x2f);
    expect(r.VC).toBe(0x30);
    expect(r.VD).toBe(0x31);
    expect(r.VE).toBe(0x32);
    expect(r.VF).toBe(0x33);
    expect(r.DT).toBe(0x34);
    expect(r.ST).toBe(0x35);
    expect(r.SP).toBe(0x36);

    r.I = ~r.I;
    r.PC = ~r.PC;
    r.V0 = ~r.V0;
    r.V1 = ~r.V1;
    r.V2 = ~r.V2;
    r.V3 = ~r.V3;
    r.V4 = ~r.V4;
    r.V5 = ~r.V5;
    r.V6 = ~r.V6;
    r.V7 = ~r.V7;
    r.V8 = ~r.V8;
    r.V9 = ~r.V9;
    r.VA = ~r.VA;
    r.VB = ~r.VB;
    r.VC = ~r.VC;
    r.VD = ~r.VD;
    r.VE = ~r.VE;
    r.VF = ~r.VF;
    r.DT = ~r.DT;
    r.ST = ~r.ST;
    r.SP = ~r.SP;

    expect(Array.from(r.Reg16)).toEqual([0xdedf, 0xdcdd]);
    expect(Array.from(r.Vx)).toEqual([
      0xdb, 0xda, 0xd9, 0xd8, 0xd7, 0xd6, 0xd5, 0xd4, 0xd3, 0xd2, 0xd1, 0xd0,
      0xcf, 0xce, 0xcd, 0xcc,
    ]);
    expect(Array.from(r.Reg8)).toEqual([0xcb, 0xca, 0xc9]);
  });
});
