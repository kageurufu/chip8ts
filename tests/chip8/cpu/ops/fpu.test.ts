import { expect, test } from "bun:test";
import { makeChip8 } from "../utils";

test("7xkk :: ADD Vx, kk", () => {
  const c = makeChip8();

  c.cpu.r.V0 = 0x00;
  c.cpu.r.V1 = 0x80;

  c.cpu.execute({ op: "ADD Vx, kk", x: 0, kk: 0xa0 });
  expect(c.cpu.r.V0).toEqual(0xa0);

  c.cpu.execute({ op: "ADD Vx, kk", x: 1, kk: 0xa0 });
  expect(c.cpu.r.V1).toEqual(0x20);
});

test("8xy1 :: OR Vx, Vy", () => {
  const c = makeChip8();

  c.cpu.r.V0 = 0b11000000;
  c.cpu.r.V1 = 0b00001111;
  c.cpu.r.V2 = 0b10101010;
  c.cpu.r.V3 = 0b01010101;

  c.cpu.execute({ op: "OR Vx, Vy", x: 0, y: 1 });
  c.cpu.execute({ op: "OR Vx, Vy", x: 2, y: 3 });

  expect(c.cpu.r.V0).toEqual(0b11001111);
  expect(c.cpu.r.V1).toEqual(0b00001111);

  expect(c.cpu.r.V2).toEqual(0b11111111);
  expect(c.cpu.r.V3).toEqual(0b01010101);
});

test("8xy2 :: AND Vx, Vy", () => {
  const c = makeChip8();

  c.cpu.r.V0 = 0b11000011;
  c.cpu.r.V1 = 0b00001111;
  c.cpu.r.V2 = 0b10101010;
  c.cpu.r.V3 = 0b01010101;
  c.cpu.r.V4 = 0b11111111;
  c.cpu.r.V5 = 0b00000000;

  c.cpu.execute({ op: "AND Vx, Vy", x: 0, y: 1 });
  expect(c.cpu.r.V0).toEqual(0b00000011);
  expect(c.cpu.r.V1).toEqual(0b00001111);

  c.cpu.execute({ op: "AND Vx, Vy", x: 1, y: 2 });
  expect(c.cpu.r.V1).toEqual(0b00001010);
  expect(c.cpu.r.V2).toEqual(0b10101010);

  c.cpu.execute({ op: "AND Vx, Vy", x: 2, y: 3 });
  expect(c.cpu.r.V2).toEqual(0b00000000);
  expect(c.cpu.r.V3).toEqual(0b01010101);

  c.cpu.execute({ op: "AND Vx, Vy", x: 3, y: 4 });
  expect(c.cpu.r.V3).toEqual(0b01010101);
  expect(c.cpu.r.V4).toEqual(0b11111111);

  c.cpu.execute({ op: "AND Vx, Vy", x: 4, y: 5 });
  expect(c.cpu.r.V4).toEqual(0b00000000);
  expect(c.cpu.r.V5).toEqual(0b00000000);
});

test("8xy3 :: XOR Vx, Vy", () => {
  const c = makeChip8();

  c.cpu.r.V0 = 0b11000011;
  c.cpu.r.V1 = 0b00001111;
  c.cpu.r.V2 = 0b10101010;
  c.cpu.r.V3 = 0b01010101;
  c.cpu.r.V4 = 0b11111111;
  c.cpu.r.V5 = 0b00000000;

  c.cpu.execute({ op: "XOR Vx, Vy", x: 0, y: 1 });
  expect(c.cpu.r.V0).toEqual(0b11001100);
  expect(c.cpu.r.V1).toEqual(0b00001111);

  c.cpu.execute({ op: "XOR Vx, Vy", x: 1, y: 2 });
  expect(c.cpu.r.V1).toEqual(0b10100101);
  expect(c.cpu.r.V2).toEqual(0b10101010);

  c.cpu.execute({ op: "XOR Vx, Vy", x: 2, y: 3 });
  expect(c.cpu.r.V2).toEqual(0b11111111);
  expect(c.cpu.r.V3).toEqual(0b01010101);

  c.cpu.execute({ op: "XOR Vx, Vy", x: 3, y: 4 });
  expect(c.cpu.r.V3).toEqual(0b10101010);
  expect(c.cpu.r.V4).toEqual(0b11111111);

  c.cpu.execute({ op: "XOR Vx, Vy", x: 4, y: 5 });
  expect(c.cpu.r.V4).toEqual(0b11111111);
  expect(c.cpu.r.V5).toEqual(0b00000000);
});

test("8xy6 :: SHR Vx{, Vy}", () => {
  const c = makeChip8();
  c.quirks.Shifting = false;

  c.cpu.r.V0 = 0;
  c.cpu.r.V1 = 0;
  c.cpu.r.V2 = 0b01111110;
  c.cpu.r.V3 = 0b11111111;

  c.cpu.execute({ op: "SHR Vx{, Vy}", x: 0, y: 0x2 });
  expect(c.cpu.r.V0).toEqual(0b00111111);
  expect(c.cpu.r.V2).toEqual(0b01111110);
  expect(c.cpu.r.VF).toEqual(0);

  c.cpu.execute({ op: "SHR Vx{, Vy}", x: 1, y: 0x3 });
  expect(c.cpu.r.V1).toEqual(0b01111111);
  expect(c.cpu.r.V3).toEqual(0b11111111);
  expect(c.cpu.r.VF).toEqual(1);
});

