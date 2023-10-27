import { Byte, Word } from "../types";

export default class Registers {
  buffer: ArrayBuffer;
  raw: Uint8Array;

  Reg8: Uint8Array;
  Reg16: Uint16Array;

  Stack: Uint16Array;
  Vx: Uint8Array;

  Save: Uint8Array;

  constructor() {
    this.buffer = new ArrayBuffer(55);
    this.raw = new Uint8Array(this.buffer);

    this.Stack = new Uint16Array(this.buffer, 0, 16);
    this.Reg16 = new Uint16Array(this.buffer, 32, 2);
    this.Vx = new Uint8Array(this.buffer, 36, 16);
    this.Reg8 = new Uint8Array(this.buffer, 52, 3);

    this.Save = new Uint8Array(8);
  }

  get V0(): Byte {
    return this.Vx[0x0];
  }
  get V1(): Byte {
    return this.Vx[0x1];
  }
  get V2(): Byte {
    return this.Vx[0x2];
  }
  get V3(): Byte {
    return this.Vx[0x3];
  }
  get V4(): Byte {
    return this.Vx[0x4];
  }
  get V5(): Byte {
    return this.Vx[0x5];
  }
  get V6(): Byte {
    return this.Vx[0x6];
  }
  get V7(): Byte {
    return this.Vx[0x7];
  }
  get V8(): Byte {
    return this.Vx[0x8];
  }
  get V9(): Byte {
    return this.Vx[0x9];
  }
  get VA(): Byte {
    return this.Vx[0xa];
  }
  get VB(): Byte {
    return this.Vx[0xb];
  }
  get VC(): Byte {
    return this.Vx[0xc];
  }
  get VD(): Byte {
    return this.Vx[0xd];
  }
  get VE(): Byte {
    return this.Vx[0xe];
  }
  get VF(): Byte {
    return this.Vx[0xf];
  }

  get DT(): Byte {
    return this.Reg8[0x0];
  }
  get ST(): Byte {
    return this.Reg8[0x1];
  }
  get SP(): Byte {
    return this.Reg8[0x2];
  }

  get I(): Word {
    return this.Reg16[0x0];
  }
  get PC(): Word {
    return this.Reg16[0x1];
  }

  set V0(n: Byte) {
    this.Vx[0x0] = n;
  }
  set V1(n: Byte) {
    this.Vx[0x1] = n;
  }
  set V2(n: Byte) {
    this.Vx[0x2] = n;
  }
  set V3(n: Byte) {
    this.Vx[0x3] = n;
  }
  set V4(n: Byte) {
    this.Vx[0x4] = n;
  }
  set V5(n: Byte) {
    this.Vx[0x5] = n;
  }
  set V6(n: Byte) {
    this.Vx[0x6] = n;
  }
  set V7(n: Byte) {
    this.Vx[0x7] = n;
  }
  set V8(n: Byte) {
    this.Vx[0x8] = n;
  }
  set V9(n: Byte) {
    this.Vx[0x9] = n;
  }
  set VA(n: Byte) {
    this.Vx[0xa] = n;
  }
  set VB(n: Byte) {
    this.Vx[0xb] = n;
  }
  set VC(n: Byte) {
    this.Vx[0xc] = n;
  }
  set VD(n: Byte) {
    this.Vx[0xd] = n;
  }
  set VE(n: Byte) {
    this.Vx[0xe] = n;
  }
  set VF(n: Byte) {
    this.Vx[0xf] = n;
  }

  set DT(n: Byte) {
    this.Reg8[0x0] = n;
  }
  set ST(n: Byte) {
    this.Reg8[0x1] = n;
  }
  set SP(v: Byte) {
    this.Reg8[0x2] = v;
  }

  set I(v: Word) {
    this.Reg16[0x0] = v;
  }
  set PC(v: Word) {
    this.Reg16[0x1] = v;
  }

  push(val: Word) {
    this.Stack[this.SP++] = val;
  }

  pop(): Word {
    return this.Stack[--this.SP];
  }

  save(vx: number) {
    this.Save.set(this.Vx.slice(0, Math.min(vx + 1, 8)));
  }

  load(vx: number) {
    this.Vx.set(this.Save.slice(0, Math.min(vx + 1, 8)));
  }
}