test("8xy6 :: SHR Vx{, Vy} [QUIRK]", () => {
  const c = makeChip8();
  c.quirks.Shifting = true;

  c.cpu.r.V0 = 0b01111110;
  c.cpu.r.V1 = 0b11111111;

  c.cpu.execute({ op: "SHR Vx{, Vy}", x: 0, y: 0xf });
  expect(c.cpu.r.V0).toEqual(0b00111111);
  expect(c.cpu.r.VF).toEqual(0);

  c.cpu.execute({ op: "SHR Vx{, Vy}", x: 1, y: 0xf });
  expect(c.cpu.r.V1).toEqual(0b01111111);
  expect(c.cpu.r.VF).toEqual(1);
});

test("8xyE :: SHL Vx{, Vy}", () => {
  const c = makeChip8();
  c.quirks.Shifting = false;

  c.cpu.r.V0 = 0;
  c.cpu.r.V1 = 0;
  c.cpu.r.V2 = 0b01111110;
  c.cpu.r.V3 = 0b11111111;

  c.cpu.execute({ op: "SHL Vx{, Vy}", x: 0, y: 0x2 });
  expect(c.cpu.r.V0).toEqual(0b11111100);
  expect(c.cpu.r.VF).toEqual(0);

  c.cpu.execute({ op: "SHL Vx{, Vy}", x: 1, y: 0x3 });
  expect(c.cpu.r.V1).toEqual(0b11111110);
  expect(c.cpu.r.VF).toEqual(1);
});

test("8xyE :: SHL Vx{, Vy} [QUIRK]", () => {
  const c = makeChip8();
  c.quirks.Shifting = true;

  c.cpu.r.V0 = 0b01111110;
  c.cpu.r.V1 = 0b11111111;

  c.cpu.execute({ op: "SHL Vx{, Vy}", x: 0, y: 0xf });
  expect(c.cpu.r.V0).toEqual(0b11111100);
  expect(c.cpu.r.VF).toEqual(0);

  c.cpu.execute({ op: "SHL Vx{, Vy}", x: 1, y: 0xf });
  expect(c.cpu.r.V1).toEqual(0b11111110);
  expect(c.cpu.r.VF).toEqual(1);
});

test("Fx1E :: ADD I, Vx", () => {
  const c = makeChip8();

  c.cpu.r.I = 0x11;
  c.cpu.r.V1 = 0x22;
  c.cpu.r.VF = 0xff;

  c.cpu.execute({ op: "ADD I, Vx", x: 1 });

  expect(c.cpu.r.I).toEqual(0x33);
  expect(c.cpu.r.V1).toEqual(0x22);
  expect(c.cpu.r.VF).toEqual(0xff);
});

test("8xy4 :: ADD Vx, Vy", () => {
  const c = makeChip8();

  c.cpu.r.V0 = 0x10;
  c.cpu.r.V1 = 0x20;
  c.cpu.execute({ op: "ADD Vx, Vy", x: 0, y: 1 });

  expect(c.cpu.r.V0).toBe(0x30);
  expect(c.cpu.r.VF).toBe(0);

  c.cpu.r.V0 = 0xff;
  c.cpu.r.V1 = 0xf1;
  c.cpu.execute({ op: "ADD Vx, Vy", x: 0, y: 1 });

  expect(c.cpu.r.V0).toBe(0xf0);
  expect(c.cpu.r.VF).toBe(1);
});

test("8xy5 :: SUB Vx, Vy", () => {
  const c = makeChip8();

  c.cpu.r.V0 = 0x66;
  c.cpu.r.V1 = 0x44;

  c.cpu.r.V6 = 0x1;
  c.cpu.r.V7 = 0x2;

  c.cpu.execute({ op: "SUB Vx, Vy", x: 0, y: 1 });

  expect(c.cpu.r.V0).toBe(0x22);
  expect(c.cpu.r.V1).toBe(0x44);
  expect(c.cpu.r.VF).toBe(1);

  c.cpu.execute({ op: "SUB Vx, Vy", x: 6, y: 7 });

  expect(c.cpu.r.V6).toBe(0xff);
  expect(c.cpu.r.V7).toBe(0x2);
  expect(c.cpu.r.VF).toBe(0);
});

test("8xy7 :: SUBN Vx, Vy", () => {
  // Vx = Vy - Vx
  const c = makeChip8();

  c.cpu.r.V0 = 0x44;
  c.cpu.r.V1 = 0x66;

  c.cpu.r.V6 = 140;
  c.cpu.r.V7 = 120;

  c.cpu.execute({ op: "SUBN Vx, Vy", x: 0, y: 1 });

  expect(c.cpu.r.V0).toBe(0x22);
  expect(c.cpu.r.V1).toBe(0x66);
  expect(c.cpu.r.VF).toBe(1);

  c.cpu.execute({ op: "SUBN Vx, Vy", x: 6, y: 7 });

  expect(c.cpu.r.V6).toBe(236);
  expect(c.cpu.r.V7).toBe(120);
  expect(c.cpu.r.VF).toBe(0);
});
