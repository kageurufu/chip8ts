// src/utils/randomInt.ts
function randomInt(min, max) {
  if (max == undefined) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min));
}

// src/utils/bit_math.ts
var nib_hi = (byte) => (byte & 240) >> 4;
var op_x = (hi, lo) => ((hi << 8 | lo) & 3840) >> 8;
var op_y = (hi, lo) => ((hi << 8 | lo) & 240) >> 4;
var op_addr = (hi, lo) => (hi << 8 | lo) & 4095;
var op_kk = (hi, lo) => lo;
var op_n = (hi, lo) => lo & 15;

// src/chip8/registers.ts
class Registers {
  buffer;
  raw;
  Reg8;
  Reg16;
  Stack;
  Vx;
  Save;
  constructor() {
    this.buffer = new ArrayBuffer(55);
    this.raw = new Uint8Array(this.buffer);
    this.Stack = new Uint16Array(this.buffer, 0, 16);
    this.Reg16 = new Uint16Array(this.buffer, 32, 2);
    this.Vx = new Uint8Array(this.buffer, 36, 16);
    this.Reg8 = new Uint8Array(this.buffer, 52, 3);
    this.Save = new Uint8Array(8);
  }
  get V0() {
    return this.Vx[0];
  }
  get V1() {
    return this.Vx[1];
  }
  get V2() {
    return this.Vx[2];
  }
  get V3() {
    return this.Vx[3];
  }
  get V4() {
    return this.Vx[4];
  }
  get V5() {
    return this.Vx[5];
  }
  get V6() {
    return this.Vx[6];
  }
  get V7() {
    return this.Vx[7];
  }
  get V8() {
    return this.Vx[8];
  }
  get V9() {
    return this.Vx[9];
  }
  get VA() {
    return this.Vx[10];
  }
  get VB() {
    return this.Vx[11];
  }
  get VC() {
    return this.Vx[12];
  }
  get VD() {
    return this.Vx[13];
  }
  get VE() {
    return this.Vx[14];
  }
  get VF() {
    return this.Vx[15];
  }
  get DT() {
    return this.Reg8[0];
  }
  get ST() {
    return this.Reg8[1];
  }
  get SP() {
    return this.Reg8[2];
  }
  get I() {
    return this.Reg16[0];
  }
  get PC() {
    return this.Reg16[1];
  }
  set V0(n) {
    this.Vx[0] = n;
  }
  set V1(n) {
    this.Vx[1] = n;
  }
  set V2(n) {
    this.Vx[2] = n;
  }
  set V3(n) {
    this.Vx[3] = n;
  }
  set V4(n) {
    this.Vx[4] = n;
  }
  set V5(n) {
    this.Vx[5] = n;
  }
  set V6(n) {
    this.Vx[6] = n;
  }
  set V7(n) {
    this.Vx[7] = n;
  }
  set V8(n) {
    this.Vx[8] = n;
  }
  set V9(n) {
    this.Vx[9] = n;
  }
  set VA(n) {
    this.Vx[10] = n;
  }
  set VB(n) {
    this.Vx[11] = n;
  }
  set VC(n) {
    this.Vx[12] = n;
  }
  set VD(n) {
    this.Vx[13] = n;
  }
  set VE(n) {
    this.Vx[14] = n;
  }
  set VF(n) {
    this.Vx[15] = n;
  }
  set DT(n) {
    this.Reg8[0] = n;
  }
  set ST(n) {
    this.Reg8[1] = n;
  }
  set SP(v) {
    this.Reg8[2] = v;
  }
  set I(v) {
    this.Reg16[0] = v;
  }
  set PC(v) {
    this.Reg16[1] = v;
  }
  push(val) {
    this.Stack[this.SP++] = val;
  }
  pop() {
    return this.Stack[--this.SP];
  }
  save(vx) {
    this.Save.set(this.Vx.slice(0, Math.min(vx + 1, 8)));
  }
  load(vx) {
    this.Vx.set(this.Save.slice(0, Math.min(vx + 1, 8)));
  }
}

// src/chip8/display.ts
var Direction;
(function(Direction2) {
  Direction2[Direction2["Left"] = 0] = "Left";
  Direction2[Direction2["Right"] = 1] = "Right";
  Direction2[Direction2["Up"] = 2] = "Up";
  Direction2[Direction2["Down"] = 3] = "Down";
})(Direction || (Direction = {}));

class Display {
  pixmap;
  pixmap8;
  pixmap32;
  black = 255;
  white = 4294967295;
  colors = [255, 4294967295];
  width = 64;
  height = 32;
  dirty = false;
  reset() {
    this.resize(64, 32);
    this.render();
  }
  resize(w, h) {
    this.width = w;
    this.height = h;
    this.pixmap = new ArrayBuffer(this.width * this.height * 4);
    this.pixmap8 = new Uint8Array(this.pixmap);
    this.pixmap32 = new Uint32Array(this.pixmap);
  }
  offset(x, y) {
    return y * this.width + x;
  }
  tick() {
    this.render();
  }
  draw(x, y, sprite, clipping = false) {
    let rowsClobbered = 0;
    while (x >= this.width)
      x -= this.width;
    while (y >= this.height)
      y -= this.height;
    for (let row = 0;row < sprite.length; row++) {
      if (y + row >= this.height && clipping)
        break;
      let rowY = y + row;
      let rowClobbered = false;
      if (rowY >= this.height)
        rowY -= this.height;
      for (let byte = 0;byte < sprite[row].length; byte++) {
        let bits = sprite[row][byte];
        for (let col = 0;col < 8; col++) {
          let bitX = x + byte * 8 + col;
          if (bitX >= this.width) {
            if (clipping) {
              break;
            } else {
              bitX -= this.width;
            }
          }
          if (bits >> 7 - col & 1) {
            if (this.flip(bitX, rowY)) {
              rowClobbered = true;
            }
          }
        }
      }
      if (rowClobbered) {
        rowsClobbered++;
      }
    }
    return rowsClobbered;
  }
  flip(x, y) {
    const r = this.pixmap32[this.offset(x, y)] > 255;
    this.pixmap32[this.offset(x, y)] = this.colors[r ? 0 : 1];
    this.dirty = true;
    return r ? 1 : 0;
  }
  scroll(dir, dist, clipping = false) {
    switch (dir) {
      case Direction.Left:
        for (let row = 0;row < this.height; row++) {
          let offset2 = this.offset(0, row);
          this.pixmap32.set(this.pixmap32.subarray(offset2 + dist, offset2 + this.width), offset2);
          this.pixmap32.fill(this.black, offset2 + this.width - dist + 1, offset2 + this.width);
        }
        return;
      case Direction.Right:
        for (let row = 0;row < this.height; row++) {
          let offset2 = this.offset(0, row);
          this.pixmap32.set(this.pixmap32.subarray(offset2, offset2 + this.width - dist), offset2 + dist);
          this.pixmap32.fill(this.black, offset2, offset2 + dist);
        }
        return;
      case Direction.Up:
        let offset = this.offset(0, dist);
        this.pixmap32.set(this.pixmap32.subarray(offset), 0);
        this.pixmap32.fill(this.black, this.offset(0, this.height - dist));
        return;
      case Direction.Down: {
        let startOffset = this.offset(0, dist);
        let endOffset = this.offset(0, this.height - dist);
        this.pixmap32.set(this.pixmap32.subarray(0, endOffset), startOffset);
        this.pixmap32.fill(this.black, 0, startOffset);
        return;
      }
    }
    throw new Error("Scroll not implemented");
  }
  dump() {
    return [
      this.width,
      this.height,
      Array.from(this.pixmap32).map((p) => p === this.white ? 1 : 0)
    ];
  }
  restore([w, h, pxl]) {
    this.resize(w, h);
    this.pixmap32.set(pxl.map((p) => this.colors[p & 1]));
  }
  dump_debug() {
    const res = [];
    for (let i = 0;i < this.height; i++) {
      res.push(Array.prototype.slice.call(this.pixmap32, i * this.width, (i + 1) * this.width).map((p) => p > 255 ? "\u2588" : " ").join(""));
    }
    return res;
  }
}

// src/chip8/cpu.ts
var formatInst = ({ op, ...args }) => {
  const strArgs = Object.entries(args).map(([k, v]) => `${k}=\$${v.toString(16)}`).join(" ");
  return op + " (" + strArgs + ")";
};

class CPU {
  chip8;
  display;
  input;
  memory;
  r;
  halt_keypress;
  constructor(chip8, display2, input, memory) {
    this.chip8 = chip8;
    this.display = display2;
    this.input = input;
    this.memory = memory;
    this.r = new Registers;
    this.halt_keypress = null;
  }
  dump() {
    return [...this.r.raw, ...this.r.Save];
  }
  restore(dump) {
    this.r.raw.set(dump.slice(0, this.r.raw.length));
    if (dump.length > this.r.raw.length) {
      this.r.Save.set(dump.slice(this.r.raw.length));
    }
  }
  reset() {
    this.r.raw.fill(0);
    this.r.PC = 512;
  }
  tick() {
    const hi = this.chip8.memory.read(this.r.PC);
    const lo = this.chip8.memory.read(this.r.PC + 1);
    const instruction = this.parse(hi, lo);
    console.debug(`\$${hi.toString(16).padStart(2, "0")}${lo.toString(16).padStart(2, "0")}`, formatInst(instruction).padEnd(32, " "), `PC=\$${this.r.PC.toString(16)}`, `I=\$${this.r.I.toString(16)}`, `Vx=\$${Array.prototype.map.call(this.r.Vx, (x) => x.toString(16)).join(",")}`, `DT=\$${this.r.DT.toString(16)}`, `ST=\$${this.r.ST.toString(16)}`, `SP=\$${this.r.SP}`, `Stack=\$${Array.prototype.map.call(this.r.Stack.subarray(0, this.r.SP), (x) => x.toString(16)).join(",")}`);
    this.r.PC += 2;
    this.execute(instruction);
    return instruction;
  }
  parse(hi, lo) {
    if (hi == 0) {
      if (nib_hi(lo) == 12)
        return { op: "SCD n", n: op_n(hi, lo) };
      if (lo == 224)
        return { op: "CLS" };
      if (lo == 238)
        return { op: "RET" };
      if (lo == 251)
        return { op: "SCR" };
      if (lo == 252)
        return { op: "SCL" };
      if (lo == 253)
        return { op: "EXIT" };
      if (lo == 254)
        return { op: "LORES" };
      if (lo == 255)
        return { op: "HIRES" };
    }
    if ((hi & 240) == 0)
      return { op: "SYS addr", addr: op_addr(hi, lo) };
    if ((hi & 240) == 16)
      return { op: "JP addr", addr: op_addr(hi, lo) };
    if ((hi & 240) == 32)
      return { op: "CALL addr", addr: op_addr(hi, lo) };
    if ((hi & 240) == 48)
      return { op: "SE Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };
    if ((hi & 240) == 64)
      return { op: "SNE Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };
    if ((hi & 240) == 80 && (lo & 15) == 0)
      return { op: "SE Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 96)
      return { op: "LD Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };
    if ((hi & 240) == 112)
      return { op: "ADD Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 0)
      return { op: "LD Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 1)
      return { op: "OR Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 2)
      return { op: "AND Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 3)
      return { op: "XOR Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 4)
      return { op: "ADD Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 5)
      return { op: "SUB Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 6)
      return { op: "SHR Vx{, Vy}", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 7)
      return { op: "SUBN Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 128 && (lo & 15) == 14)
      return { op: "SHL Vx{, Vy}", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 144 && (lo & 15) == 0)
      return { op: "SNE Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 160)
      return { op: "LD I, addr", addr: op_addr(hi, lo) };
    if ((hi & 240) == 176) {
      return {
        op: "JP Vx, addr",
        x: this.chip8.quirks.Jumping ? op_x(hi, lo) : 0,
        addr: op_addr(hi, lo)
      };
    }
    if ((hi & 240) == 192)
      return { op: "RND Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };
    if ((hi & 240) == 208 && (lo & 15) == 0)
      return { op: "DRW16 Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };
    if ((hi & 240) == 208)
      return {
        op: "DRW Vx, Vy, n",
        x: op_x(hi, lo),
        y: op_y(hi, lo),
        n: op_n(hi, lo)
      };
    if ((hi & 240) == 224 && lo == 158)
      return { op: "SKP Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 224 && lo == 161)
      return { op: "SKNP Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 7)
      return { op: "LD Vx, DT", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 10)
      return { op: "LD Vx, K", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 21)
      return { op: "LD DT, Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 24)
      return { op: "LD ST, Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 30)
      return { op: "ADD I, Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 41)
      return { op: "LD F, Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 48)
      return { op: "LD HF, Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 51)
      return { op: "LD B, Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 85)
      return { op: "LD [I], Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 101)
      return { op: "LD Vx, [I]", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 117)
      return { op: "SAVE Vx", x: op_x(hi, lo) };
    if ((hi & 240) == 240 && lo == 133)
      return { op: "LOAD Vx", x: op_x(hi, lo) };
    throw new Error(`Unable to parse opcode ${hi.toString(16).padStart(2, "0")}${lo.toString(16).padStart(2, "0")} at ${this.r.PC.toString(16).padStart(3, "0")}`);
  }
  execute(i) {
    switch (i.op) {
      case "SYS addr": {
        break;
      }
      case "EXIT": {
        this.chip8.stop();
        break;
      }
      case "LD I, addr": {
        this.r.I = i.addr;
        break;
      }
      case "LD Vx, kk": {
        this.r.Vx[i.x] = i.kk;
        break;
      }
      case "LD Vx, Vy": {
        this.r.Vx[i.x] = this.r.Vx[i.y];
        break;
      }
      case "LD Vx, DT": {
        this.r.Vx[i.x] = this.r.DT;
        break;
      }
      case "LD DT, Vx": {
        this.r.DT = this.r.Vx[i.x];
        break;
      }
      case "LD ST, Vx": {
        this.r.ST = this.r.Vx[i.x];
        break;
      }
      case "LD F, Vx": {
        this.r.I = 0 + this.r.Vx[i.x] * 5;
        break;
      }
      case "LD HF, Vx": {
        this.r.I = 80 + this.r.Vx[i.x] * 10;
      }
      case "LD B, Vx": {
        const Vx = this.r.Vx[i.x];
        const I = this.r.I;
        this.chip8.memory.write(I + 0, Vx / 100 % 10);
        this.chip8.memory.write(I + 1, Vx / 10 % 10);
        this.chip8.memory.write(I + 2, Vx / 1 % 10);
        break;
      }
      case "LD [I], Vx": {
        for (let n = 0;n <= i.x; n++) {
          this.chip8.memory.write(this.r.I + n, this.r.Vx[n]);
        }
        if (this.chip8.quirks.Memory)
          this.r.I += i.x + 1;
        break;
      }
      case "LD Vx, [I]": {
        for (let n = 0;n <= i.x; n++) {
          this.r.Vx[n] = this.chip8.memory.read(this.r.I + n);
        }
        if (this.chip8.quirks.Memory)
          this.r.I += i.x + 1;
        break;
      }
      case "ADD I, Vx": {
        this.r.I += this.r.Vx[i.x];
        break;
      }
      case "ADD Vx, kk": {
        this.r.Vx[i.x] += i.kk;
        break;
      }
      case "ADD Vx, Vy": {
        const sum = this.r.Vx[i.x] + this.r.Vx[i.y];
        this.r.VF = sum > 255 ? 1 : 0;
        if (i.x != 15)
          this.r.Vx[i.x] = sum & 255;
        break;
      }
      case "SUB Vx, Vy": {
        const VF = this.r.Vx[i.x] > this.r.Vx[i.y] ? 1 : 0;
        this.r.Vx[i.x] = this.r.Vx[i.x] - this.r.Vx[i.y];
        this.r.VF = VF;
        break;
      }
      case "SUBN Vx, Vy": {
        const VF = this.r.Vx[i.y] > this.r.Vx[i.x] ? 1 : 0;
        this.r.Vx[i.x] = this.r.Vx[i.y] - this.r.Vx[i.x];
        this.r.VF = VF;
        break;
      }
      case "AND Vx, Vy": {
        if (this.chip8.quirks.VF_Reset)
          this.r.VF = 0;
        this.r.Vx[i.x] &= this.r.Vx[i.y];
        break;
      }
      case "OR Vx, Vy": {
        if (this.chip8.quirks.VF_Reset)
          this.r.VF = 0;
        this.r.Vx[i.x] |= this.r.Vx[i.y];
        break;
      }
      case "XOR Vx, Vy": {
        if (this.chip8.quirks.VF_Reset)
          this.r.VF = 0;
        this.r.Vx[i.x] ^= this.r.Vx[i.y];
        break;
      }
      case "CALL addr": {
        this.r.push(this.r.PC);
        this.r.PC = i.addr;
        break;
      }
      case "RET": {
        this.r.PC = this.r.pop();
        break;
      }
      case "JP addr": {
        if (this.r.PC - 2 === i.addr) {
          console.info("detected infinite loop, stopping");
          this.chip8.stop();
        }
        this.r.PC = i.addr;
        break;
      }
      case "JP Vx, addr": {
        this.r.PC = i.addr + this.r.Vx[i.x] & 4095;
        break;
      }
      case "RND Vx, kk": {
        this.r.Vx[i.x] = randomInt(0, 255) & i.kk;
        break;
      }
      case "SE Vx, kk": {
        if (this.r.Vx[i.x] == i.kk)
          this.r.PC += 2;
        break;
      }
      case "SNE Vx, kk": {
        if (this.r.Vx[i.x] != i.kk)
          this.r.PC += 2;
        break;
      }
      case "SE Vx, Vy": {
        if (this.r.Vx[i.x] == this.r.Vx[i.y])
          this.r.PC += 2;
        break;
      }
      case "SNE Vx, Vy": {
        if (this.r.Vx[i.x] != this.r.Vx[i.y])
          this.r.PC += 2;
        break;
      }
      case "SHL Vx{, Vy}": {
        if (!this.chip8.quirks.Shifting) {
          this.r.Vx[i.x] = this.r.Vx[i.y];
        }
        const VF = this.r.Vx[i.x] >> 7 & 1;
        this.r.Vx[i.x] <<= 1;
        this.r.VF = VF;
        break;
      }
      case "SHR Vx{, Vy}": {
        if (!this.chip8.quirks.Shifting) {
          this.r.Vx[i.x] = this.r.Vx[i.y];
        }
        const VF = this.r.Vx[i.x] & 1;
        this.r.Vx[i.x] >>= 1;
        this.r.VF = VF;
        break;
      }
      case "SKNP Vx": {
        if (!this.chip8.input.keys[this.r.Vx[i.x]])
          this.r.PC += 2;
        break;
      }
      case "SKP Vx": {
        if (this.chip8.input.keys[this.r.Vx[i.x]])
          this.r.PC += 2;
        break;
      }
      case "LD Vx, K": {
        let key = this.chip8.input.keys.indexOf(true);
        if (key !== -1) {
          this.r.Vx[i.x] = key;
        } else {
          this.r.PC -= 2;
        }
        break;
      }
      case "CLS": {
        this.chip8.display.pixmap32.fill(255);
        break;
      }
      case "DRW Vx, Vy, n": {
        let Vx = this.r.Vx[i.x];
        let Vy = this.r.Vx[i.y];
        if (Vx >= this.display.width) {
          Vx = Vx % this.display.width;
        }
        if (Vy >= this.display.height) {
          Vy = Vy % this.display.height;
        }
        let sprite = [];
        for (let row = 0;row < i.n; row++) {
          sprite.push([this.chip8.memory.read(this.r.I + row)]);
        }
        this.r.VF = this.display.draw(Vx, Vy, sprite, this.chip8.quirks.Clipping) ? 1 : 0;
        break;
      }
      case "DRW16 Vx, Vy": {
        let Vx = this.r.Vx[i.x];
        let Vy = this.r.Vx[i.y];
        if (Vx >= this.display.width) {
          Vx = Vx % this.display.width;
        }
        if (Vy >= this.display.height) {
          Vy = Vy % this.display.height;
        }
        let sprite = [];
        for (let row = 0;row < 16; row++) {
          sprite.push([
            this.chip8.memory.read(this.r.I + row * 2),
            this.chip8.memory.read(this.r.I + row * 2 + 1)
          ]);
        }
        this.r.VF = this.display.draw(Vx, Vy, sprite, this.chip8.quirks.Clipping);
      }
      case "SAVE Vx": {
        this.r.save(i.x);
        break;
      }
      case "LOAD Vx": {
        this.r.load(i.x);
        break;
      }
      case "SCD n": {
        this.display.scroll(Direction.Down, i.n, this.chip8.quirks.Clipping);
        break;
      }
      case "SCR": {
        this.display.scroll(Direction.Right, this.display.width === 128 ? 4 : 2, this.chip8.quirks.Clipping);
        break;
      }
      case "SCL": {
        this.display.scroll(Direction.Left, this.display.width === 128 ? 4 : 2, this.chip8.quirks.Clipping);
        break;
      }
      case "LORES": {
        this.display.resize(64, 32);
        break;
      }
      case "HIRES": {
        this.display.resize(128, 64);
        break;
      }
      default:
        throw new Error(`Unimplemented instruction ${formatInst(i)}`);
    }
  }
}

// src/chip8/input.ts
class Input {
  keys;
  released;
  constructor() {
    this.keys = new Array(16).fill(false);
    this.released = new Array(16).fill(false);
  }
  tick() {
    for (let i = 0;i < 16; i++) {
      if (this.released[i]) {
        this.keys[i] = false;
        this.released[i] = false;
      }
    }
  }
  press(k) {
    this.keys[k] = true;
  }
  release(k) {
    this.released[k] = true;
  }
}

// src/chip8/rom.ts
var FONT_5x5 = new Uint8Array([
  240,
  144,
  144,
  144,
  240,
  32,
  96,
  32,
  32,
  112,
  240,
  16,
  240,
  128,
  240,
  240,
  16,
  240,
  16,
  240,
  144,
  144,
  240,
  16,
  16,
  240,
  128,
  240,
  16,
  240,
  240,
  128,
  240,
  144,
  240,
  240,
  16,
  32,
  64,
  64,
  240,
  144,
  240,
  144,
  240,
  240,
  144,
  240,
  16,
  240,
  240,
  144,
  240,
  144,
  144,
  224,
  144,
  224,
  144,
  224,
  240,
  128,
  128,
  128,
  240,
  224,
  144,
  144,
  144,
  224,
  240,
  128,
  240,
  128,
  240,
  240,
  128,
  240,
  128,
  128
]);
var FONT_10x10 = new Uint8Array([
  60,
  126,
  231,
  195,
  195,
  195,
  195,
  231,
  126,
  60,
  24,
  56,
  88,
  24,
  24,
  24,
  24,
  24,
  24,
  60,
  62,
  127,
  195,
  6,
  12,
  24,
  48,
  96,
  255,
  255,
  60,
  126,
  195,
  3,
  14,
  14,
  3,
  195,
  126,
  60,
  6,
  14,
  30,
  54,
  102,
  198,
  255,
  255,
  6,
  6,
  255,
  255,
  192,
  192,
  252,
  254,
  3,
  195,
  126,
  60,
  62,
  124,
  224,
  192,
  252,
  254,
  195,
  195,
  126,
  60,
  255,
  255,
  3,
  6,
  12,
  24,
  48,
  96,
  96,
  96,
  60,
  126,
  195,
  195,
  126,
  126,
  195,
  195,
  126,
  60,
  60,
  126,
  195,
  195,
  127,
  63,
  3,
  3,
  62,
  124,
  126,
  255,
  195,
  195,
  195,
  255,
  255,
  195,
  195,
  195,
  252,
  252,
  195,
  195,
  252,
  252,
  195,
  195,
  252,
  252,
  60,
  255,
  195,
  192,
  192,
  192,
  192,
  195,
  255,
  60,
  252,
  254,
  195,
  195,
  195,
  195,
  195,
  195,
  254,
  252,
  255,
  255,
  192,
  192,
  255,
  255,
  192,
  192,
  255,
  255,
  255,
  255,
  192,
  192,
  255,
  255,
  192,
  192,
  192,
  192
]);
var ROM = new Uint8Array(512);
ROM.set(FONT_5x5, 0);
ROM.set(FONT_10x10, 80);
var rom_default = ROM;

// src/chip8/memory.ts
class Memory {
  buffer;
  mem8;
  constructor() {
    this.buffer = new ArrayBuffer(4096);
    this.mem8 = new Uint8Array(this.buffer);
  }
  reset() {
    this.mem8.fill(0);
    this.mem8.set(rom_default, 0);
  }
  load(program) {
    this.mem8.set(program, 512);
  }
  tick() {
  }
  read(addr) {
    return this.mem8[addr & 4095];
  }
  write(addr, byte) {
    this.mem8[addr & 4095] = byte & 255;
  }
  dump() {
    return Array.from(this.mem8);
  }
  restore(save) {
    this.mem8.set(save);
  }
}

// src/chip8/timer.ts
class Timer {
  cpu;
  sound;
  constructor(cpu, sound) {
    this.cpu = cpu;
    this.sound = sound;
  }
  reset() {
  }
  tick() {
    if (this.cpu.r.DT) {
      this.cpu.r.DT--;
    }
    if (this.cpu.r.ST) {
      if (--this.cpu.r.ST) {
        this.sound.start();
      } else {
        this.sound.stop();
      }
    }
  }
}

// src/chip8.ts
var QuirkModes = {
  Chip8: { VF_Reset: true, Memory: true, Display_Wait: true, Clipping: true },
  SuperChip: { Clipping: true, Shifting: true, Jumping: true },
  XOChip: { Memory: true }
};

class Chip8 {
  cpu;
  memory;
  timer;
  sound;
  display;
  input;
  quirks = {};
  running = false;
  constructor(display2, sound) {
    this.quirks = QuirkModes.SuperChip;
    this.display = display2;
    this.sound = sound;
    this.memory = new Memory;
    this.input = new Input;
    this.cpu = new CPU(this, this.display, this.input, this.memory);
    this.timer = new Timer(this.cpu, this.sound);
    this.reset();
  }
  reset() {
    this.running = false;
    this.cpu.reset();
    this.memory.reset();
    this.timer.reset();
    this.display.reset();
  }
  load(program) {
    this.memory.load(program);
  }
  start() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  tick(steps = 8.333333333333334) {
    let i;
    for (i = 0;i < steps; i++) {
      const { op } = this.cpu.tick();
      if ((op == "DRW Vx, Vy, n" || op == "DRW16 Vx, Vy") && this.quirks.Display_Wait) {
        break;
      }
    }
    this.display.tick();
    this.timer.tick();
    this.input.tick();
  }
  save() {
    return {
      cpu: this.cpu.dump(),
      display: this.display.dump(),
      memory: this.memory.dump()
    };
  }
  restore({ cpu: cpu2, display: display2, memory: memory2 }) {
    this.cpu.restore(cpu2);
    this.display.restore(display2);
    this.memory.restore(memory2);
  }
}

// roms/index.ts
var roms_default = {
  "./5-hires/Hires Stars [Sergey Naydenov, 2010].ch8": {
    name: "Hires Stars [Sergey Naydenov, 2010]",
    filename: "./5-hires/Hires Stars [Sergey Naydenov, 2010].ch8",
    program: "EmABekJwIngiUsQZ+ACgm/oOsOLigOIgoOI8FYDiIKA0HJgyKasri7iIMgN7KDAE+AKum7/4AK/4AF8fjzo4Lo46ONQBm/8Bu9SbfAC8MIacfAC8+xAw/DqzMNkCRQIwYBJhvqIA8VWiSv1loOD9VaJY82Wg/PNVoH5gP/BVoIRgMGHg8VWg12Hm8VWiWvNlofrzVWD6oBjwVWAGoA3wVWACoArwVaAD8FUCrPgAsKCbsdBSRVZJVkFMMjAxMQIwEsZDOFBIYACFAMA4gVCmcvEe8FVgAIUAwDiBUKZ68R7wVWAApnLwHvBligBgAKZ68B7wZYsAYACmQvAe2rhgAaaE8FVgB6aG8FWmhPBlhQDAOIFQpnLxHvBVYACmg/BVpoTwZYUAYAGBAIBQgBWmiPBVpoTwZaZy8B7wZYUApoPwZaZy8B7wZYYAYAiBAIBggBSBAIBQggCAFYAgPwATnKaE8GWmcvAe8GWFAKaD8GWmcvAe8GWGAGAIgQCAYIAVgQCAUIIQgQWBID8AE5ZgAaaF8FUTnGAApoXwVaaD8GWFAKaI8GWBAIBQghCBBYEgkBBvAD8BE8Kmg/BlcAHwVRMypoXwZYUAYAGBUFAQbwE/ABPkpoTwZYUAwHiBUKZy8R7wVaaF8GWFAGAAgVBQEG8BkBBvAD8AExqmhPBlhQDAOIFQpnrxHvBVYACmg/BVpoTwZYUAYAGBAIBQgBWmiPBVpoTwZaZ68B7wZYUApoPwZaZ68B7wZYYAYAiBAIBggBSBAIBQggCAFYAgPwAUjKaE8GWmevAe8GWFAKaD8GWmevAe8GWGAGAIgQCAYIAVgQCAUIIQgQWBID8AFIZgAaaF8FUUjGAApoXwVaaD8GWFAKaI8GWBAIBQghCBBYEgkBBvAD8BFLKmg/BlcAHwVRQipoXwZYUAYAGBUFAQbwE/ABTUpoTwZYUAwBiBUKZ68R7wVaaF8GWFAGAAgVBQEG8BkBBvAD8AFAqmhPBlpnLwHvBligCmhPBlpnrwHvBliwBgAKZC8B7auKaE8GWFAKaG8GWBAIBQghCBBYEgkBBvAD8BFTCmhPBlcAHwVRMKwAemgvBVpoLwZaZy8B7wZYoApoLwZaZ68B7wZYsApoLwZaZq8B7wZaZC8B7wZdq4YArwFaaC8GWFAKaC8GWmavAe8GWGAGAIgQCAYIAUgVCmavEe8FWmgvBlpmrwHvBlhQBgIIEAgFCCEIEFgSA/ABWypoLwZYUAYACBUKZq8R7wVaaC8GWFAGAygVBQEG8BkBBvAD8AFTAVyIEApoliAY4l/h7wZQDuYgFjAIMEgSUxABXcgDAA7qaJ/h72VWYAggCCFT8BFhSDAIMGhBBlAYIwgkU/ARYOhA6FDhYAgEWGVBXw9WWAYADuggCAFT8AFhqAIADupj7wM/Jl8CnTRXMG8SnTRXMG8inTRQDuAAD//wAAABAAAAAAAAA4KDgAAAAAVABEAFQAAJIAAIIAAJIAklQ4/jhUkgAICAgICAgICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="
  },
  "./5-hires/Hires Sierpinski [Sergey Naydenov, 2010].ch8": {
    name: "Hires Sierpinski [Sergey Naydenov, 2010]",
    filename: "./5-hires/Hires Sierpinski [Sergey Naydenov, 2010].ch8",
    program: "EmABekJwIngiUsQZ+ACgm/oOsOLigOIgoOI8FYDiIKA0HJgyKasri7iIMgN7KDAE+AKum7/4AK/4AF8fjzo4Lo46ONQBm/8Bu9SbfAC8MIacfAC8+xAw/DqzMNkCRQIwYBJhvqIA8VWiSv1loOD9VaJY82Wg/PNVoH5gP/BVoIRgMGHg8VWg12Hm8VWiWvNlofrzVWD6oBjwVWAGoA3wVWACoArwVaAD8FUCrPgAsKCbsdBSRVZJVkFMMjAxMQIwEsZDOFBIYACFAGABgVCksvEe8FVgH4oAYBCLAKSO8GXasWABpI/wVWAfpNLwVWABpJDwVaSP8GWFAGABgQCAUIAUpNPwVaSQ8GWFAGABgQCAUIAVpJHwVaSQ8GWFAKSR8GWksvAe8GWGAKSQ8GWHAGABgQCAcIAUpLLwHvBlgQCAYIATgVCkkvEe8FWkkfBlhQCkkfBlpJLwHvBlgVCksvEe8FWkkPBlpJLwHvBlhQBgAYFQUBBvAT8AE8ikkPBlhQBgH4EAgFCAFIoApI/wZYUAYBCBAIBQgBSLAKSO8GXasWAfhQCkkPBlgQCAUIAVigCkj/BlhQBgEIEAgFCAFIsApI7wZdqxpJDwZYUApNPwZYEAgFCCEIEFgSCQEG8APwET7qSQ8GVwAfBVEwakj/BlhQCk0vBlgQCAUIIQgQWBIJAQbwA/ARQUpI/wZXAB8FUS7hQUgQCk1GIBjiX+HvBlAO5iAWMAgwSBJTEAFCiAMADupNT+HvZVZgCCAIIVPwEUYIMAgwaEEGUBgjCCRT8BFFqEDoUOFEyARYZUFDz1ZYBgAO6CAIAVPwAUZoAgAO6kivAz8mXwKdNFcwbxKdNFcwbyKdNFAO4AAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  },
  "./5-hires/Trip8 Hires Demo (2008) [Revival Studios].ch8": {
    name: "Trip8 Hires Demo (2008) [Revival Studios]",
    filename: "./5-hires/Trip8 Hires Demo (2008) [Revival Studios].ch8",
    program: "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BQ4bCxEVDgcbDgQODxUPBxkQAw0RBw4VFRICDBMHDBQREgMKFAgLFA0RFQgFCBoUCg4YFhcJCAYKCxUYGAsIEQwHEhgZDAcQEBcQBQYOGQ4OFRQFBwwYEA4TGQYIChcSDxIcCQsIBRIREQ4HAg8cDRISAgwSBw0UExQFCBYJChMSFgoFGAsHEQ8XEAUZDgYOFQcMFwcMGBAZDAgXCQkWEhoQBRULCBMTFxUOCAMSGgsTGBEJAg8bDRILDhkCDBwPEQ0JGAQJGxMQEAwUBxcEGgMcAx0FHQgbDBkQFhQTFxAaDRsKGwgZBhcFEwYQBw0ICgsHDgYQBhIIFQoXDRgQGRMZFhgYFxkUEBkPFw0XChkGGgYWCRMJEQcQAw4DCwgLCwsMCgwGDgIQBBEIEgoUCRkHGwkZDRcPFxAaEh0VGhYVFRQWExgSHRAZDhcNFwsXCBcFGQIZAxcIFAsSDhEQEBEQFA4ZCxwJHAkZCRcKFgoUCRMHEQQPAgsDCQYJCQkKCQsICwcLBwsQGRMYFRcWFhgVGBUYFBUSEBALDgkMCAwJCwoKCwkNCBAGFAQaAx0EHAgZCxUNEg8QEA0RChMGFgMZAxwHHAwa"
  },
  "./5-hires/Hires Maze [David Winter, 199x].ch8": {
    name: "Hires Maze [David Winter, 199x]",
    filename: "./5-hires/Hires Maze [David Winter, 199x].ch8",
    program: "EmABekJwIngiUsQZ+ACgm/oOsOLigOIgoOI8FYDiIKA0HJgyKasri7iIMgN7KDAE+AKum7/4AK/4AF8fjzo4Lo46ONQBm/8Bu9SbfAC8MIacfAC8+xAw/DqzMNkCRQIwYBJhvqIA8VWiSv1loOD9VaJY82Wg/PNVoH5gP/BVoIRgMGHg8VWg12Hm8VWiWvNlofrzVWD6oBjwVWAGoA3wVWACoArwVaAD8FUCrPgAsKCbsdBSRVZJVkFMMjAxMQIwYABhAKLiwgEyAaLe0BRwBDBAEsRgAHEEMUASxBLcgEAgECBAgBA="
  },
  "./5-hires/Astro Dodge Hires [Revival Studios, 2008].ch8": {
    name: "Astro Dodge Hires [Revival Studios, 2008]",
    filename: "./5-hires/Astro Dodge Hires [Revival Studios, 2008].ch8",
    program: "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"
  },
  "./5-hires/Hires Worm V4 [RB-Revival Studios, 2007].ch8": {
    name: "Hires Worm V4 [RB-Revival Studios, 2007]",
    filename: "./5-hires/Hires Worm V4 [RB-Revival Studios, 2007].ch8",
    program: "EmABekJwIngiUsQZ+ACgm/oOsOLigOIgoOI8FYDiIKA0HJgyKasri7iIMgN7KDAE+AKum7/4AK/4AF8fjzo4Lo46ONQBm/8Bu9SbfAC8MIacfAC8+xAw/DqzMNkCRQIwYBJhvqIA8VWiSv1loOD9VaJY82Wg/PNVoH5gP/BVoIRgMGHg8VWg12Hm8VWiWvNlofrzVWD6oBjwVWAGoA3wVWACoArwVaAD8FUCrPgAsKCbsdBSRVZJVkFMMjAxMQIwEwxXb3JtIHYu9CzgYnk6IFJCLOBDaGlwLfggdmVyc2lvbiBieTogTWFydGlqbiBXZW50aW5nIC8gUmV2aXZhbCBTdHVkaW9zUkI5MgIwYABhAGIAYz5kAGUAZhRnfGgAaQBqBmsObAFtAG4EpHHwVfwecQExABMupFvas6Ra1CHUMXQCNDoTPqRoYwDTIdQhcgEyPxNMowjwZaLC8DOiwvUzI+wkPqRn12F2AjZAE2ZjBvMVpHH4HvBlhACAoKRx+B7wVaVx+B7wZYEAgLClcfge8FWkXjQA1BOkUvke8WWkYdqyigSLFKRb2rM/ABQGwA9AACQ6eAGY4GgAYwbzFWb/YQbhoWYAYQLhoWYCYQThoWYEYQjhoWYGNv+JYPMHMwATwBNwI+yiwvUzYwBkPKLC8mXwKdQ1cwbxKdQ1cwbyKdQ1AO4kSqRb2rPasz8AFBxkAvQYdQEj5hO2ZAr0GNqzigWLFaRh2rKjCPBlowiAVYBQTwDwVRQ4fgEA7qRjzD/NP9zUTwAA7qRj3NQUQP//BAAA/PwAAATA4ODg4KDgAEAwWHgw8ICAgICAgICAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  },
  "./5-hires/Hires Particle Demo [zeroZshadow, 2008].ch8": {
    name: "Hires Particle Demo [zeroZshadow, 2008]",
    filename: "./5-hires/Hires Particle Demo [zeroZshadow, 2008].ch8",
    program: "EmABekJwIngiUsQZ+ACgm/oOsOLigOIgoOI8FYDiIKA0HJgyKasri7iIMgN7KDAE+AKum7/4AK/4AF8fjzo4Lo46ONQBm/8Bu9SbfAC8MIacfAC8+xAw/DqzMNkCRQIwYBJhvqIA8VWiSv1loOD9VaJY82Wg/PNVoH5gP/BVoIRgMGHg8VWg12Hm8VWiWvNlofrzVWD6oBjwVWAGoA3wVWACoArwVaAD8FUCrPgAsKCbsdBSRVZJVkFMMjAxMQIwo+FgAGEEYgjQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFWYFZwJqABN4awBsAKOY+x7zZSOOIxwTIiOOIxx7BHwBXGATABL8EsCj4N7RAO6jmPse82WAJIE0jgCNEI7mjdaE4GXChFRPARNSTQBjAYTQZeGEVE8BE1IzAnMBE1QjXKOY+x7zVRMMo8D6HvBlggB6AWQfikJgIGEegA6BHsMDc/gA7msAbAAjXKOY+x7zVXsEfAFcYBN8EvyOAI0QjuYA7v//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPj6+f77/P3/AgEDBQQGBwgGBwQFAwEC/v/8+/36+fj6gPcGdwY2AAAAx2zPDAwAAACf2d/Z2QAAAD+MDIyMAAAAZ2xsbGcAAACwMDAwvgAAAPnD8cD7AAAA7wDOYMwAAAA="
  },
  "./5-hires/Hires Test [Tom Swan, 1979].ch8": {
    name: "Hires Test [Tom Swan, 1979]",
    filename: "./5-hires/Hires Test [Tom Swan, 1979].ch8",
    program: "EmABekJwIngiUsQZ+ACgm/oOsOLigOIgoOI8FYDiIKA0HJgyKasri7iIMgN7KDAE+AKum7/4AK/4AF8fjzo4Lo46ONQBm/8Bu9SbfAC8MIacfAC8+xAw/DqzMNkCRQIwYBJhvqIA8VWiSv1loOD9VaJY82Wg/PNVoH5gP/BVoIRgMGHg8VWg12Hm8VWiWvNlofrzVWD6oBjwVWAGoA3wVWACoArwVaAD8FUCrPgAsKCbsdAAAAAAAAAAAAAAAAIwYABhAKLS0BRwBHEEMUASxhLQ8PDw1A=="
  },
  "./3-games/Squash [David Winter].ch8": {
    name: "Squash [David Winter]",
    filename: "./3-games/Squash [David Winter].ch8",
    program: "otJgAGEAYh7QEdAhcAgwQBIIos1gPmEB0BVxBTEaEhjQFGMAxA90CGUBhFFlA2YCZwGIQHgCaQFqBGsFIriiyNNF14FsASKuosiMcI2A6Z4SXEQBElzTRXT/00XqnhJqRBkSatNFdAHTRYdUiGRHAWUDRz1l/UgBZgJIHWb+3NHXgTcBEkSMgIxFbQCc0BJEfQE9BRKM/AoiuHv/Irg7/xJEIrhrACK4bB4irhKm/BX8BzwAErAA7qLT+zPyZfIpYDlhAtAVAO6AgICAgODg4ODg/w=="
  },
  "./3-games/Hidden [David Winter, 1996].ch8": {
    name: "Hidden [David Winter, 1996]",
    filename: "./3-games/Hidden [David Winter, 1996].ch8",
    program: "Eh1ISURERU4hIDEuMCBCeSBEYXZpZCBXSU5URVKkP2AAYUDxVaQ/YADwVQDgpH5gDGEIYg/QH3AI8h4wNBI18AoA4KTJYBNhDWIE0BRwCPIeMCsSS6Qf/2WkL/9VY0BmCMEPwg+kL/Ee8GWEAKQv8h7wZYUAgEDwVaQv8R6AUPBVc/8zABJhAOBgAGEApHfQF3AIMCASj2AAcQgxIBKPbABtAG4ApD/wZXAB8FUjuWoQI10jzYqQh9CI4CNdI80juaQv+R7wZYEApC/6HvBlUBATKyPfYCAkASPfYACkL/ke8FWkL/oe8FV2/zYAEqWkP/FlggCAFT8AEwGAIIEg8VUA4KUZYBBhB2IO0B9wCPIeMDATC6Q/8WWEEIMAZgkkC2YPg0AkC/AKEiUj22CAJAEj26Qv+h7wZXD/I/OkQfAe14ekd9eHpC/5HvBlcP8j86RB8B7d56R33ecSpaRx3ef7Ct3nOwQTcU0AE119+Hz/OwYTfU0YE119CHwBOwITiU4AE11++Hz8OwgTlU4YE11+CHwEOwUTXaQv/B7wZUAAE12JwJmgE11w/6R33eekQSPz8B7d5wDupNVgJGEKYgvQG3AI8h4wPBPBAO5gNGEQpPHQFaT20BUA7qT7E+GlCmAkYQ1iBdAVcAjyHjA8E+cA7oEAgRSABIAEgASAFQDu8BXwBzAAFAMA7qQv8zPyZWUj8SnVZWUo8inVZQDuAQIDBAgHBgUFBgcIBAMCAQECAwQIBwYFBQYHCAQDAgEAAP7uxoLG7v7+xsbG/v7GqoKqxv7GgoKCxv661u7Wuv7u7oLu7v6C/oL+gv6qqqqqqv7+/v7+/v6q1qrWqv6LiPiIiwAAAAAA8EhISPLvhISE7wAICAoAioqqqlI8kpKSPADio+MAi8iomIj6g+KC+gAouJAA74iOiI8hIaFgIQAAAAAAvCI8KKSJiqtSl1HRUcAAABVqio6KagBkio6KakSqqqpEAMyqyqqsbohMKM4ABAwEBA4MEgQIHmOUlJRjOKW4oCHhAcEgwYmKUiIhzygvKMgCggIAAv+Aj5COgZ6AkZGfkZGA/wA8QEBAPAB8EBAQfAD/AACAAIAAAACAAIAAAP8BAQEBAQEBAQEBAQEB/w=="
  },
  "./3-games/Space Invaders [David Winter].ch8": {
    name: "Space Invaders [David Winter]",
    filename: "./3-games/Space Invaders [David Winter].ch8",
    program: "EiVTUEFDRSBJTlZBREVSUyAwLjkxIEJ5IERhdmlkIFdJTlRFUmAAYQBiCKPd0BhxCPIeMSASLXAIYQAwQBItaQVsFW4AI5FgCvAV8AcwABJLI5F+ARJFZgBoHGkAagRrCmwEbTxuDwDgI3UjUf0VYATgnhJ9I3U4AHj/I3VgBuCeEosjdTg5eAEjdTYAEp9gBeCeEulmAWUbhICj2dRRo9nUUXX/Nf8SrWYAEunUUT8BEunUUWYAg0BzA4O1YviDImIIMwASySN9ggZDCBLTMxAS1SN9ggYzGBLdI32CBkMgEuczKBLpI30+ABMHeQZJGGkAagRrCmwEffRuDwDgI1Ejdf0VEm/3BzcAEm/9FSNRi6Q7EhMbfAJq/DsCEyN8AmoEI1E8GBJvAOCk3WAUYQhiD9AfcAjyHjAsEzNg//AV8AcwABNB8AoA4KcG/mUSJaPB+R5hCCNpgQYjaYEGI2mBBiNpe9AA7oDggBIwANvGewwA7qPZYBzYBADuI1GOIyNRYAXwGPAV8AcwABOJAO5qAI3gawTpoRJXpgz9HvBlMP8Tr2oAawRtAW4BE5elCvAe28Z7CH0BegE6BxOXAO48fv//mZl+//8kJOd+/zw8ftuBQjx+/9sQOHz+AAB/AD8AfwAAAAEBAQMDAwMAAD8gICAgICAgID8ICP8AAP4A/AD+AAAAfkJCYmJiYgAA/wAAAAAAAAAA/wAA/wB9AEF9BX19AADCwsZEbCg4AAD/AAAAAAAAAAD/AAD/APcQFPf3BAQAAHxE/sLCwsIAAP8AAAAAAAAAAP8AAP8A7yAo6OgvLwAA+YXFxcXF+QAA/wAAAAAAAAAA/wAA/wC+ACAwIL6+AAD3BOeFhYT0AAD/AAAAAAAAAAD/AAD/AAB/AD8AfwAAAO8o7wDgYG8AAP8AAAAAAAAAAP8AAP8AAP4A/AD+AAAAwADAwMDAwAAA/AQEBAQEBAQE/BAQ//mBuYuamvoA+oqampuZ+OYlJfQ0NDQAFxQ0NzYmx99QUFzY2N8A3xEfEhsZ2XxE/oaGhvyE/oKC/v6AwMDA/vyCwsLC/P6A+MDA/v6A8MDAwP6AvoaG/oaG/oaGhhAQEBAQEBgYGEhIeJyQsMCwnICAwMDA/u6SkoaGhv6ChoaGhnyChoaGfP6C/sDAwHyCwsrEev6G/pCchP7A/gIC/v4QMDAwMIKCwsLC/oKCgu44EIaGlpKS7oJEODhEgoKC/jAwMP4CHvCA/gAAAAAGBgAAAGBgwAAAAAAAABgYGBgAGHzGDBgAGAAA/v4AAP6ChoaG/ggICBgYGP4C/sDA/v4CHgYG/oTExP4EBP6A/gYG/sDAwP6C/v4CAgYGBnxE/oaG/v6C/gYGBkT+RET+RKioqKioqKhsWgAMGKgwTn4AEhhmbKhaZlQkZgBISBgSqAaQqBIAfjASqIQwTnIYZqioqKioqJBUeKhIeGxyqBIYbHJmVJCocioYqDBOfgASGGZsqHJUqFpmGH4YTnKocioYMGaoME5+AGwwVE6cqKioqKioqEhUfhiokFR4ZqhsKjBaqIQwciqo2KgAThKo5KKoAE4SqGwqVFRyqIQwciqo3pyocioYqAxUSFp4chhmqGYYWlRmcmyocioAcqhyKhioME5+ABIYZmyoAGYYqDBODGYYAGwwTiSocioYMGaoHlRmDBicqCRUVBKoQngMPKiuqKioqKioqP8AAAAAAAAAAAAAAAAAAAA="
  },
  "./3-games/Spooky Spot [Joseph Weisbecker, 1978].ch8": {
    name: "Spooky Spot [Joseph Weisbecker, 1978]",
    filename: "./3-games/Spooky Spot [Joseph Weisbecker, 1978].ch8",
    program: "AOAiQiJU+gqikGEAYhDRIT8AEjZqBPoYagr6FfoHOgASHHEBygE6AWr/gqRCB3IBQhhy/xIOahCKIjoAEkAiWiJqonBkCGMw00hqCPoecwjTSADuooBkEBJGZAhjMaKQ00hzATNAEmASaGQQElwBAX9/ampidnZ///8j72P7I/9/dnJwdHZ/f/+Ht7e3h///gICAgICAgICA1A=="
  },
  "./3-games/Lunar Lander (Udo Pernisz, 1979).ch8": {
    name: "Lunar Lander (Udo Pernisz, 1979)",
    filename: "./3-games/Lunar Lander (Udo Pernisz, 1979).ch8",
    program: "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"
  },
  "./3-games/Animal Race [Brian Astle].ch8": {
    name: "Animal Race [Brian Astle]",
    filename: "./3-games/Animal Race [Brian Astle].ch8",
    program: "bQpuAmgOaQultSSCaCwkhGgdaRgkhGsAbCMkWCTAaCFpAKTY+x7YlP4YewRLHGsEfP8kwDwAEhoA4PkYJFgkwGoAawqmAPoe92ViDHQB+ynSRWIT8ynSRWIXpqDSRXoIewE6KBJEaCBpAqXiJIBiJmMI0jel/f0z8mVjLGQJQAASiPAp00USjEEAEpLxKWMx00XyKWM200WmgGgkaREkhGg2pqXYlW8K/xUkSjAQErj/Bz8AEqoSpP4YjABqCYrFTwESpEwPEqTYlU8AEsj8KdiVJKCl9mMsZBfTR2M2ZBimpdNFbwr/FSRKMBAS9v8HPwAS6BLi/hiLAIrQirVPABLiSwAS4moJirVPABLi00VPABMO+ynTRSSUAOAkwCSgpNZgOGEA0BFxATEgEyZgHmEPagP6KdAV/hgklHr/0BU6ABM0agCmAPoe9mWmAPoecP9AABNa8FUTcsABcAKRUIFlcQZyAfJVpQDxHtJGQjgTgHoIShj+GDooE0b+GBNE8hhoBmkIpeIkhIemh3aHdncKl8ATwKaUJIQksvspjbXYlT0AE+4kkNiVJLKlJWgIaQPYlW8QJJbYlYnzE7IA7qaKJIQksqYA+h72ZWcAh7Rz/zMAE86l/fcz8mVBABPk8SkkhvIp2JWNdE8BFAymAPoe9mWlAPEe0kVvGP8V/wckSjAQEjg/ABP+E/gkkADgZA5iAGFApeJoBmkIJISmiiSEpgDxHtJIcgEyQBQ2dAk0IBQSFA5xCEF4YUhtB40iTQAUFm8EJJYUImAA4KEA7nABQBAA7hRMpgBhAGYEJGYkZiRmJGbAAXABwgOHLmMGg3XHAYN0gwTzVXEk9h4A7iSGJIYkhtiVbwX/HngIAO4kkiSUbzz/GP8HPwAUmADupp5oAInOiZ6JnonFebvYkgDupfZoCGkQ2JdoEGkRAO5qAKYA+h70ZaUA8R7SRnoIOigUwgDuAQGBfhgAmULbAAAAgYEAAADDPGYYQkLDQgDn5wAAAO6OioqK7u6I7CjuAwICDgoKBQYGEh4FBQYGEh4oBQYGEh4QBQYGEh4CBQYGEh4FAD8/PSUkAEFBR24KAEFBR22QAEFBR28AAEFBR24SAEFBR22QAAMGDhQmAAUKIiBAAwACaDYYBg8aFkgDAAUKQgwAAAUKQgAAAAsePiIiAB0iQmYFAB0iQmaAAB0iQmYQAB0iQmYIAB0iQmYBAAITHhISAhc4LgYkBCQvOlYRAAY1IjYoAAY1IjYAAhc4LgYoAemt66mpUVtVUVF0VHRUV/eV96WVd0RGRHfvqK7ivvOSk5KfFxUXERF3FRcVFysqEhITqKioqLiuqu6qqq6orqhOIHigcCjwIAABAAIAAwIAHhgAASQDAQZCEgABSAAIDWYYAAJoAwMTihgAAZADARquGAABCDgGABgYAQEEMQAFGBgBf0gcHAtMGAADAgIOXgQmVAUGBtKiTObBBQbG0uLMuJAFhgZSIkxeYAUGhtKijMbBBQaGkiKMmDAABgYSYgw+EADuYxokwADu8JD3kJB4QHBAeKupqalTojIqJqKOioqK7u6I7CjuAMAYSAhIHOAgYABA"
  },
  "./3-games/ZeroPong [zeroZshadow, 2007].ch8": {
    name: "ZeroPong [zeroZshadow, 2007]",
    filename: "./3-games/ZeroPong [zeroZshadow, 2007].ch8",
    program: "EnJgA/AVorBgCuCeEhbXhngB14YSImAL4J4SIteGeP/XhmAI4J4SMNmmegHZphI8YALgnhI82aZ6/9mmorbTQYNUhGRDABJ6Qz8SekQAZgFEH2b/00E/ARJqQwJlAUM+Zf/TQWDI8BgSQGAP4KESchICZwJoCmk+agpjIGQQxQFFABKIZf8SimUBxgFGABKUZv8SlmYBAOCisNeG2aaittNBYA/goRKqEqLgnhICEqqAgICAgICAAA=="
  },
  "./3-games/Sequence Shoot [Joyce Weisbecker].ch8": {
    name: "Sequence Shoot [Joyce Weisbecker]",
    filename: "./3-games/Sequence Shoot [Joyce Weisbecker].ch8",
    program: "AOBuAG0AoyZoCGkL2JyjMmkX2JmjO2gQaRPYkmgyaQIjEmkKIxJpEiMSaRojEiL2Yf8jGGwAfQGK0CJwev86ABI6YACkAPwe8FUirDoAEloi9o7UIvY+FhIyYhLyGGEa8RXxBzEAEmJy/jIAElwSbssDewyAsKQA/B7wVXwBYf8jGGgyaRpLDGkCSw1pCksOaRIjEmFgIxgjEmEPIxgjEmEPIxgjEmEPIxgA7moApAD6HnoB8GUwABK+agAA7vsKYQLyGIsFSwAS0mH/IxhqAQDucPJoE2kToyHYkWEIIxhPARLw2JFhCCMYeASJBBLaYQLxGBNAo4D+M/Jl8CloEGkC2JXxKXgG2JXyKXgG2JUA7qMi2JQA7nH/MQATGADuAYDw8PDwfHz+fHxwfDh/f3x8fHx8ODg4ODg+4IAA1NTYkRKu"
  },
  "./3-games/UFO [Lutz V, 1992].ch8": {
    name: "UFO [Lutz V, 1992]",
    filename: "./3-games/UFO [Lutz V, 1992].ch8",
    program: "os1pOGoI2aOi0GsAbAPbw6LWZB1lH9RRZwBoDyKiIqxIABIiZB5lHKLT1FNuAGaAbQTtoWb/bQXtoWYAbQbtoWYBNoAi2KLQ28PNAYvU28M/ABKSos3Zo80BPQBt/3n+2aM/ABKMTgASLqLT1FNFABKGdf+EZNRTPwESRm0IjVJNCBKMEpIirHj/Eh4ioncFEpYioncPIqJtA/0YotPUUxKGovj3M2MAIrYA7qL4+DNjMiK2AO5tG/Jl8CnT1XMF8SnT1XMF8inT1QDuAXz+fGDwYEDgoPjUbgFtEP0YAO4="
  },
  "./3-games/Pong 2 (Pong hack) [David Winter, 1997].ch8": {
    name: "Pong 2 (Pong hack) [David Winter, 1997]",
    filename: "./3-games/Pong 2 (Pong hack) [David Winter, 1997].ch8",
    program: "IvxrDGw/bQyi6tq23NZuACLUZgNoAmBg8BXwBzAAEhrHF3cIaf+i8NZxourattzWYAHgoXv+YATgoXsCYB+LAtq2YAzgoX3+YA3goX0CYB+NAtzWovDWcYaEh5RgP4YCYR+HEkYAEnhGPxKCRx9p/0cAaQHWcRIqaAJjAYBwgLUSimj+YwqAcIDVPwESomECgBU/ARK6gBU/ARLIgBU/ARLCYCDwGCLUjjQi1GY+MwFmA2j+MwFoAhIWef9J/mn/Esh5AUkCaQFgBPAYdgFGQHb+Emyi8v4z8mXxKWQUZQLUVXQV8inUVQDugICAgICAgAAAAAAAwMDAAP8AayBsAKL228R8BDwgEwJqAGsAbB+i+tqx2sF6CDpAExKi9moAayDboQDu"
  },
  "./3-games/Brick (Brix hack, 1990).ch8": {
    name: "Brick (Brix hack, 1990)",
    filename: "./3-games/Brick (Brix hack, 1990).ch8",
    program: "bgVlAGsGagCjDNqxegQ6QBIIewE7EhIGbCBtH6MQ3NEi9mAAYQCjEtARcAijDtARYEDwFfAHMAASNMYPZx5oAWn/ow7WcaMQ3NFgBOChfP5gBuChfAJgP4wC3NGjDtZxhoSHlGA/hgJhH4cSRx8SrEYAaAFGP2j/RwBpAdZxPwESqkcfEqpgBYB1PwASqmAB8BiAYGH8gBKjDNBxYP6JAyL2dQEi9kXAExgSRmn/gGCAxT8BEsphAoAVPwES4IAVPwES7oAVPwES6GAg8BijDn7/gOCABGEA0BE+ABIwEt54/0j+aP8S7ngBSAJoAWAE8Bhp/xJwoxT1M/Jl8SljN2QA00VzBfIp00UA7vAAgAD8AKoAAAAAAG4FAOASBA=="
  },
  "./3-games/Hi-Lo [Jef Winsor, 1978].ch8": {
    name: "Hi-Lo [Jef Winsor, 1978]",
    filename: "./3-games/Hi-Lo [Jef Winsor, 1978].ch8",
    program: "bAnND4zVTwASAInQbAnND4zVTwASDIrQbgCiqn4B/jPyZWswbBBoD/Ep28V7BfIp28VIABJUZgrxCoFlPwASNnEKZgryCoJlPwASQnIKaxBoABIogZUxABJygqUyABKGayBlGPkp28V7Bfop28X8GBJwZfCBUjEAEo6in2sQbBjbxfYKEpJl8IJSQgASeqKkEnxOChKaAOASGtvFEmABl5LykpePiYmJ79Q="
  },
  "./3-games/Blinky [Hans Christian Egeberg] (alt).ch8": {
    name: "Blinky [Hans Christian Egeberg] (alt)",
    filename: "./3-games/Blinky [Hans Christian Egeberg] (alt).ch8",
    program: "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"
  },
  "./3-games/Craps [Camerlo Cortez, 1978].ch8": {
    name: "Craps [Camerlo Cortez, 1978]",
    filename: "./3-games/Craps [Camerlo Cortez, 1978].ch8",
    program: "YQgiWGESIlj+CmEJImCHAGETImCIAImAiXRJAhKcSQMSnEkMEpxJBxKMSQsSjIqQYEDwFfAHMAASNCJ8/gphCSJghwBhEyJgiACJgIl0maASjEkHEpwSMKLwYgjRJwDuZgFiCWAB8CnRJfYYwwdDAADucAHRJTAHEmYSZGIJYQn3KdElYRP4KdElAO6irGAAYRXQFaKxYAjQFRKaorZgAGEQ0BWiu2AI0BUSqouJianbsjIqJqaOioqK7u6I7Cju"
  },
  "./3-games/Most Dangerous Game [Peter Maruhnic].ch8": {
    name: "Most Dangerous Game [Peter Maruhnic]",
    filename: "./3-games/Most Dangerous Game [Peter Maruhnic].ch8",
    program: "YAGl8PBVYP9hAPBVcQExgBIKAOBgD2EGYgNjAGQuZR5mAaZx9lWl79RRYgVkEmUC1FGmePZVpe9iBGEU0SFxBDEwEjxyBDIgEjpuAaZxItYjECNyPwASaiMQIxojMj8AEogjGqaCItYSTD8BEowA4GAFIqYjECQkIxAipiKmIxBw/zAAEnISAD8BEm4A4GAFIqYjGiQkIxoipiKmIxpw/zAAEpASAGoQaxClyNq1egilzdq1egil0tq1egil19q1AO4BAAAAAAAAAAAAAAAAAAAAAAAA1PFlpoLxVYMQagFrBCLsgDBqMyLsAO6mf/Az8mVAABMI8CnatXoF8SnatXoF8inatQDuQQATAHoCEvxqA2sXpdzatwDuajdrF6Xj2rcA7gEAAAAAAAAAAAAAAADUpnH2ZSOgPwMTQnL/MgATNqZx8mWmcfZVTwEA7j8CQQATZGYEYwEjoE8AE2Rx/08BAO5w/28AQABv/6Zx8VUA7qZ49mVELjUeE4BvAQDuI6BPAROcPwMTkHL/MgATdm8ApnjyZaZ49lUA7m//AO6mhPlVpe8kMG8AQAAT9kMB1FFsAG0AQAJs/0AEbf9ABm0BQAhsAYpAi1AkGiQkJBokrqXvQAAUBCQaJCQkGk8BFBKEoIWwdv82ABPKbQL9GEMB2rFvA6aEikCLUPllhKCFsADubRD9GNqxQwDUUW8CE/ZtIP0YbwET9tqxitSLxNqxAO5oCPgV+Ac4ABQoAO5gANRR4KEUQHACMAoUNBQwbQj9GD8A1FHgoRRIAO6EHoROhS6DJj8BFGR0EHX/pezUUwDudBGl6tRRAO4BAADUpKCBDoAU8B7yZaXxgITwHvBl8R6BAPBl8h6CEIIFPwCBAPBlggCCFT8AgBAA7gEABwAH8AYA+QcH+AYIANRgADoQSjAA7jsASyAA7oGmgRZx/IK2po7/VYguiI6IjogUpfH4HvBlQP8U4ED+Fb4VqsP/ZnCDZE8BFPRg/qXx+B7wVRW+gyY/ARUeMgEVCGoAYAAkcIsAFUIyDxUWawBgASRwigAVQmABJHCKABUAMQAVLGoAYAIkcIsAFUIxBxU6awBgAyRwigAVQmADJHCKABUkWrAVZDr+Sv8VVqXx+B5g/vBVFb6l8PBlcAGl8PBVigAVloOgg7VPABVyg6CKsIswSv4VVjv+S/8VlmP/pfFDgBWW8GVzAVsAFYCl8fMegKDwVRWApfH4HoCg8FVOABWqpo7yZSROFaqmjv9lJE5tHv0YJE6mjvVlYAAA7qaO/2VgAQDuAQCKiqraiorLqpqKLyiuaC97S3tQSxAgQL9AIBAIBAL9AgQI4ACAgICAANQ="
  },
  "./3-games/Blinky [Hans Christian Egeberg, 1991].ch8": {
    name: "Blinky [Hans Christian Egeberg, 1991]",
    filename: "./3-games/Blinky [Hans Christian Egeberg, 1991].ch8",
    program: "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AMAAAACAgAAAwICAgMAAgAAMCAgICAgICAgICAgICAgNDAgICAgICAgICAgICAgIDQplBQUFBeUFBeUFBQUFxQoKZQUFBQXlBQXlBQUFBcUKCgUMCAgPBQwNBQgICA0FDg8FDAgIDwUMDQUICAgNBQoKBQplBgWVCgo1BQXFCjUFBZUKZQUFlQoKNQUGxQoFCgoFDwUICAgICAwIDwUICAgICA8FCAgMCAgICA8FDwUKCnUFtQUFBQXFCmUFtQXlBQXlBbUFxQplBQUFBbUF1QoKBQwICAgIDQUPBQwIDwUIDwUICA0FDwUMCAgICA0FCg8FD2UFBcUKNeWVCmUFsAUFtQXFCjXllQplBQXFDwUPB3QF1QgPBQ4PBQgPBQwICAgIDQUIDwUIDwUID3UF1AcKBQo1BQX1BQW1BQXVCAgNDAgPdQUFtQUF9QUFlQoFCgoFCAgIDQUMCAgIDTUFxQoKZQWVDAgICA0FDAgIDwUKCnUFBsUKBQgICAgICA8FCA8FCAgICAgIDwUKZQYF1QoKBQwNBQo1BQUFBeUFBfUFBfUFBeUFBQUFlQoFDA0FCgoFCA8FCAgICAgPBQwNBQgPBQwNBQgICAgIDwUIDwUKCjUFBbUFBQUFBQWVCgo1BQWVCgo1BQUFBQUFtQUFlQoICAgICAgICAgICAgPCAgICAgPCAgICAgICAgICAgIDzxCmZlCPAEQD3iEMjKEeAAQ4Hj8/v6EeAAQ4A=="
  },
  "./3-games/15 Puzzle [Roger Ivie] (alt).ch8": {
    name: "15 Puzzle [Roger Ivie] (alt)",
    filename: "./3-games/15 Puzzle [Roger Ivie] (alt).ch8",
    program: "AOBsAEwAbg+iA2Ag8FUA4CK+InYijiJeIkYSEGEAYhdjBEEQAO6i6PEe8GVAABI08CnSNXEBcgVkA4QSNAASImIXcwYSImQDhOJlA4XSlFAA7kQDAO5kAYTkIqYSRmQDhOJlA4XSlFAA7kQAAO5k/4TkIqYSXmQMhOJlDIXSlFAA7kQAAO5k/ITkIqYSdmQMhOJlDIXSlFAA7kQMAO5kBITkIqYSjqLo9B7wZaLo/h7wVWAAouj0HvBVjkAA7jwAEtIiHCLYIhyi+P0e8GWNAADufP/NDwDufQFgD40C7Z4S2O2hEuIA7gECAwQFBgcICQoLDA0ODwANAAECBAUGCAkKDA4DBwsP"
  },
  "./3-games/Syzygy [Roy Trevino, 1990].ch8": {
    name: "Syzygy [Roy Trevino, 1990]",
    filename: "./3-games/Syzygy [Roy Trevino, 1990].ch8",
    program: "EhKNjSCpMTk5MCBSVFQgjo4AJLYk2mAP4KESJGAO4KESKBIWJNoSLADgEizBH3EQwg9yCMMDhTCGEIcgiDBIAHcBSAF3/0gCdgFIA3b/pUzRIdZxZPBp8agA9B6AMPBVdAGoAPQeYAHwVSUiagB6APAHMAASnD0AEpRgAPAp28U/ARKM28UlIvAVEpz+FW0BbgASnIDg8CnbxSUiYAPgoWMAYAbgoWMBYAfgoWMCYAjgoWMDQwBy/0MBcgFDAnH/QwNxAaVM0SE/ARMkPQETiGA/gQJgH4ICgLCAFz8BE4iAsHADgBU/AROIgMCAJz8BE4iAwHAEgCU/AROIYATwGM4HfgKK5KVM0SFgAPAp28WA4PAp28VgMPAV8AcwABMapUzRIZNQEz50AagA9B6AMPBVdAGoAPQeYADwVYUwqAD0HvBlcAHwVUoAE1hgDHD/MAATTnr/EnClTNZxSAB3/0gBdwFIAnb/SAN2AagA+R7wZXD/8FUwABJweQGoAPke8GWIAHkBEnBgDfAYYAvgnhOOawFsAG0AewE7ChOqawB8ATwKE6psAH0BpUzWcUgAd/9IAXcBSAJ2/0gDdgGoAPke8GVw//BVMAATmJlAE955AagA+R7wZYgAeQETmADgZhFnCWgvaRelUtZ+2H53/6VO1nHWkXYI1nHWkXYI1nHWkXYIpVDWcdaRpZ5mE2cRJJqlrvNlk9AUJIAwgNU/ARQ6FESSwBQygCCAxT8BFDoURIAQgLU/ABREpa6D0ILAgbDzVaWu82VmE3f5jTCMIIsQpaQkmsE/wh9gDYAVPwAUfGAwgBc/ABR8YAOAJT8AFHxgGIAnPwAUfBSCww/zKdElYA/goRSQYA7goRSWFFYA4CS2EiwA4BIs1nWlqnYC1nT9KXYK1nX8KXYF1nX7KXYF1nUA7qVOYQBiAGYf0SHRYXEIMUAUvqVSYgFlP9Ev1S9yD9Ev1S8A7mEMYgelYtEqpWxxBtEqpXZxBtEqpWxxBtEqpYBxBtEqpWxxBtEqYQ5iGKWK0SOljnEIcv/RJHEJcv6lktEmcQZyAaWY0SUA7m3Fyz+OsI7UTwEVJHsBbebMH47AjtRPARUyfAFtAM4/fkD+Fc4/fkAA7oAA/wD+AICAgICAgICAgICAgICAgIAfEBAQHwEBAQEfERERER8EBAQEBB8BAgIEBAgIEB8fERAQEBMREREfBQUCAHFRUXUMEh4UEgkUPhUVKgB3RCQUdwBXUnJSVwAAAQABAAAAAA=="
  },
  "./3-games/Biorhythm [Jef Winsor].ch8": {
    name: "Biorhythm [Jef Winsor]",
    filename: "./3-games/Biorhythm [Jef Winsor].ch8",
    program: "pYRhAGIZ0SWliGIN0SWkQWIB0SWlE2ExYg7RJKREYglh/3EH0SIxIhIiMgkSMmIVEiBjAGUAZgAlACUYYABEABJIcAp0/xI+pgjwVSUAJRimCPBlgESmAPMe8FVzATMIEjimAPdlQAASskEAErJEABKyRQASsmgMiAVPABKyaAyIRU8AErKIYIglTwASslYgEriIcIg1TwASslcwEriIQIgFTwASslQAEriIUIgVPwASuPUYAOASAIgAiRCKgCU8SwAS0jspErKJIIowJVQ7AxKyiVCKQCU8SwAS6jspErKJYIpwJVQ7AxKybABtAG4AJPKAUDmqEv6AFSS2EyoktiTcgBUTCCTcJLZ4ATgNExxoAXMBM2QTHGMAcgEk8kmqEypgA4Di8BgTBiRqaAvooRNAaA/ooRNAaADooRKyEywkakgLE04TpAEABxQb1CRIpgD3ZXX/NQATfHT/NAATcGQMd/83/xNwZ2N2/0b/E5KIQIFQgmCDcCTchQB8/0z/bBZ9/03/bRt+/07/biCmAPdVJEhoC+ihE0JoD+ihE0ITKn8AJEimAPdliECCYINwJNyQUGUAdQFFAXQBNA0T0GQBdwE3ZBPQZwB2AUZkE5J8AX0BfgEkwhOOAQcODhYWFg4OBwEABQsLEhISEgsLBQDuAQcODhYWFhYWFg4OBwEABQsLEhISEhISCwsFAO4AAAAAgAAAAACAgAAAAACAgIAAAAAAgICAgAAAAAAfHB8eHx4fHx4fHh8pLjc8KzA1OuCg4ICA1NRlAGYCYwSmAPMe8GWmCfAz8mWEECUYhCAlGHMBMwgUTgDuZCBlBmYAh8Cj2iScNAAUcmQgZQZmDIfQo/IknDQAFIJkIGUGZhiH4KViJJw0ABSSAO73HvBlMO4UqGcAAO6kD/Ae1Wh0/3UBdwEA7owEjQSOBCTCJMIA7msXjLVPAHwXaxyNtU8AfRxrIY61TwB+IQDupCz4HvBlOAIA7okgijAlVEsDcAEA7mmqkmBTcGkAWEBpAADuZADkoRUOdAE0ChUCFQD0CgDuAQwSkGDUpDj1HvFlo0n2HvBl9CnRBUUDdgFFB3YBdQFFCGUAAO5Ban5RawCkLPoe8GWAlU8BAO5rKUkdOgJrOQDuSgCKkGsDirI6AGsAAO4BBwcODhYWFhYWFg4OBwcBAAUFCwsSEhISEhISCwsFBQDu4EBAQOCA4IDg1A=="
  },
  "./3-games/Kaleidoscope [Joseph Weisbecker, 1978].ch8": {
    name: "Kaleidoscope [Joseph Weisbecker, 1978]",
    filename: "./3-games/Kaleidoscope [Joseph Weisbecker, 1978].ch8",
    program: "YABjgGEfYg8iMqIA8x7wCvBVQAASHHMBMwASCGOAogDzHvBlQAASHHMBQwASHCIyEh5AAnL/QARx/0AGcQFACHIBondq4IoSax+BsjoAcgFq8Ioiaw+CsjoAcQFrH4Gy0SGKEGsfiyXasWo/ihXasYsg2rEA7gGAAAA="
  },
  "./3-games/Vertical Brix [Paul Robson, 1996].ch8": {
    name: "Vertical Brix [Paul Robson, 1996]",
    filename: "./3-games/Vertical Brix [Paul Robson, 1996].ch8",
    program: "AOAjtmAH4J4SBGgAZwMjRiJKIsAjZiOKI6zwCiJaIloi0CKIOgASHGwBI6x3/yOsYHjwFfAHMAASNDcAEhwjrGAH4J4SQhIKAP1pEGAColTQlQDugICAgIAAYAHgoRJoYATgoRJyAO6AkHD/QAAA7hJ8gJBwAUAbAO4SfGEColTRldEFiQAA7oCgcP4wAADugLCAlU8AAO6BAGIFgSU/AADuorrwHvBljQBLAW0BSx5t/2wBYArwGADu//8AAQEAyyB7AWoEbAFtAaNk2rEA7oCggbCKxIvUo2RLAW0BSx5t/0o+bP9KAGwB0BHasU8AAO6AoGEhgBVPAADugKCBsHDecf9i/2P/ZANyAYBFPwATCnMBgUU/ABMSgCCBMIAkgCSBNIE0cCJxAaOG0BN+/2AAjAdgAvAYI4p4ASOKPgAA7iNmAO4A4GAAYQBiH6Nk0BHQIXABMD8TUNARcQExIBNaAO6AAGEBYwqjhmAiYgfQE3ADcv8yABNwcQNz/zMAE2xuRgDu4KDgAKOm+DPyZWMDZALwKdNFcwXxKdNFcwXyKdNFAO4AAAAAAABgFGEC9ynQFQDuYAphDGIJYwWjztAV8x5wBXL/MgATwADukJCQkGDgkOCQ4OCQ4JCQICAgICCQkGCQkAAAYAAA8JDwgIDwgPAQ8OCQ4JCQ"
  },
  "./3-games/Submarine [Carmelo Cortez, 1978].ch8": {
    name: "Submarine [Carmelo Cortez, 1978]",
    filename: "./3-games/Submarine [Carmelo Cortez, 1978].ch8",
    program: "os1pOGoe2aKi0GsAbBrbwqLUZDxmBtRjZwBoGSKiIqxIABLYZQmi12MAbQXtoWMBjkDtod5REjztoSLYotTUYxJCdP/UY6LQ28LNBIvU28I/ABKSos3Zos0HTQB5A3n92aI/ABKMQwASKqLX3lFFHxKGdQLzGN5RPwESPG0fjVJNHxKMEpIirHj/Eh4ioncFEpYioncKIqJtA/0YotfeURKGovj3M2MAIrYA7qL4+DNjMiK2AO5tAPJl8CnT1XMF8SnT1XMF8inT1QDuAQh/fAg+YAgYPP8IowBjEW0L09WjBWMZ09WjCmMj09WjD2Mr09VjABL0bQsAAQQAAO4AAe6Kiqru76Wlpe96KjspebqisiA6NDo81lQcDECeJWgM"
  },
  "./3-games/Russian Roulette [Carmelo Cortez, 1978].ch8": {
    name: "Russian Roulette [Carmelo Cortez, 1978]",
    filename: "./3-games/Russian Roulette [Carmelo Cortez, 1978].ch8",
    program: "ZQoiiPIKwwVDBBIyolphENE1ol9hGNE1omRhINE1ZDD0FfQHNAASIgDgdf9FABJGEgKiaWEQ0TWibmEY0TWic2Eg0TUSRKJ4YRDRNaJ9YRjRNaKCYSDRNRJY6IiIiO7uSEhI7qrKysCq91V3VfVlZVVNTdUVFUDVi4mJqduyMiomoqqqqgCqIKKSZhhnENZ3AO4IKn9ja2N/f2N/"
  },
  "./3-games/Brix [Andreas Gustafsson, 1990].ch8": {
    name: "Brix [Andreas Gustafsson, 1990]",
    filename: "./3-games/Brix [Andreas Gustafsson, 1990].ch8",
    program: "bgVlAGsGagCjDNqxegQ6QBIIewI7EhIGbCBtH6MQ3NEi9mAAYQCjEtARcAijDtARYEDwFfAHMAASNMYPZx5oAWn/ow7WcaMQ3NFgBOChfP5gBuChfAJgP4wC3NGjDtZxhoSHlGA/hgJhH4cSRx8SrEYAaAFGP2j/RwBpAdZxPwESqkcfEqpgBYB1PwASqmAB8BiAYGH8gBKjDNBxYP6JAyL2dQEi9kVgEt4SRmn/gGCAxT8BEsphAoAVPwES4IAVPwES7oAVPwES6GAg8BijDn7/gOCABGEA0BE+ABIwEt54/0j+aP8S7ngBSAJoAWAE8Bhp/xJwoxT1M/Jl8SljN2QA00VzBfIp00UA7uAAgAD8AKoAAAAAAA=="
  },
  "./3-games/Filter.ch8": {
    name: "Filter",
    filename: "./3-games/Filter.ch8",
    program: "AOBuAG0Hax1sHCKOIp4ieCJuYAHwFfAHMAASFiKASR8iNGAE4KEiXnAC4KEiZkYBIkgSEiKKYALwGCKeff8ink0AElwibgDuYAXwGCKefgEink5jElwiiiJuAO4SXCJ4e/0ieADuInh7AyJ4AO5pB8g9eALYkQDuorzbwaK9AO4iinkBIoqG8ADu2JEA7mMGZACivtQxdAhEQADuEpSiwGM3ZAD+M/Jl8SnTRXMF8inTRWMA/SnTRaK9AO78gP91AAAAAAAA"
  },
  "./3-games/Breakout (Brix hack) [David Winter, 1997].ch8": {
    name: "Breakout (Brix hack) [David Winter, 1997]",
    filename: "./3-games/Breakout (Brix hack) [David Winter, 1997].ch8",
    program: "bgVlAGsGagCjDNqxegQ6QBIIewI7EhIGbCBtH6MQ3NEi9mAAYQCjEtARcAijDtARYEDwFfAHMAASNMYPZx5oAWn/ow7WcaMQ3NFgBOChfP5gBuChfAJgP4wC3NGjDtZxhoSHlGA/hgJhH4cSRx8SrEYAaAFGP2j/RwBpAdZxPwESqkcfEqpgBYB1PwASqmAB8BiAYGH8gBKjDNBxYP6JAyL2dQEi9kVgEt4SRmn/gGCAxT8BEsphAoAVPwES4IAVPwES7oAVPwES6GAg8BijDn7/gOCABGEA0BE+ABIwEt54/0j+aP8S7ngBSAJoAWAE8Bhp/xJwoxT1M/Jl8SljN2QA00VzBfIp00UA7vAAgAD8AKoAAAAAAA=="
  },
  "./3-games/Airplane.ch8": {
    name: "Airplane",
    filename: "./3-games/Airplane.ch8",
    program: "agBrBGwBbQBuAiMmIyBgMGEB8BXwB/EYMAASFCJCIyB9ASMgYAjgoSMKSgASPqNi2JF5AdiRTwES9EkYEuQishIeTAEibEwCInpMAyKITAQilkwFIqSjWdZyRAAA7qNX1FJCAADuo1vSMgDuZihnCWQAZQBiAGMAAO5mKGcOZChlFGIAYwAA7mYoZwdkKGUMYhZjEQDuZihnB2QoZQ5iFmMUAO5mKGcFZChlEGIWYwsA7qNZ1nJ2/tZyRAAA7qNX1FJ0AkREdMDUUkIAAO6jW9IycgJMBHICTAVyAkJEcsDSMgDufAFtAG4CAOBMBmwBagASCmAG8Bh7/0sAEwhtAG4CAOBqABIKEwhKAQDuYALwGGoBiNB4AYngeQHYkQDuo1Td4gDuZBljAKNW00FzCDNAEyxjHmQb/CnTRUsEo19LA6NgSwKjYUsBo2JjAXQC00EA7oD4/4DgEHCI7hF3qqiggAA="
  },
  "./3-games/Merlin [David Winter].ch8": {
    name: "Merlin [David Winter]",
    filename: "./3-games/Merlin [David Winter].ch8",
    program: "EhkgTUVSTElOIEJ5IERhdmlkIFdJTlRFUiL5ox1gEGEAIsujMWALYRsiy2QEIt9lAGIoIsHCA4Ago1n1HvBVYBdhCGMBgyIzAHAKYwKDIjMAcQqjF9AWYhQiwdAWYgUiwXUBVFASNWUAYBdhCKMX8wozBBJ5YwASlzMFEoNwCmMBEpczBxKNcQpjAhKXMwgSaXAKcQpjA9AWYhQiwdAWo1n1HvBldQFQMBK1VUASaSLfdAESLSL5o0VgEGEOIssSv/IV8gcyABLDAO6DAGIF0BXyHnAIhTB1IFBQEs8A7qNZg0Bz/fMz8mXxKWArYxvQNXAF8inQNQDuow9gF2EH0BhwCtAYcQrQGHD20BgA7v+BgYGBgYH/fn5+fn5+26qLy8vvCI8N7KCgsDC+X1FR2dmDgoOC++gIiAXivqC4ID6AgICA+PeFt5X1dlRWVFY6KioqObaltqU1"
  },
  "./3-games/Addition Problems [Paul C. Moews].ch8": {
    name: "Addition Problems [Paul C. Moews]",
    filename: "./3-games/Addition Problems [Paul C. Moews].ch8",
    program: "AODNf85/jNCM5KKiagBrAP0z8mUidqKIegfataKiegj+M/JlInaijnoH2rSikmoYawjav/AK8QryCtq/ahUidqKl8lWiovwz9WWDBTMAEmKEFTQAEmKFJTUAEmJmDPYYEmpqFWsQInZmDmomawj2Kdq18AoSAPAp2rV6BfEp2rV6BfIp2rUA7iAg+CAgAAD/AP///wMDA///wMDAwMAAwMAAAAAAAAAA"
  },
  "./3-games/15 Puzzle [Roger Ivie].ch8": {
    name: "15 Puzzle [Roger Ivie]",
    filename: "./3-games/15 Puzzle [Roger Ivie].ch8",
    program: "AOBsAEwAbg+iA2Ag8FUA4CK+InYijiJeIkYSEGEAYhdjBEEQAO6i6PEe8GVAABI08CnSNXEBcgVkA4QSNAASImIXcwYSImQDhOJlA4XSlFAA7kQDAO5kAYTkIqYSRmQDhOJlA4XSlFAA7kQAAO5k/4TkIqYSXmQMhOJlDIXSlFAA7kQAAO5k/ITkIqYSdmQMhOJlDIXSlFAA7kQMAO5kBITkIqYSjqLo9B7wZaLo/h7wVWAAouj0HvBVjkAA7jwAEtIiHCLYIhyi+P0e8GWNAADufP/NDwDufQFgD40C7Z4S2O2hEuIA7gECAwQFBgcICQoLDA0ODwANAAECBAUGCAkKDA4DBwsPhOQiphJ2ZAyE4mUMhdKUUADuRAwA7mQEhOQiphKOouj0HvBlouj+HvBVYACi6PQe8FWOQADuPAAS0iIcItgiHKL4/R7wZY0AAO58/80PAO59AWAPjQLtnhLY7aES4gDuAQIDBAUGBwgJCgsMDQ4PAA0AAQIEBQYI"
  },
  "./3-games/Wipe Off [Joseph Weisbecker].ch8": {
    name: "Wipe Off [Joseph Weisbecker]",
    filename: "./3-games/Wipe Off [Joseph Weisbecker].ch8",
    program: "osxqB2EAawhgANARcAh7/zsAEgpxBHr/OgASBmYAZxCizWAgYR7QEWMdYj+CAnf/RwASqv8KosvSMWX/xAE0AWT/os1sAG4E7qFs/24G7qFsAdARgMTQEU8BEphCAGQBQj9k/0MAZQFDHxKkosvSMYJEg1TSMT8BEkJDHhKYagL6GHYBRnASqtIxxAE0AWT/xQE1AWX/EkJqA/oYosvSMXP/Ejaiy9IxEiiizdARovD2M/JlYxhkG/Ap00VzBfEp00VzBfIp00USyAGARP8="
  },
  "./3-games/Landing.ch8": {
    name: "Landing",
    filename: "./3-games/Landing.ch8",
    program: "AOCjCmAAYR/QEXAIQEASEhIIowBkCXQBRDYSUMULhlB2D0YY1GFGF9RiRhbUY0YV1GRGFNRlRhPUZkYS1GdGEdRoRhDUaUYP1GpmGdRmEhZqAGsAaQKi/tqxYBTwGGAU8BXwBzAAEmJgAfAY2rF6AUo+IpDasU8BEp5gCOChIr5IASLWYALwFfAHMAASiBJoef85ABL6agB7AWkCAO5gCvAYow71M/JlYxlkAPAp00VzBfEp00VzBfIp00USvEgBAO5oAWAD8BiNoI6wfQF+AaMM3eEA7qMM3eF+Ad3hTwES6mAB8Bii/gDudQFgBfAYaABOH93hov4A7moAAO7gAICAgICAgICAgID/AIAAAAAAAAAA"
  },
  "./3-games/Sum Fun [Joyce Weisbecker].ch8": {
    name: "Sum Fun [Joyce Weisbecker]",
    filename: "./3-games/Sum Fun [Joyce Weisbecker].ch8",
    program: "AOBqACJiY4AiimUUwAPBA8IDZACEBIQUhCQiWhKkY5AiguShEiw2AHb/Eh4ilGMQIoIimmOAIooA4IpkImJ1/0UAEkpjYCKKEgxkEvQYYxoiinT+NAASTBJYaBBpEyJwAO5oMGkAorD6M/JlInAA7vAp2JV4BvEp2JV4BvIp2JUA7nP/MwASggDu8xXzBzMAEowA7mMC8xgA7mgWaQr0KdiVAO5mCmOAIoLkoRIsEh4="
  },
  "./3-games/Guess [David Winter].ch8": {
    name: "Guess [David Winter]",
    filename: "./3-games/Guess [David Winter].ch8",
    program: "aQBuAQDgbQFqAWsBjNCM4kwAEiKI0CJAOkASImoBewY8P30BPT8SDPAKQAWJ5I7kPkASBGocaw2IkADgIkASPqKW+DPyZSJW2rV6BIEgIlbatXoFAO6DEIM0gzSDFKJk8x4A7uCgoKDgQEBAQEDgIOCA4OAg4CDgoKDgICDggOAg4OCA4KDg4CAgICDgoOCg4OCg4CDg"
  },
  "./3-games/Breakout [Carmelo Cortez, 1979].ch8": {
    name: "Breakout [Carmelo Cortez, 1979]",
    filename: "./3-games/Breakout [Carmelo Cortez, 1979].ch8",
    program: "osxqBmEDawhgANARcAh7/zsAEgpxAnr/OgASBmYAZxSizWAgYR7QEWMdYj+CAnf/RwASqv8KosvSMWX/xAE0AWT/os1sAG4E7qFs/m4G7qFsAtARgMTQEU8BEphCAGQBQj9k/0MAEs5DHxKkosvSMYJEg1TSMT8BEkJDHhKYagL6GHYBosoSiNIxxAE0AWT/xQE1AWUBEkJqA/oYosvSMXP/Ejaiy9IxEiiizdARovD2M/JlYxhkG/Ap00VzBfEp00VzBfIp00USyPCA//+i3mMVYhDTJaLjYx3TJRKq7orOjIruiMyI7g=="
  },
  "./3-games/Worm V4 [RB-Revival Studios, 2007].ch8": {
    name: "Worm V4 [RB-Revival Studios, 2007]",
    filename: "./3-games/Worm V4 [RB-Revival Studios, 2007].ch8",
    program: "ElxXb3JtIHYuNCwgYnk6IFJCLCBDaGlwLTggdmVyc2lvbiBieTogTWFydGlqbiBXZW50aW5nIC8gUmV2aXZhbCBTdHVkaW9zAFJCOTIAAAAfAAATfAAABg4BAAQA4KJN/mWjpfBV/B5xATEAEmSjj9qzo47UIdQxdAI0OhJ0o5xjANMh1CFyATIfEoKiSPBlogLwM6IC9TMjIiN0o5vXYXYCNiESnGMG8xWjpfge8GWEAICgo6X4HvBVpKX4HvBlgQCAsKSl+B7wVaOSNADUE6OG+R7xZaOV2rKKBIsUo4/asz8AEzzAD0AAI3B4AZjgaABjBvMVZv9hBuGhZgBhAuGhZgJhBOGhZgRhCOGhZgY2/4lg8wczABL2EqYjIqIC9TNjAGQ8ogLyZfAp1DVzBvEp1DVzBvIp1DUA7iOAo4/as9qzPwATUmQC9Bh1ASMcEuxkCvQY2rOKBYsVo5XasqJI8GWiSIBVgFBPAPBVE25+AQDuo5fMP80f3NRPAADuo5fc1BN2BAAA/PwAAATA4ODg4KDgAEAwWHgw8ICAgICAgICAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  },
  "./3-games/Vers [JMN, 1991].ch8": {
    name: "Vers [JMN, 1991]",
    filename: "./3-games/Vers [JMN, 1991].ch8",
    program: "EhpKTU4gMTk5MSBTT0ZUV0FSRVMggID/AABjAGcAAOCiF2AAYQDQEXH/0BFxAXAIMEASJnEBohXQEnD/0BJwAXECMR8SOGAIYRBiBGQ3ZQ9mAtAR1FFoAeihYgJoAuihYgRoB+ihYgFoCuihYgNoC+ihZgJoD+ihZgRoDOihZgFoDeihZgNCAXH/QgJw/0IDcQFCBHABRgF1/0YCdP9GA3UBRgR0AdARPwAStNRRPwASuBJWdwESunMBaAB4ATgAErwA4GAIYQTzKdAVYDT3KdAVaAB4ATgAEtRDCBLkRwgS5BIeEuQ="
  },
  "./3-games/Timebomb.ch8": {
    name: "Timebomb",
    filename: "./3-games/Timebomb.ch8",
    program: "AOBqBSI6YALgoRIaYAjgoRIqYAXgoRJWEgZK8BIGIjp6ASI6YALwGBIGSgUSBiI6ev8iOmAC8BgSBqKK+jPyZWMZZA7wKdNFcwXxKdNFcwXyKdNFAO5gPPAV8AcwABJaIjp6/yI6YAXwGEoAEnRgPPAVEloA4GAy8BhgFPAV8AcwABJ+agUiOhIGAAAAAAAA"
  },
  "./3-games/Tron.ch8": {
    name: "Tron",
    filename: "./3-games/Tron.ch8",
    program: "AOCjTGMSZAvTSXMIo1XTSXMIo17TSXMIo2fTSWMAZABgD+ChEi5gC+ChEjQSIGUBAOASYGUCAOBgAGEAYh+jTNAR0CFwCEBAEkwSQGABYQBiP6Nw0QrSCnAKQB8SYBJUo3BsIGsPah9tD2b/ZwBoAWkA2rHc0WAA4J4SeGAK8BhgAeChIvxwA+ChIwZwA+ChIxBwA+ChIxpgA+ChIyRwCeChIy5w/eChIzhwBeChI0KKZIyEi3SNlNqxTwES0NzRTwES2mAC8BXwBzAAEsgSgADgdAFECmQAEuIA4HMBQwpjAGAK8BjzKWAZYQ3QFaN6cAbQFPQpcAXQFRIgRwEA7mYAZ/8A7kf/AO5mAGcBAO5JAQDuaABp/wDuSf8A7mgAaQEA7kYBAO5m/2cAAO5G/wDuZgFnAADuSAEA7mj/aQAA7kj/AO5oAWkAAO7/gL6IiIiIgP//APuK+pKLAP//AOgsKinoAP/gIKCgoKCgIOCAgICAgICAgICAAEAAQA=="
  },
  "./3-games/Mastermind FourRow (Robert Lindley, 1978).ch8": {
    name: "Mastermind FourRow (Robert Lindley, 1978)",
    filename: "./3-games/Mastermind FourRow (Robert Lindley, 1978).ch8",
    program: "ovxtAG4A3eN+Bj4YEgZ9Bj08EgSj9CMAIwAjACMAbQBuAGwAo/TzZfNVawDwCjAPEkpLABIsfvqj/Hv/+x7wZfAp3eWi/N3jEjJq+YoEPwASLEAAEiyi/N3jo/z7HvBV8Cnd5X4GewE7BBIsZABoAGsAo/z7HvBlggCj+Pse8GWDACMOo/z7HoAg8FWj+PsegDDwVXsBOwQScjgEEsJuAG08aQCj9Pke8GXwKd3lfgZ5ATkEEqRgIPAV8AcwABK6Ep5kAWoAawCj/Poe8GWCAKP4+x7wZYMAIw6j+PsegDDwVXsBOwQS0HoBOgQSxn0GbgB8ATwKEiQSnpDwAABgAMAHQAATAEAHEwDwVQDuUjAA7qL6NACi+93hfgJ4AWIOYw8A7g=="
  },
  "./3-games/Nim [Carmelo Cortez, 1978].ch8": {
    name: "Nim [Carmelo Cortez, 1978]",
    filename: "./3-games/Nim [Carmelo Cortez, 1978].ch8",
    program: "biNtAiJi/ApMDxIYagGOpSJijaVOABKCaAHooRImeAE4BBIaEhiF4IWFPwESGI6FImJOABKSaXD5FfkHOQASOpjQElCHgIbQh2VPABJQfQSNhT0AElptBBIMjtUiYm0EEhj6GADgo1D+M2MQawDyZfAp07VzBfEp07VzBfIp07UA7qKiYABhFdAVoqdgCNAVEpCirGAAYRDQFaKxYAjQFRKgi4mJqduyMiompo6Kioru7ojsKO4="
  },
  "./3-games/Slide [Joyce Weisbecker].ch8": {
    name: "Slide [Joyce Weisbecker]",
    filename: "./3-games/Slide [Joyce Weisbecker].ch8",
    program: "AOCjYGgAaQBiASMOYv8jDmoAawBkBmwAIyhsASMoo1ltKG4S3eNtMG4O3eNuFt3jbThuCt3jbhrd42wAbQMiWGwBbTsiWHT/NAASOmIP8hhhGPEVE2YSVmIEI0yjV24D3eJlA2YAbnCjXGgFaQnYlG0BYRHCGHIII0zYlInU2JRx/+ChEpIxABJ0Tf8ScG3/EnJiAvIYYhAjTD4Afv7goRKWYhAjTOChEpZiBCNMg+CD5IIwI0x+AtiUeAHYlE8BEvg+cBKuYoAjeiMoPAAS1IpkEtaLZCMoo1zYlGIg8hh1/zUAEmSjV24DbQM8AG073eJiBCNMAO5iAvIYSDwS2EgldgJILXYESDV2CBN0YT/YkXH/iCQxABMQYR/YkXH/iSQxABMcAO6jYW4CbQj6M0wAEzhtKPsz8mXwKd3lfQbxKd3lfQbyKd3lAO5yAnL/MgATTgDuAcDA4KDg8PDw8IAAAAQA1PEHMQATZnL/MgASThNyPnASrhLG8hXyBzIAE3wA7g=="
  },
  "./3-games/Connect 4 [David Winter].ch8": {
    name: "Connect 4 [David Winter]",
    filename: "./3-games/Connect 4 [David Winter].ch8",
    program: "EhpDT05ORUNUNCBieSBEYXZpZCBXSU5URVKiu/ZlorT2VWkAaAFrAG0Pbh+ipWANYTJiANAv0S9yDzIeEjTQIdEhcgFgCqKf0CHRIaKf3eH8Ct3hTAUSfjwEEmp7/337PQoSemsGbS0SejwGEph7AX0FPTISemsAbQ/d4RJQorT7HvBlQPwSmIoAcPvwVYmDop45AKKh3aSin93hElBg8PBgkJBggICAgICAgICAgICAgICAGhoaGhoaGhoaGhoaGho="
  },
  "./3-games/Missile [David Winter].ch8": {
    name: "Missile [David Winter]",
    filename: "./3-games/Missile [David Winter].ch8",
    program: "EhlNSVNTSUxFIGJ5IERhdmlkIFdJTlRFUmwMYABhAGUIZgpnAG4Boq3QFHAIMEASKWAAYRyisNAUorDQFD4BEklwBEA4bgAST3D8QABuAdAU/BX7BzsAElNiCOKeEpU8AHz+YxuCAKKw0jFkANIxc//SMT8AZAEzAxJt0jE0ARKRdwV1/4IAYwCirdI0RQASl3b/NgASOaK09zPyZWMbZA3xKdNFcwXyKdNFEqsQODgQOHz+"
  },
  "./3-games/Deflection [John Fort].ch8": {
    name: "Deflection [John Fort]",
    filename: "./3-games/Deflection [John Fort].ch8",
    program: "agBrAGgKbAFtAW4KZ1BpACQAZJAkPgDgwDfBF6VM8VWlMNAXEijQEcA/wR+lTvFVpUjQET8AEialTPFlcAFxAYTAPgqE0PQp0BUSTtAVwDjBGP4p0BU/ABJMZKAkPtAV8gpCABLISTISYKU3QgESgqU8QgISgqVAQgMSgqVEMgQSYGAeYQ7QFWQFJD7QFWMJ46ESnHP/MwASkBKGQwUSwCRIQP9gAEH/YQBkPEICZECQQHD/ZBxCAWQgkUBx/xKG8wokenkFEmBnAPMKQwASykMFEspkCYQ1PwESyqVO8WWlSNARJEhA/xNYQf8TWEBAE1hBIBNY0BFPARMCZAUkPhLi0BEkpEIAExAkwNAREuJHABNYpUzxZaUwYwVkFdAX9BjQFyQ+c/8zABMcPgoTPoDAJPSKFE8BE158ARNKgNAk9IsUTwETYn0BeP9IABNkPgoSCm4LEgxkMPQYE0pq/xNka/8kAKUwmrATamANYQeLpT8AYC1kQNAXJD7QF2RA9BgTdnasd5XM3KCBEMBVROQsAcyc00vI7m0MQLjcily0ITRjM7MzM2O4c7O7NjE1MjMyf3Mxkzcyk/MyA7ITNJv/8ve/P7uytqx/+7O7v93z/7ERmLV/P76vu7mDrer7zM7MyOzs2szc/M3KzIzI6M7sqM3KzMzEzGzMzI3s2c0A4GUIZhClSfoz8mUkLGUopUn7M/JlJCxlDmYIYArwKdVlZS5gC/Ap1WUA7vAp1WV1BvEp1WV1BvIp1WUA7vQV9Ac0ABRAAO5DA3ABQwZwAUMJcAFDAXD/QwRw/0MHcP9DB3EBQwhxAUMJcQFDAXH/QwJx/0MDcf8A7tAVpQD3HkIBYwZCAmMIQgNjCUIEYwdCBHAEZAXyVSRIdP80ABSWdw8A7oUAhhClUHSQ8mVQUBS2kWAA7nT/NAAUrGIAAO6FAIYQQgGlAEICpQxCA6UYQgSlJGIG8WWTABTqcv8yABTWgFCBYKVIAO6DEGQF9Bh3ARTiYQCBBHf/NwAU9gDuAQcCCAMJBwEIAgkDAQMDAQQGBgQHCQkHAgQDBwQCBggHAwgGAQkCBgQIBgIIBAkB/Pz8/Pz8/PgAAAAAgICAgIBAIBAIECBAgAAAABETFAkYBwMZCAMaCQMbCgMcCwMkBwQjCAQiCQQhCgQgCwQgAAMhAQMiAgMjAwMkBAMTAAQSAQQRAgQQAwQPBAQPDwEQDwERDwESDwETDwEMBAQLBQQKBgQJBwQICAQZBAMaBQMbBgMcBwMdCAMJEAMKEQMLEgMMEwMNFAMsEAMtEQMuEgMvEwMwFAMrFwMsGAMtGQMuGgMvGwPm7c3OOdWpUE0QbG4n6AKzoY210M++3ObRTw=="
  },
  "./3-games/Guess [David Winter] (alt).ch8": {
    name: "Guess [David Winter] (alt)",
    filename: "./3-games/Guess [David Winter] (alt).ch8",
    program: "bgEA4G0BagFrAYzQjOJMABIgiNAiPjpAEiBqAXsGPD99AT0/EgrwCkAFieSO5D5AEgJqHGsNiJAA4CI+EjyilPgz8mUiVNq1egSBICJU2rV6BQDugxCDNIM0gxSiYvMeAO7goKCg4EBAQEBA4CDggODgIOAg4KCg4CAg4IDgIODggOCg4OAgICAg4KDgoODgoOAg4A=="
  },
  "./3-games/Astro Dodge [Revival Studios, 2008].ch8": {
    name: "Astro Dodge [Revival Studios, 2008]",
    filename: "./3-games/Astro Dodge [Revival Studios, 2008].ch8",
    program: "EhRSRVZJVkFMU1RVRElPUzIwMDgA4G0g/RUkWCRgbUD9FSRYJGBtIP0VJFgA4KPYJSAkuG0EbABgBeCeEkASVP0VJFh8AUwAJLhMBCS4TAhsABI4o9glIADgaBBpFCLiIoglSmMsZAAlgmMsZAYljm0AbggisCLofQhNgG0AfghOgG4AEnQSLGwAoz78HvFlwQPxVaNY0Bh8AzwJEooA7iMaJVIjGsAPgASABGEAAO5sAGUAoz78HvJlo1j9HtAYgSSDEGQeg0VPASKgo1j+HtAYoz78HvFVdRh8AzwJErQA7qNQ2JgA7iLiYATgnhL0OAB4/mAG4J4S/jg4eAJgAuCeEwg5EHn/YAjgnhMSORh5ASLiTwETKADuYyxkACWCYyxkBiWOAO4A4GAAYQQk7mMWZBYlgmAF4J4TNhIsAA4BGLQCMOMDQHUBQGACQDYDGBg0JH7/55kAQDgUKnU6FAAAKHA+ByoAAEAIXHp1CgQAUChUPnUuASBweHw8dWpUAGR4eH596FAIRCpQOl3oQAhUChEqXGhAAAQqVyoWKFAAACoTalYIAAAACHEqUjAAAAQKFDpgaAAABAocPnBoUCBQLl8uXChQIFw6Vz5eKFAAWDh3Ln8+VHh+9/G+njhm+M1zm+M2z954Zvcdvps6NvnNc7PjbM/YzTODeDPZZpzN+JvjNodsPP1+93m/n3xm/M37m/c27979Zvcdv5t8NvzN+7P37O/YzQDDADMAZgDNAJsANgAMAIVmABkBm0ZmBc2ImxRsINjNM4N8M9luvs392/N2z2y88AcwABRYAO5tBGEMYBxiEqYv8h7QFv0VJFhgFGIMpi/yHtAWYCRiGKYv8h7QFv0VJFhgDGIGpi/yHtAWYCxiHqYv8h7QFv0VJFimL2AE0BZgNGIkpi/yHtAW/RUkWADuYgZgAGEXpZ/QFnAI8h7QFnAI8h7QFnAI8h7QFnAI8h7QFnAI8h7QFnAI8h7QFnAI8h7QFgDuYgylz9AccAjyHtAccAjyHtAccAjyHtAccAjyHtAccAjyHtAccAjyHtAccAjyHtAcAO5kAWUHYgBjAGAAgTBxA9ARcQj0HtAR9B5wCDBAFSpzA4NScgEyCBUoAO5gAKWa8FUA7qWa8WVwAYIAghVPAYEA8VUA7qWc8mXwKdNFcwXxKdNFcwXyKdNFcwViAPIp00UA7qWa8GWlnPAzJWQA7qWb8GWlnPAzJWQA7gBkAAAAADw2PDAwAPPb89vbAOcMxwHvAJ4wHIY8AB4wHAY8APNmZ2ZmAJ7b3tvbAHgwMDAwAQMDAwMDAwMDAwMB5w0Nb21tbW1tbW3tP7W1tbW1tbW1tbW1PrCwvLCwsLCwsLC+HDY2NjY2NjY2NjYc29vb29vb29vb23s77w0Nzw0NDQ0NDQ3tAICAAICAgICAgICAAAAMEREQAACVVZXNAABTVVUzQEBEQkFGAEBqSkpGACBpqqppAAAgkIgw"
  },
  "./3-games/Cave.ch8": {
    name: "Cave",
    filename: "./3-games/Cave.ch8",
    program: "AOBkAGUAogoSDMwzZh7UUtRidAhEQBIaEg6iHhIs///AwMDAwMDAwMDA//9kDWUJ1F50CqI61F4SSP//w8PDw8P//8PDw8PDdAqiUNReEl7Dw8PDw2ZmZmZmPDwYGHQKombUXhJ0///AwMDA///AwMDA//9qAWsEbA5tAKKBEqaA////////////AOBkAGUA1Fh0CERAIp5FIBKkEpBkAHUIAO4SrmAP4J4SqBKKSgEi0EoCI4pKAyO4SgQj4EoFJBhKBiR4Sgck5koIJRATGKKBZAJlAtRYZQrUWGUS1FhkCmUF1FNkEtRTZBrUU2Qi1FNkKtRTZDLUU6L+Ewr8/Pz8/Pz8/Pz8/Px1A3QC1Fx0BnUJ1FMA7qKA28FPARNyYALgoW0CYATgoW0EYAbgoW0GYAjgoW0I28FNAnz/TQR7/00GewFNCHwBS0ATXkv/E2RgAvAV8AcwABNWExh6AUoJFTprAaKBEop6/2s+ooESimAD8BhgD+CeE3hqAWsEbA5tAKKBAOASimQAZRGigdRTdAjUU3QIdf/UU3QIdf/UU3QI1FN0CNRTdAh1AdRTdAh1AdRTAO5kAGURooHUU3QI1FN0CHUC1FJ0CNRRdAjUUXQI1FF0CNRRdAjUUQDuZABlE6KB1FGigHQI1FF1AdRRdQGigdRRdAjUUXQI1FJ0CHX/1FN0CNRUdAh1/9RWdAh1/9RYAO5kAGUSooHUWHQI1Fh0CNRYdAjUWHQI1Fh0CNRYdAjUWKKAdf90INRRdf/UUXX/1FF1/9RRdf/UUXX/1FF1/9RRdf/UUXX/ooHUUXQI1FF0CNRRdAjUUXQI1FF0CNRRAO5kAGUJooHUUXQI1FF0CNRRdAjUUXQI1FF0CNRRooB1AdRRdQHUUXUB1FF1AdRRdQHUUXUB1FF1AdRRdQHUUXUB1FF1AdRRdQHUUXUB1FF1AdRRdQHUUXUB1FF1AdRRdQGigdRRdAjUUXQI1FEA7mQAZRqigdRRdAjUUXQI1FF0CNRRdAjUUXX/1FF0CNRRdAjUUXQI1FEA7mQAZRmigdRRdAjUUXQI1FF0CNRRdAjUUXX/1FF0CNRRdAjUUXQI1FEA7gDgZwNoA6VEFVyuqupKTgCkpKSl4gBdVVVVnQDISEhASADXhaVKdwjXhXcIpVDXhXcIpVbXhRVw"
  },
  "./3-games/Bowling [Gooitzen van der Wal].ch8": {
    name: "Bowling [Gooitzen van der Wal]",
    filename: "./3-games/Bowling [Gooitzen van der Wal].ch8",
    program: "YxRkACVeYAUltGMMJbxpBom1OwBPABIM+ynWRY2wfQljFGQMJXpgBSW0YwwlvGkJibVPABIs+ynTRTsAEkZrCmMHYAEltICwpqbwVW4AYxRkGGAFJbSmSiW2YA4ltCW0YA0ltGMMJbxpA4m1OwBPABJm+ynTRWAASwJgBEsBYAikqfBVJd6mlGAAYQDwVXEBMRISjGwKfgEmCGoAI3ZjAGQQJV4lxoDAJbRjAmQbJXolxoDgJZZjMGQApnzTSXMI00mmlvwe8GVkATABEupjOaZv00emp/BlYzJkAiW0EvRjOmQC+ynTRRLUQAAS4GMxpnXTRyXenNAS/nwBEpgA4GMAZAAleiXGgOAwDhMSJbQTFCWWbApjAHQJgMAltCXGpor8HvBlhQCmkPwe8GUlmCX0nNATRHwBaSSJNT8BExZjJRMaYzdkAE4OE0qmpvBlngATWiWW+QoSlPkKbg5sCiYIQAATbmoAQAFqASN2nNAS/nwBE2Al3gDgpoRiAGEA0SFxCDFAE4ByH0IfE36mhWEAYgHRL2IQ0S+mR2EnYg7RJGEtYgolkNEkYTNiBiWQJZDRJGE5YgIlkCWQJZDRJGsApkJhAWIOYxpkAdElaCJpAmUB5aEUEGUC5aEUFGUD5aEUGGUF5aEUHGUH5aEUImUI5aEUIGUJ5aEUHtElkjAUBoJEE8w0ARPIYwFk/xPMefwUInn8FCB5/BQeef54CXgJJe4kjqaQ/B7wZYgAppb8HvBliQA6ABRmSQMUWDkAFFwmJksKFIQmFKangLDwVXoBOwoTwBOaJiZ5/yYmef8+DhRCFEhJARR6Jiamp/BlgLRAChSGJd4UiCYmef8+DhRqFHZ5AXkBJhQA4ADuYwBvAD8AFK7RJVGAFJ6DkHEDgjRBPQDu0SVgACXgFJLRJWYnZwJkKoQVPwAU+GQwhBU/ABTOZDaEFT8AFPZ2DHYGQgAVFGQFhCU/ABUiZA2EJT8AFR5kFYQlPwAVGmQahCU/ABUWFRR2DEIAFRRkCYQlPwAVIGQRhCU/ABUcZBmEJT8AFRgV7ncEdwR3BHcEdwR3BKZH1nQ/ABUw1nSmQhSYewEl6sAHgAS1OhVQFU4VShVIFVAVThVKdxB3+BVUdwh3/HYGZBuEdT8AFSIVLKZKJbamTdNFcwRgCiW0plLTRXMEYA4ltKZaFbZgDyW0ploltmAKJbSmX9NFcwZgDhW00SRyCADuZQCmqPAz8mWAUDAAFaoxABWsFbAltIAQJbSAIBW08CnTRXMFAO6mZNNH+wrTRwDupmvTRHMCAO6mVtNCcwMA7qZYFdBgQBXgYKDwFfAHMAAV4gDuYAEV8GAI8BgA7qaW/B7wZUAAAO5AARXOQAMl1hXWAOD8KWMeZA0lthX0ppD8HoCA8FWmlvwegJDwVQDuiLRgY4CFPwAA7qaK/B7wZXABpor8HvBVeJwA7vj4+Pj48JCQ8JDwgICAgOCgoOBAQIDAwPCQ8KCQ2KiIiIjwkBBwQABwAIAAgAAEDBw8fPz8/Pz8/Pz/gYGBgYGBgf+AgICAgICAgICAgICAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  },
  "./3-games/Paddles.ch8": {
    name: "Paddles",
    filename: "./3-games/Paddles.ch8",
    program: "AOBoAGkAaiBrIGwJbQNuAyOGI7IjoCPiZwBgD+ChZwFgDuChZwJHABIaAOAjhiOyI6Aj4iOsI6wjoE4BI0BOAiNGTgMjTE4EI1IjWEcBIppHAiLAI6AjrE8BEvpNABJmTR8SgBI2I6wj4nkBI+JgD/AYSQkUHGwJbQJuAiOsEjYjrCPieAEj4mAP8BhICRQcbAltHG4BI6wSNmAE4KEisGAG4KEiuMMDQwAA7orAAO5LCADue/4A7ks4AO57AgDuYATgoSLaYAbgoSLiYAfgoSLqYAngoSLyAO5KCADuev4A7ko4AO56AgDuSwgA7nv+AO5LOADuewIA7mAF8BhNARMsTR4TNk0QEwpOARMcTgITIE4DEyROBBMoEjZuAhI2bgESNm4EEjZuAxI2wAFuAkABbgMSNsABbgFAAW4EEjZ8AX3/AO58AX0BAO58/30BAO58/33/AO5MPxNiTAgTdADuTgETbE4CE3AA7m4EAO5uAwDuTgMTfk4EE4IA7m4CAO5uAQDuYwBkD6Qu00KkHmQAYwfTSHQIRCAA7hOUAO6kJmMB2jFjHtsxAO6kJ9zRAO7FAmMIZBCkJkUAI8hFASPQRQIj2ADu00FjONNBAO7TQXMI00EA7mM400Fz+NNBAO5jAWQB+CnTRXQZ+SnTRUcBI/pHAiQKAO5kCWAM8CnTRWQSpCjTRQDuZAlgCvAp00VkEnAB8CnTRQDuFByAgICAgICAgP+A8JDwkJAA/v4="
  },
  "./3-games/Space Flight.ch8": {
    name: "Space Flight",
    filename: "./3-games/Space Flight.ch8",
    program: "AOCkCGMAZABlH9NB01FzCENAEhYSCmMAZAFlP6QJ00rVSnQKRB8SKhIepBNjEWQG00ekGnMI00ekIXMI00ekKHMI00ekL2MOZBTTR6Q2cwjTR6Q9cwjTR6REcwjTR6RLcwjTR2AP4KESbBJmaQNqBGsBbABtD0sLawoihGAO4KETDhJ+AOCkCGMAZABlH9NB01FzCENAEpoSjmMAZAFlP6QJ00rVSnQKRB8SrhKipC9jCmQM00ekNnMI00ekPXMI00ekRHMI00ekS3MI00dLAaRSSwKkWUsDpGBLBKRnSwWkbksGpHVLB6R8Swikg0sJpIpLCqSRcwXTR0kDpJxJAqSeSQGkoGACYQLQEgDuIxykmtzSYA/gnhMWE1gA4KSYSwFjHksCYyhLA2MySwRjN0sFYzxLBmNBSwdjRksIY0tLCWNQSwpjVcQ0dArGH9Rhc/9D/wDuE0jc0mAB4KF9/2AE4KF9AXwC3NJPAROWTD4TfmAF8BXwBzAAE3YTWNzSbABgBfAYev86ABNaagRsAG0PewESdmAI8BhgD+ChE6ITnHn/bABtD2oESQATtCKEYA4SfgDgpAhjAGQAZR/TQdNRcwhDQBPKE75jAGQBZT+kCdNK1Up0CkQfE94T0qSiZAhjFNNHcwikqdNHcwiksNNHYxRkEaS300dzCKS+00ekxXMI00cUBv+AgICAgICAgICA+4KC+woK+u8oKO8ICAi+oKCgoKC++ICA+ICA+PqCgvqCgoMPAgICAgLvviAgJiIivouIiPiIiIjggICAgICACAgICAgICD4CAj4gID4+AgI+AgI+IiIiPgICAj4gID4CAj4+ICA+IiI+PgIECBAQED4iIj4iIj4+IiI+AgI+LykpKSkpL4AA4ODb29jYwMD7goKDior67Soo6CgoKL6goL6goL76ioqKion4LygoLyhIj74iIr4oJKI="
  },
  "./3-games/Pong (1 player).ch8": {
    name: "Pong (1 player)",
    filename: "./3-games/Pong (1 player).ch8",
    program: "agJrDGw/bQyi6tq23NZuACLUZgNoAmBg8BXwBzAAEhrHF3cIaf+i8NZxourattzWYAHgoXv+YATgoXsCYB+LAtq2jXDACn3+QAB9AmAAYB+NAtzWovDWcYaEh5RgP4YCYR+HEkYCEnhGPxKCRx9p/0cAaQHWcRIqaAJjAYBwgLUSimj+YwqAcIDVPwESomECgBU/ARK6gBU/ARLIgBU/ARLCYCDwGCLUjjQi1GY+MwFmA2j+MwFoAhIWef9J/mn/Esh5AUkCaQFgBPAYdgFGQHb+Emyi8v4z8mXxKWQUZQDUVXQV8inUVQDugICAgICAgAAAAAAA"
  },
  "./3-games/Coin Flipping [Carmelo Cortez, 1978].ch8": {
    name: "Coin Flipping [Carmelo Cortez, 1978]",
    filename: "./3-games/Coin Flipping [Carmelo Cortez, 1978].ch8",
    program: "bgBtAGwyomJmBWcA1nWiZ2Y21nWi8P4zYwAiQqLw/TNjMiJCywFLAH4BSwF9AUwAEjBqEPoV+gc6ABI2fP8A4BIGZQnyZfAp01VzBfEp01VzBfIp01VLAGgBSwFoAvgYAO6IiPiIiPggICAg"
  },
  "./3-games/Space Intercept [Joseph Weisbecker, 1978].ch8": {
    name: "Space Intercept [Joseph Weisbecker, 1978]",
    filename: "./3-games/Space Intercept [Joseph Weisbecker, 1978].ch8",
    program: "8AowAhIKoroSDKK09WWiwPNVosBmANYzoAZnHWgf14FpAGoPIoYikEoAEipnHmgcorHXg24Aa4BtBO2ha/9tBe2hawBtBu2hawFLgBJSbgH9GKLA1jOGRNYzPwASdE4AEjaisdeDSAASgHj/h7TXgz8BElL9GCKGiVQihqKx14MikHr/Eiaiw/kzbAAimgDuosP6M2wyIpoA7m0b8mXwKdzVfAXxKdzVfAXyKdzVAO4BQOCgfP58CAEFYPBgAwEP"
  },
  "./3-games/Space Invaders [David Winter] (alt).ch8": {
    name: "Space Invaders [David Winter] (alt)",
    filename: "./3-games/Space Invaders [David Winter] (alt).ch8",
    program: "EiVTUEFDRSBJTlZBREVSUyB2MC45IEJ5IERhdmlkIFdJTlRFUmAAYQBiCKPT0BhxCPIeMSASLXAIYQAwQBItaQVsFW4AI4dgCvAV8AcwABJLI4d+ARJFZgBoHGkAagRrCmwEbTxuDwDgI2sjR/0VYATgnhJ9I2s4AHj/I2tgBuCeEosjazg5eAEjazYAEp9gBeCeEulmAWUbhICjz9RRo8/UUXX/Nf8SrWYAEunUUT8BEunUUWYAg0BzA4O1YviDImIIMwASySNzggZDCBLTMxAS1SNzggYzGBLdI3OCBkMgEuczKBLpI3M+ABMHeQZJGGkAagRrCmwEffRuDwDgI0cja/0VEm/3BzcAEm/9FSNHi6Q7EhMbfAJq/DsCEyN8AmoEI0c8GBJvAOCk02AUYQhiD9AfcAjyHjAsEzPwCgDgpvT+ZRIlo7f5HmEII1+BBiNfgQYjX4EGI1970ADugOCAEjAA28Z7DADuo89gHNgEAO4jR44jI0dgBfAY8BXwBzAAE38A7moAjeBrBOmhElemAv0e8GUw/xOlagBrBG0BbgETjaUA8B7bxnsIfQF6AToHE40A7jx+//+ZmX7//yQk537/PDx+24FCPH7/2xA4fP4AAH8APwB/AAAAAQEBAwMDAwAAPyAgICAgICAgPwgI/wAA/gD8AP4AAAB+QkJiYmJiAAD/AAAAAAAAAAD/AAD/AH0AQX0FfX0AAMLCxkRsKDgAAP8AAAAAAAAAAP8AAP8A9xAU9/cEBAAAfET+wsLCwgAA/wAAAAAAAAAA/wAA/wDvICjo6C8vAAD5hcXFxcX5AAD/AAAAAAAAAAD/AAD/AL4AIDAgvr4AAPcE54WFhPQAAP8AAAAAAAAAAP8AAP8AAH8APwB/AAAA7yjvAOBgbwAA/wAAAAAAAAAA/wAA/wAA/gD8AP4AAADAAMDAwMDAAAD8BAQEBAQEBAT8EBD/+YG5i5qa+gD6ipqam5n45iUl9DQ0NAAXFDQ3NibH31BQXNjY3wDfER8SGxnZfET+hoaG/IT+goL+/oDAwMD+/ILCwsL8/oD4wMD+/oDwwMDA/oC+hob+hob+hoaGEBAQEBAQGBgYSEh4nJCwwLCcgIDAwMD+7pKShoaG/oKGhoaGfIKGhoZ8/oL+wMDAfILCysR6/ob+kJyE/sD+AgL+/hAwMDAwgoLCwsL+goKC7jgQhoaWkpLugkQ4OESCgoL+MDAw/gIe8ID+AAAAAAYGAAAAYGDAAAAAAAAAGBgYGAAYfMYMGAAYAAD+/gAA/oKGhob+CAgIGBgY/gL+wMD+/gIeBgb+hMTE/gQE/oD+Bgb+wMDA/oL+/gICBgYGfET+hob+/oL+BgYGRP5ERP5EqKioqKioqGxaAAwYqDBOfgASGGZsqFpmVCRmAEhIGBKoBpCoEgB+MBKohDBOchhmqKioqKiokFR4qEh4bHKoEhhscmZUkKhyKhioME5+ABIYZmyoclSoWmYYfhhOcqhyKhgwZqgwTn4AbDBUTpyoqKioqKioSFR+GKiQVHhmqGwqMFqohDByKqjYqABOEqjkoqgAThKobCpUVHKohDByKqjenKhyKhioDFRIWnhyGGaochhCQmyocioAcqhyKhioME5+ABIYZmyoME4MZhgAbBiocioYMGaoHlRmDBicqCRUVBKoQngMPKiuqKioqKioqP8AAAAAAAAAAAAAAAAAAAA="
  },
  "./3-games/Tetris [Fran Dachille, 1991].ch8": {
    name: "Tetris [Fran Dachille, 1991]",
    filename: "./3-games/Tetris [Fran Dachille, 1991].ch8",
    program: "orQj5iK2cAHQETAlEgZx/9ARYBrQEWAlMQASDsRwRHASHMMDYB5hAyJc9RXQFD8BEjzQFHH/0BQjQBIc56EicuihIoTpoSKW4p4SUGYA9hX2BzYAEjzQFHEBEiqixPQeZgBDAWYEQwJmCEMDZgz2HgDu0BRw/yM0PwEA7tAUcAEjNADu0BRwASM0PwEA7tAUcP8jNADu0BRzAUMEYwAiXCM0PwEA7tAUc/9D/2MDIlwjNADugABnBWgGaQRhH2UQYgcA7kDgAABAwEAAAOBAAEBgQABAQGAAIOAAAMBAQAAA4IAAQEDAAADgIABgQEAAgOAAAEDAgADAYAAAQMCAAMBgAACAwEAAAGDAAIDAQAAAYMAAwMAAAMDAAADAwAAAwMAAAEBAQEAA8AAAQEBAQADwAADQFGY1dv82ABM4AO6itIwQPB58ATwefAE8HnwBI15LCiNykcAA7nEBE1BgG2sA0BE/AHsB0BFwATAlE2IA7mAb0BFwATAlE3SOEI3gfv9gG2sA0OE/ABOQ0OETlNDRewFwATAlE4ZLABOmff9+/z0BE4IjwD8BI8B6ASPAgKBtB4DSQAR1/kUCZQQA7qcA8lWoBPoz8mXwKW0ybgDd5X0F8Snd5X0F8ind5acA8mWitADuagBgGQDuNyM="
  },
  "./3-games/Shooting Stars [Philip Baltzer, 1978].ch8": {
    name: "Shooting Stars [Philip Baltzer, 1978]",
    filename: "./3-games/Shooting Stars [Philip Baltzer, 1978].ch8",
    program: "YABuAGEYYg6ixdEmwzDEGqLF00M/ABKUPgASTsE/wh/JA3kBygN6/IuQzAE8ABJEzAE8ABJIzAE8ABJAYQASTGIAEkyJoBIwirASNm7/gZSCpG0Ii9RPABJcbgCicNEhTwAScnD/osXTQ6Kg00USvgIAosXTQ2UCZgRnBmgI5aF0/+ahc//noXMB6KF0AaJw0SESEKKg0SVwAfAp2GUSsIhQAFCIAAAAVQASmmAAEpplQPUV9Qc1ABK0AOASAmX/EqgAAAA8fv//fjwA"
  },
  "./3-games/Figures.ch8": {
    name: "Figures",
    filename: "./3-games/Figures.ch8",
    program: "AOBgAGEAYhWjENAa0hpxCjEeEgqjGmEdYAHQEXAI0BFwCKMc0BFuAG14ItBgFMoPawlsACLI8BhgFPAV8AcwABI8YAXwGCLQff8i0E0AEpyjCCLIfAFgBOChIp5gBuChIqZgAuChIq4iyE8BEn5gAfAYYALwFfAHMAASdhJQItB+ASLQyg9rCWwAIshPARKcYArwFfAHMAASlBJCEpxLAQDue/4A7ksRAO57AgDuTgAA7iLQfv8i0MAIcBNhAqMg0QhxCNEIAO6jCPop28UA7qMIYzJkAP0z8mXwKdNFcwXxKdNFcwXyKdNFowhjMmQG/jPyZfAp00VzBfEp00VzBfIp00WjCADuAAAAAAAAAACAgICAgICAgICA/wDwAIAAqlU="
  },
  "./3-games/Tic-Tac-Toe [David Winter].ch8": {
    name: "Tic-Tac-Toe [David Winter]",
    filename: "./3-games/Tic-Tac-Toe [David Winter].ch8",
    program: "EhhUSUNUQUMgYnkgRGF2aWQgV0lOVEVSawBsAICwgcCj5vFVo8T/ZaO0/1Wj5vFliwCMEADgbgFgE2EDo5rQEXAIMCsSPmATcQgxIxI+YBNhA6Ob0B9wCDAzElRgE3EP0BpwCDAzEmAjZvAKgQCjtPAe8GVAABKKInwSamAQ8BjwFfAHMAASggDuYAKOA4Dg8FWj1IAQcP+ABPAe8WWjqj4Do6/QFSLIOgASHKO0YQBiAGMB8GUwAHEB8x5yATIQErQxEBJqEhxqAKO0YAHwHvhlaQCJBCNEiRQjRIkkI0ppAIk0I0SJRCNEiVQjSmkAiWQjRIl0I0SJhCNKaQCJZCNEiTQjRIkEI0ppAIl0I0SJRCNEiRQjSmkAiYQjRIlUI0SJJCNKaQCJhCNEiUQjRIkEI0ppAIlkI0SJRCNEiSQjSgDuiQ6JDgDuSRUTVEk/E1oA7iNmewETXiNmfAEjZmoB8AoA7mMFZAqjr9NFYwJ0BqPm+zMjiGMyZAqjqtNFYy90BqPm/DPyZfApI5TxKSOU8inTRXMFAO5/gICAgICAgICAgICAgICAHCIiIhwiFAgUIgEAAAAAAAAAAAABAQEBAQEBAAAAAAAAAAAAAQEBAQEBEwUbBSMFEw0bDSMNExUbFSMV"
  },
  "./3-games/Puzzle.ch8": {
    name: "Puzzle",
    filename: "./3-games/Puzzle.ch8",
    program: "ahJrAWEQYgBgAKKw0SfwKTAA2rVxCHoIMTASJGEQcghqEnsIowDwHvBVcAEwEBIKahJrAWwAYv/ABnACIlJy/zIAEjhuAG4A8AoiUn4BfgESSISghbCGwDACEmRFARJkdfh2/DAIEnBFGRJwdQh2BDAGEnxEEhJ8dPh2/zAEEohEKhKIdAh2AaMA9h7wZYEAYACjAPYe8FWjAPwegBDwVfEp1FXatYpAi1CMYADu7l7+/v7+/v7+/g=="
  },
  "./3-games/Tapeworm [JDR, 1999].ch8": {
    name: "Tapeworm [JDR, 1999]",
    filename: "./3-games/Tapeworm [JDR, 1999].ch8",
    program: "AOCiBhI4/4D7IiIjIiIiAO8oKO8oKCgAvaGhuSEgPAALCgoKCqpTAO8oKC8qKegAtqqioiIiogBkAGUAZh/UUdRhdAhEQBJKEj6iXmQAZT9mAdRq1Wp2CkYfEmgSUoCAgICAgICAgIBkCGUIogjUV3QIohDUV3QIohjUV3QIoiDUV3QIoijUV6IwdAjUV6KSEqr3FBSU9wA4qLixKgBOyk5C7gDuqu4i7gBkEWUT1FV0CKKY1FV0CaKe1FV0CKKk1FVgD+ChEsoSxADgZR9mD6IHZwZoAtVhTwETDvgV8AcwABLeYALgoWcCYATgoWcEYAbgoWcGYAjgoWcIRwJ2/0cIdgFHBHX/RwZ1ARLWYAbwGGAP4J4TFADgEsw="
  },
  "./3-games/Wall [David Winter].ch8": {
    name: "Wall [David Winter]",
    filename: "./3-games/Wall [David Winter].ch8",
    program: "EhggV0FMTCBieSBEYXZpZCBXSU5URVIgouRgAGEAYh7QEdAhcAgwQBIgot9gPmEB0BVxBTEaEjDQFGMAxA90CGUBhFFlA2YCZwGIQHgCaQFqBGsAotrTRdeB/AoixGwB/BX8BzwAEmKi2oxwjYDpnhJ8RAESfNNFdP7TReqeEopEGRKK00V0AtNFh1SIZEcBZQNHPWX9SAFmAkgdZv7c0deBNwESXoyAjEVtAJzQEr59AT0FEqz8CiLEawASXCLEewESXKLl+zNsNG0C8mXxKdzVfAXyKdzVAO6AgICAgODg4ODg/w=="
  },
  "./3-games/Blitz [David Winter].ch8": {
    name: "Blitz [David Winter]",
    filename: "./3-games/Blitz [David Winter].ch8",
    program: "EhdCTElUWiBCeSBEYXZpZCBXSU5URVKjQWAEYQliDmcE0B7yHnAMMEASIfAKAOAi2fAKAOCOcKMeax/MH4zE3LI/ARJJ3LISOcoHegF7/tyyev86ABJNfv8+ABI5awCMcG0AbgCjG93jPwASwTsAEoFgBeCeEodrAYjQeAKJ4HkDox7YkYHwYAXwFfAHMAASizsBEqujHjEB2JF5ATkgEqtrADEAfP9MABK7oxvd430CPUASuW0AfgESZQDgdwISLaMb3eNgFGECYgujINAb8h5wCDAsEs0S12AKYQ1iBaMH0BXyHnAIMCoS4YBwcP6ABqOH8DPyZWAt8SlhDdAVcAXyKdAVAO6DgoOC++gIiAXivqC4ID6AgICA+ID4/MDA+YHby/sA+oqamfjvKugpKQBvaC5Mj76guLC+AL4iPjSy2NgAw8MA2NgAw8MA2NjAwADAwADAwADAwADb29vbABgYABgYABgYANvb29sAGBgAGBgAGBgAGBjb2wADAwAYGADAwADb2w=="
  },
  "./3-games/X-Mirror.ch8": {
    name: "X-Mirror",
    filename: "./3-games/X-Mirror.ch8",
    program: "Zh5nD2gfaQ9qHmsQbB9tEKJoIi5gAuChIkRgCOChIjhgBOChIlBgBuChIlwSFNZx2JHasdzRAO53/3n/ewF9ASIuAO53AXkBe/99/yIuAO52/3gBev98ASIuAO52AXj/egF8/yIuAO6AAA=="
  },
  "./3-games/Soccer.ch8": {
    name: "Soccer",
    filename: "./3-games/Soccer.ch8",
    program: "AOBqDGsMaABpAGYAZwBlAGQAo0gjIiM0Iz5gYPAV8AdAABImEh5kAmYCZxAjCCLUIwgjDEZAElxG/hKAIwhPASLkYAHgoSKkYATgoSKwYAzgoSK8YA3goSLIEjAjIngBSApoACMiYBTwGGYCZxBkAiLUIwhgYPAV8AdAABIwEngjInkBSQppACMiYBTwGGY6ZxBk/iLUIwhgYPAV8AdAABIwEpxKAADuIzR6/iM0AO5KGgDuIzR6AiM0AO5LAADuIz57/iM+AO5LGgDuIz57AiM+AO7AA0AAZf9AAWUAQAJlAQDuRgAS9kYUEvZGKBL2RjwS9gDuItRgBPAYRP4TBGT+AO5kAgDu1nEA7oZEh1RHABMaRx8THgDuZQEA7mX/AO5hFWAA+CnRBXEU+SnRBaNIAO5hANGmcSjRpgDuYRTRtnEo0bYA7oCAgICAgA=="
  },
  "./3-games/Programmable Spacefighters [Jef Winsor].ch8": {
    name: "Programmable Spacefighters [Jef Winsor]",
    filename: "./3-games/Programmable Spacefighters [Jef Winsor].ch8",
    program: "YR5iDqXV0SNlACVwdQE1BhIKpfv1ZUQAZAFCAGIBQQBhAUAAYAFmCIYCNgBgCIYQgVCl+/RVg2BkAADgbgCL4GoDpaUlXvJlagWmACVe9FUlZH4BpfvwZVDgEj6lvWU+ZgHVbWYQ1W1mH3X31WE1ERJqZQBhAGIIJZJ1AXIGNQMSeKX+8GUUcCWSYQRyAaXV0SNy+jIDEpBgABKmJTjwZSVApaTwZXABQGRgACU48FUlQP4KTgAS0H7/ZgiG4jYAbgclLCUYJQZHEBLGJRgSsqX1+WUlLEPwE2L6CiUYpf3wZY0AJPxoAGAO8FV4ATgPEuok3n3/JOQlLCUGNxD3CqX+8GVAABMa+Ac4ABMaJOR5/yTeSQATPCTkRxAS+DcLEyYk5BLeNw4TLiTkEzwk/P0egHDwVSTkPQAS9CUsJRil/PBlhgCl+vVlJSxGABNWhURPAWX/hFBqBaYAJNjqnhNepfvwZX4BUOAS0KXw/WV9/24AJSxD8BOEJPz9HvBlQAUUEn4BpfvwZVDgE3RuAGkAJSxDABQGQ/ATuiT8/R7wZTAOaf9AAhPkQAET1kADE9ZABBPeQAYT3n4BpfvwZWwA/BX8BzwAE8ReABOSOQBNABKcE3BwA4UAJMAT6IUAJMAT/CUsJWSGACSOpchvANEiTwEUAIBg0SIk0iVkE7rRIiUsE/xj8CTSJHglZCR4E7olLEQAE4R0/yTShwAkjk//E4RmA4twi2JqA6XfJV5vAv8Y0SOM8NEjgHA8ARQehRCGIGsAm+AUZCUuQ/AUZFFQFGRSYBRkMwBz/yTUJIIkghOEewGl+/BlULAURhOEMAASiHL6EopvA6Xf0SOl4tEj/xil6NEjpeXRIwDupfHwHvBlggRgAfAe8GWBBG8AMQ4UqGE7b/8xPhSwYRFv/zL9FLhiG2//Mh4A7mIAFLYlLIYAJWSAYEUEcP5wAWYHgGKL4GoFpgAlXvRVAO5o8PgVAO5lB2YU/SnVZaX+8GVAAADuZhr5KdVlAO6L4GoPpiglXgDuJWRnAOehFRR3ATcQFQolZADufgFlB2YI/inVZWYO8ynVZX7/AO6L4GoFpgAlXvRlAO6lpGUAZgEA7qYw8DPyZfEp1WXyKXUF1WUA7mwASgAA7oy0ev8VVCVS/B4A7moDiwClyCVe0SMA7mINYRolkmEhJZ6l+/Ue8FVmePYV9gc2ABWEYRolkmEhFaCl6/Ue8GXwKdElAO7zCoAwFZgBBjsPAhEMACkbBCMAAB0bBC8AADUbBBcASQAAQAAAQAAAQAAAQKAAwECAQIBAwACgQABAYAAgQCAAYEBAQCBAgADgAIBAIAUNDgwPCv39AAMDAwD9/f3U"
  },
  "./3-games/Tank.ch8": {
    name: "Tank",
    filename: "./3-games/Tank.ch8",
    program: "EjB2+2AggGVPAGYAE4QA/wAAAAEADAoAGQIEBggCAgMsAA8AAgUuCAAAAgUAAAAAbgBtoGoIaQZoBGcCZhlkEGMMYgBhBqIS+lUj1GBA8BXwBzAAElAj1CMKI2KiEvVlIq4ixiLsPwEjFD8BIuw/ASLsPwEifE8BE2YSYqIS9WVGADUAEogTjOehYgnooWIE6aFiBuqhYgFCAADuIq6BICOaI6xsAWIAbwCiEvVVo/9BAWAAQQRgE0EGYA1BCWAG8B7TRwDuYAXgngDuRQ8A7mUPdv+iEvVVdANzAyOaI5ojmqIj9VWkGdNBAO6iI/VlRQAA7qQZ00EjmmwCI75LuxMK00GiI/VVAO5lAGAAohfwVRMEoh31ZTUPE0SkGtNFMgATMsEDohnxHvBlgQDCD3IBI5qkGmwDcv9vANNFoh31VQDuxAekH/Qe8GWDAKQn9B7wZYQApBrTRWAg8BhlDxM+ZQATPkwBEgJMAhOCoiP1ZUUAEgKkGdNBbwDTQT8BEgJ+CmBA8BgA4BJKAOAj1GBg8BgTlG4AE4RBAXT/QQRz/0EGcwFBCXQBAO5EAHQBQwBzAUM4c/9EGHT/AO5rAEQAE85DABPOQz8TzkQfa7tvAADuYwhkCKIp/jPyZSPsYyiiKfYz8mUj8gDu8CnTRXMG8SnTRXMG8inTRQDuARBUfGx8fER8fGx8VBAA/HhuePwAPx52Hj8AgKhw+HCoCxsoODAgEAAAAAAIGxsbGAQ="
  },
  "./3-games/Rocket Launch [Jonas Lindstedt].ch8": {
    name: "Rocket Launch [Jonas Lindstedt]",
    filename: "./3-games/Rocket Launch [Jonas Lindstedt].ch8",
    program: "EhJKb25hcyH//4CAgICAgICAAOBgAWEBYj6iCNAR0CFwCDBBEhyiCmACYQFiP9EH0gdwBzAeEi4SdMSqyqqkAISKjorqAGqKjIpqAKqurqpKAO6ExITkAGqKjopqAKI6YgzQG3AI8h7QG3AI8h7QG3DwAO7AH8EPcAZxAyJeYh7yFfIHMgASjCJeEnRiC+KeEoIiXhLU+HBwcHAgIAOiltAWAO6voPJVopzxZWIG4p4SuCKecAEinmIE4p4SxCKecP8inj8AE5yinPFVr6DyZQDuGRmvAGAdgQCCAIMAhAD0VaKcYCBhA/FVbQ1uABMkYgJjAK8A8x7xZaIK0CfRJz8AE5yA1NAngBCB1NEnPwATnK8A8x7wVSKkcgdzATMEEvQA7mECYgCvAPIe8GWiCtAXgNTQF3EHcgEyBBMoopzxZaKW0BYi8K8AYATwHvBlwQJx/4AUQAJgA0AuYC3wVX4BYB+B4IECMR8TRmECYgCvAPIe8GWA1KIK0Bdw/9AXcQdyATIEE3B9/xNGZohIKMZMqqyqSuCIwIjgAGAe8BiADvAV8AcwABOkAOCuAP4zaw1qDWwFo4zatXoI/B7atXoI/B7ata4A8mXwKXoI2rXxKXoF2rXyKXoF2rVsFPwV/Ac8ABPgbAvsnhOwEgA="
  },
  "./3-games/Rocket [Joseph Weisbecker, 1978].ch8": {
    name: "Rocket [Joseph Weisbecker, 1978]",
    filename: "./3-games/Rocket [Joseph Weisbecker, 1978].ch8",
    program: "YQBiAGM4ZBtlAGYIon7VYyJqQgkSFHIBaBpqAMcfdw9pAKJ414aiftVjwAOFBNVjPwASYmAP4KFpATkBEibwBzAAEiaieNeGeP/Xhj8AEmJgA/AVOAASJiJqonjXhoGkEhBqAWAD8BgSWKKg8TOiovBl8CnTRQDuIHBw+NiIfNZ8AA=="
  },
  "./3-games/Reversi [Philip Baltzer].ch8": {
    name: "Reversi [Philip Baltzer]",
    filename: "./3-games/Reversi [Philip Baltzer].ch8",
    program: "bQJuAmwAotdrAGoR2rM6LRIaSxwSHnsEEgp6BBIMah1rDNqzegR7BNqzotras3r82rN7/NqzegTas2ACIt5gNCLeotdgNCLeI5RpASMMaAAjfmkASQkScnkB6Z4SVEkFEow4ACOeIww4ACOeYQLxGBJQaQ/pnhJQOAAi7HyAOAAi7GEY8RjpoRKGElA4ACN+I6gxABJQg6CEsGkAI9BCABJQI5Si2tNDPAASsKLX00M8ABK4fQESun4BI/oj0DIAErojlIHQgeQxQBJ4JC4kLiOIJC4SzAEAQADgoODUYQvQE3AE0HNwBNATAO6kQDwAEwZlAv0zZgTyZfEp1WV1B/Ip1WUA7mU0/jMS9mcASQkTckkIE15JBxNmSQYTVkkEE05JAxNCSQETNksAEzJ7/ADuZ/8A7ksAEzJKERMyevwTLksAEzJKLRMyegQTLkoREzJ6/ADuSi0TMnoEAO5LHBMyewQA7kscEzJKERMyevwTYkscEzJKLRMyegQTYiOIIuwjnniAAO5hEPEV8QcxABOMAO4i7HyAIux8gADuotfaswDuotoToCOkgfAjpEEAE8wjnoHwI54xABPEPAATyGGAAO48ABPAYf8A7mEAAO6KMItAeQFJBXkBYgBJCgDuIwwjqEEAE9AxgBPyMgAA7hPQR/8T0HIBE+CBkGkKiRUjDIGggTUxABQagbCBRTEAFBqBkGkKiRUA7iOePAAUJn0Bfv8UKn3/fgEkLhQAYQTxGCOIAO4UJEotFCR6BBQgAAA="
  },
  "./3-games/Pong (alt).ch8": {
    name: "Pong (alt)",
    filename: "./3-games/Pong (alt).ch8",
    program: "IvZrDGw/bQyi6tq23NZuACLUZgNoAmBg8BXwBzAAEhrHF3cIaf+i8NZxourattzWYAHgoXv+YATgoXsCYB+LAtq2YAzgoX3+YA3goX0CYB+NAtzWovDWcYaEh5RgP4YCYR+HEkYAEnhGPxKCRx9p/0cAaQHWcRIqaAJjAYBwgLUSimj+YwqAcIDVPwESomECgBU/ARK6gBU/ARLIgBU/ARLCYCDwGCLUjjQi1GY+MwFmA2j+MwFoAhIWef9J/mn/Esh5AUkCaQFgBPAYdgFGQHb+Emyi8v4z8mXxKWQUZQDUVXQV8inUVQDugICAgICAgAAAAAAAayBsAKLq28F8ATwgEvxqAADu"
  },
  "./3-games/Rush Hour [Hap, 2006] (alt).ch8": {
    name: "Rush Hour [Hap, 2006] (alt)",
    filename: "./3-games/Rush Hour [Hap, 2006] (alt).ch8",
    program: "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"
  },
  "./3-games/Pong [Paul Vervalin, 1990].ch8": {
    name: "Pong [Paul Vervalin, 1990]",
    filename: "./3-games/Pong [Paul Vervalin, 1990].ch8",
    program: "agJrDGw/bQyi6tq23NZuACLUZgNoAmBg8BXwBzAAEhrHF3cIaf+i8NZxourattzWYAHgoXv+YATgoXsCYB+LAtq2YAzgoX3+YA3goX0CYB+NAtzWovDWcYaEh5RgP4YCYR+HEkYCEnhGPxKCRx9p/0cAaQHWcRIqaAJjAYBwgLUSimj+YwqAcIDVPwESomECgBU/ARK6gBU/ARLIgBU/ARLCYCDwGCLUjjQi1GY+MwFmA2j+MwFoAhIWef9J/mn/Esh5AUkCaQFgBPAYdgFGQHb+Emyi8v4z8mXxKWQUZQDUVXQV8inUVQDugICAgICAgAAAAAAA"
  },
  "./3-games/Rocket Launcher.ch8": {
    name: "Rocket Launcher",
    filename: "./3-games/Rocket Launcher.ch8",
    program: "AOCiYGAHYThiGdAn0SeiXmAAYRjQEXAIMEASFGgeaREiWGAP4J4SJGAI8BgiWHn/IlhgAvAV8AcwABI2YAHwGDkAEiwA4GQMxSDGQNZRdP80ABJIaRoSLqJo2JcA7v8AgICAgICAgAAgcHBwcPhQAA=="
  },
  "./3-games/Rush Hour [Hap, 2006].ch8": {
    name: "Rush Hour [Hap, 2006]",
    filename: "./3-games/Rush Hour [Hap, 2006].ch8",
    program: "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"
  },
  "./4-programs/Random Number Test [Matthew Mikolay, 2010].ch8": {
    name: "Random Number Test [Matthew Mikolay, 2010]",
    filename: "./4-programs/Random Number Test [Matthew Mikolay, 2010].ch8",
    program: "AODA/6Ik8DPyZfApYABjANA18SlgBdA18ilgCtA18AoSAA=="
  },
  "./4-programs/Framed MK1 [GV Samways, 1980].ch8": {
    name: "Framed MK1 [GV Samways, 1980]",
    filename: "./4-programs/Framed MK1 [GV Samways, 1980].ch8",
    program: "IoDMAUwBEhbKPmsCSgASAqKh2rESJMseagJLABICoqHasQAAzQNNAHr/SgF6Ak0Be/9LAXsCTQJ6AUo+ev5NA3sBSx57/qKh2rE/ARIkYA/gnhIkAOASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABrACKSax8ikmoAIqJqPyKiAO5qAKKg2rF6CDpAEpQA7v+AawGiodqxewE7HxKkAO4="
  },
  "./4-programs/Division Test [Sergey Naydenov, 2010].ch8": {
    name: "Division Test [Sergey Naydenov, 2010]",
    filename: "./4-programs/Division Test [Sergey Naydenov, 2010].ch8",
    program: "EgVDOFBgFKNw8FVgBKNv8FVgAKNx8FWjcPBlhQCjb/BlgQCAUIIQgQWBIJAQbwA/ABK/o3DwZYUAYAGBAIBQgBajbvBVo2/wZaNt8FVgAaNs8FWjbvBlhQCjbfBlgQCAUIIQgQWBIJAQbwA/ABKVo23wZYUAYAGBAIBQgB6jbfBVo2zwZYUAYAGBAIBQgB6jbPBVElOjcPBlhQCjbfBlgQCAUIAVo3DwVaNx8GWFAKNs8GWBAIBQgBSjcfBVEhdgAIMAYACEAKNx8GUjUWAUo3DwVWAEo2/wVWAAgwBgCoQAo3DwZYUAo2/wZYEAgFAjEyNREvOBAKNyYgGOJf4e8GUA7mIBYwCDBIElMQATB4AwAO6jcv4e9lVmAIIAghU/ARM/gwCDBoQQZQGCMIJFPwETOYQOhQ4TK4BFhlQTG/VlgGAA7oIAgBU/ABNFgCAA7qNp8DPyZfAp00VzBvEp00VzBvIp00UA7ihjKQAAAAAAAAA="
  },
  "./4-programs/Chip8 Picture.ch8": {
    name: "Chip8 Picture",
    filename: "./4-programs/Chip8 Picture.ch8",
    program: "AOCiSGAAYR5iANIC0hJyCDJAEgpgAGE+YgKiStAu0S5yDtAu0S6iWGALYQjQH3AKomfQH3AKonbQH3ADooXQH3AKopTQHxJG///AwMDAwMDAwMDAwMDAwP+AgICAgICAgICAgICA/4GBgYGBgYH/gYGBgYGBgYCAgICAgICAgICAgICAgP+BgYGBgYH/gICAgICAgP+BgYGBgYH/gYGBgYGB//8="
  },
  "./4-programs/Delay Timer Test [Matthew Mikolay, 2010].ch8": {
    name: "Delay Timer Test [Matthew Mikolay, 2010]",
    filename: "./4-programs/Delay Timer Test [Matthew Mikolay, 2010].ch8",
    program: "ZgEiHvQKRAJzAUQIg2U0BRIC8xXzByIeMwASFBICAOBlAKI68zPyZfAp1WXxKWUF1WXyKWUK1WUA7g=="
  },
  "./4-programs/IBM Logo.ch8": {
    name: "IBM Logo",
    filename: "./4-programs/IBM Logo.ch8",
    program: "AOCiKmAMYQjQH3AJojnQH6JIcAjQH3AEolfQH3AIombQH3AIonXQHxIo/wD/ADwAPAA8ADwA/wD//wD/ADgAPwA/ADgA/wD/gADgAOAAgACAAOAA4ACA+AD8AD4APwA7ADkA+AD4AwAHAA8AvwD7APMA4wBD4ADgAIAAgACAAIAA4ADg"
  },
  "./4-programs/Chip8 emulator Logo [Garstyciuks].ch8": {
    name: "Chip8 emulator Logo [Garstyciuks]",
    filename: "./4-programs/Chip8 emulator Logo [Garstyciuks].ch8",
    program: "AOBgAGEAYgiiIEBAIhpBIBIQ0BjyHnAIEgpgAHEIAO4AAAAAAAAAAAAAAAAAAAAAAH9AX1BXVFQA/AT0FNRUVAA/IC8oKyoqAP4C+grqKioAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFRUVFRUVHQAVFRUVHQAAAAqKioqKio7ACoqKioqKu4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0VFRUVFRUVAAAdFRUVFRUOyoqKioqKiruKioqKioqKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVFRXUF9AfwBUVNQU9AT8ACoqKygvID8AKirqCvoC/gAAAAAAAAAAAAAAAAAAAAAA"
  },
  "./4-programs/Minimal game [Revival Studios, 2007].ch8": {
    name: "Minimal game [Revival Studios, 2007]",
    filename: "./4-programs/Minimal game [Revival Studios, 2007].ch8",
    program: "AOAiFCIaIhoiICIaYAHwFSJCEgZjIGQZAO6iStNGAO5gCOCeEih0AWAC4J4SMHT/YATgnhI4c/9gBuCeEkBzAQDu8AcwABJCAO48GP8YJOd+/5nnPA=="
  },
  "./4-programs/Framed MK2 [GV Samways, 1980].ch8": {
    name: "Framed MK2 [GV Samways, 1980]",
    filename: "./4-programs/Framed MK2 [GV Samways, 1980].ch8",
    program: "IoDMAUwBEhbKPmsCSgASAqKh2rESJMseagJLABICoqHasWgAzQNNAHr/SgF6Ak0Be/9LAXsCTQJ6AUo+ev5NA3sBSx57/qKh2rE/ABJWeP84ABImyANgD+CeEiQA4BIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABrACKSax8ikmoAIqJqPyKiAO5qAKKg2rF6CDpAEpQA7v+AawGiodqxewE7HxKkAO4="
  },
  "./4-programs/SQRT Test [Sergey Naydenov, 2010].ch8": {
    name: "SQRT Test [Sergey Naydenov, 2010]",
    filename: "./4-programs/SQRT Test [Sergey Naydenov, 2010].ch8",
    program: "EntDOFBgBIoAYASLAGAAo3bwHtq4YAyKAGAEiwCjftqxYBSKAGAEiwCjftqxYICjfvBVYByKAGAEiwCjftqxYACFAGD4gVCjdvEe8FVgAYUAYACBUKN28R7wVWAChQBg+IFQo3bxHvBVYB+KAGAHiwBgAKN28B7aswDuIgVgkKOA8FVgDYMAYAaEAKOA8GUjW2ABo3/wVWAAo37wVaOA8GWFAKN/8GWBAIBQgBWjgPBVo3/wZYUAYAKBAIBQgBSjf/BVo37wZYUAYAGBAIBQgBSjfvBVo4DwZYUAYACBAIBQggCAFYAgkBBvAD8AEp1gJoMAYAaEAKN+8GUjWxL9gQCjgWIBjiX+HvBlAO5iAWMAgwSBJTEAExGAMADuo4H+HvZVZgCCAIIVPwETSYMAgwaEEGUBgjCCRT8BE0OEDoUOEzWARYZUEyX1ZYBgAO6CAIAVPwATT4AgAO6jc/Az8mXwKdNFcwbxKdNFcwbyKdNFAO4oYykBQSERCQUDAf8AAAA="
  },
  "./4-programs/Clock Program [Bill Fisher, 1981].ch8": {
    name: "Clock Program [Bill Fisher, 1981]",
    filename: "./4-programs/Clock Program [Bill Fisher, 1981].ch8",
    program: "8QryCvMK9Ar1CvYKAOBnASLOeAHxKdeFZwsizngB8inXhWcXIs54AfMp14VnISLOeAH0KdeFZy0izngB9SnXhWc3Is54AfYp14X9Cm0l/RUSYG07/RUi6HYBRgoSaiLo/Qc9ABJgAtgSUmYAIugi8HUBRQYSeiLwEmBlACLwIvh0AUQKEooi+BJgZAAi+CMAcwFDBhKaIwASYGMAIwAjCHIBQgQSukIKEq4jCBJgYgAjCCMQcQEjEBJgQQISwiMIEmBiACMIIxBhACMQEmBoB6Lg14d3AQDu+PqvL48629T8/Pz8/Pz8AGc49inXhQDuZy71KdeFAO5nIvQp14UA7mcY8ynXhQDuZwzyKdeFAO5nAvEp14UA7g=="
  },
  "./4-programs/Life [GV Samways, 1980].ch8": {
    name: "Life [GV Samways, 1980]",
    filename: "./4-programs/Life [GV Samways, 1980].ch8",
    program: "EoRwBEBAcQRAQGAAMSASuqI4/h5h/PFVbgCiOP4e8WWigNATfgIx/BIa0BMSsqI4/h7xVX4CEgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgoOCA8QpBDxKwagiKEkoAEpb6GBKEgRSBFPAKgASABKKA0BMShG8A0BGM9NARAO7yCmAAYQBuAHL/QgAShGwAooPQEYTw0BFw/CKmcQQipnAEIqZwBCKmcfwipnH8IqZw/CKmcPwipnAEcQRMAhICTAMS+jQBEgISLjQBEi4SAg=="
  },
  "./4-programs/Keypad Test [Hap, 2006].ch8": {
    name: "Keypad Test [Hap, 2006]",
    filename: "./4-programs/Keypad Test [Hap, 2006].ch8",
    program: "Ek4IGQEBCAEPAQEJCAkPCQERCBEPEQEZDxkWARYJFhEWGfz8/Pz8/PwAogKCDvIeggbxZQDuogKCDvIeggbxVQDubxD/Ff8HPwASRgDuAOBiACIq8inQFXD/cf8iNnIBMhASUvIKIiqiItAXIkLQFxJk"
  },
  "./4-programs/BMP Viewer - Hello (C8 example) [Hap, 2005].ch8": {
    name: "BMP Viewer - Hello (C8 example) [Hap, 2005]",
    filename: "./4-programs/BMP Viewer - Hello (C8 example) [Hap, 2005].ch8",
    program: "EgIA4KIB8GWiMGFAMP+BBoAQgA5iAGMBcf/SEXIIkgAiJvMeEhpx/2IAQf8SLADuAAAAAAAAAAAAAAAAAYAAAAAAAAADwAAAAAAAAYPAAAAAAD/Dw8AAAAAA/+PDwB4AAAH/4+PAP4AAM//D48B/wMB74AHj4P/w4H/gAePg//jgf/4B4eDx/PA//8Hh4PB88D3/4eHg8D7wP//h4eDwPvA/8/Hh4PAe+B758eHg8B7/nv/z4eDwPn//f/Ph4Pg+f/8/48Hg+Dx//w/DweB8fDz/B4PD4H58Pj8AA8PgP/g+DwAHw8Af+B4PAAfDwB/wHg8AB4fAD8AeDwAPh8AAAB4PAA+PgAAAHgYABw+AAAAMAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="
  },
  "./4-programs/Fishie [Hap, 2005].ch8": {
    name: "Fishie [Hap, 2005]",
    filename: "./4-programs/Fishie [Hap, 2005].ch8",
    program: "AOCiIGIIYPhwCGEQQCASDtEI8h5xCEEwEggSEAAAAAAAAAAAABg8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4/Pzs5ODg4AACAwef/fjwAH//5wIADAwCA4PB4OBwcODg5Oz8/Pjx4/P7PhwMBAAAAAACA4/9/HDg4cPDgwAA8GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="
  },
  "./4-programs/Jumping X and O [Harry Kleinberg, 1977].ch8": {
    name: "Jumping X and O [Harry Kleinberg, 1977]",
    filename: "./4-programs/Jumping X and O [Harry Kleinberg, 1977].ch8",
    program: "okxlMGYE1WaiQCISokYiEhIIYR5iDdElYwzzFfQHNAASHE8BEi7RJcE/wh8SFtElAO7//////////////////4hQIFCIAPiIiIj4APz8/Pz8/A=="
  },
  "./1-tests/5-quirks.ch8": {
    name: "5-quirks",
    filename: "./1-tests/5-quirks.ch8",
    program: "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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABlABWsZQEVrA=="
  },
  "./1-tests/3-corax+.ch8": {
    name: "3-corax+",
    filename: "./1-tests/3-corax+.ch8",
    program: "EgikZdq0AO4A4Ggyaxqksdi0aDqktdi0aAJpBmoLawFlKmYrpHXYtKSt2bSkZTYrpGHatGsGpHnYtKSt2bSkYUUqpGXatGsLpH3YtKSt2bSkYVVgpGXatGsQpIXYtKSt2bSkYXb/RiqkZdq0ewWkjdi0pK3ZtKRhlWCkZdq0ewWkbdi0pK3ZtKRlEo6kYdq0aBJpFmobawGkcdi0pK3ZtCICewWkadi0pKHZtKRl2rR7BaSJ2LSkadm0pGFlKmcAh1BHKqRl2rR7BaSJ2LSkbdm0pGFmC2cqh2FHK6Rl2rR7BaSJ2LSkcdm0pGFmeGcfh2JHGKRl2rR7BaSJ2LSkddm0pGFmeGcfh2NHZ6Rl2rRoImkmaitrAaSJ2LSkedm0pGFmjGeMh2RHGKRl2rR7BaSJ2LSkfdm0pGFmjGd4h2VH7KRl2rR7BaSJ2LSkhdm0pGFmeGeMh2dH7KRl2rR7BaSJ2LSkgdm0pGFmD4ZmRgekZdq0ewWkidi0pKHZtKRhZuCGbkbApGXatHsFpKXYtKSB2bSkXvFlpGUwqqRhMVWkYdq0aDJpNmo7awGkpdi0pH3ZtKReYABhMPFVpF7wZYEApF/wZaRlMDCkYTEApGHatHsFpKXYtKR12bSkXmaJ9jPyZaRlMAGkYTEDpGEyB6Rh2rR7BaSl2LSkodm0pGFmBPYe2rR7BaSp2LSkrdm0pGVm/3YKNgmkYYZmNgSkYWb/YAqGBDYJpGGGZjYEpGFm/4ZuhmY2f6RhhmaGbjZ+pGFmBXb2NvukYWYFhgU2+6RhZgWAZzD7pGHatBRcqlUAAKBAoACgwIDgoKDgwEBA4OAgwODgYCDgoOAgIODAIMBggODg4CBAQODgoODg4CDAQKDgoMDgoODggIDgwKCgwODAgODggMCAAKCgQKBAoKAKrqJCOCgouA=="
  },
  "./1-tests/6-keypad.ch8": {
    name: "6-keypad",
    filename: "./1-tests/6-keypad.ch8",
    program: "EwxgAOChEgRwAUAQAO4SBGUAoiLxVaKC8VUSIkMB0BIiAgAA9R71HvUe9R7xZWMA8xX0BzQAEkSkI9ASZAr0FWQBg0NkDuSeElJFABJSdf8SHGQP5J4SYJUgEmB1ARIchlBkCuShEoBkAHIBdAHknhJ4hkB2/xKAVCASbHL/EjIiAgAA9h72HvYe9h5kAvQe8WVkEIBBoprxVQAA/GUjAkEAAO6AECMCQgAA7oAgIwJDAADugDAjAkQAAO6AQCMCRQAA7oBQIwJGAADugGAjAkcAAO6AcCMCSAAA7oCAIwJJAADugJAjAkoAAO6AoCMCSwAA7oCwIwJMAADugMAjAgDupCfwHt3kfQQA7gDgof/wZUABE1RAAhNYQAMTvm0KbgKk0yKcbQhuCqTfIpxtCG4PpOsinG0IbhSk9SKcajJrG6WJ2rRqOqWN2rRgpGHHYgISEGGeE1phoWDuo57xVQDgpTP/ZaQS/1VtEm4DpUMinG0SbgqlSyKcbRJuEaVTIpxtEm4YpVsinG4AI5Z+AU4QbgATjKQS/h7wZWIB7qFiAJAgE7yA4IAOpWPwHvFlpYPQFqQS/h6AIPBVAO4A4G0Gbg2lAyKcYAPwFfAK8QcxABPy4KET+ADgpCVgHmEJ0BNtEG4RpREinCIC8AoiAhMMbQqlGhP8bQilJgDgbhEinKQoYB5hCdATIgLwCiICEwwAAAAAAAAAAAAAAAAAAAAAAMDAoMCAoECg4KCg4MBAQODgIMDg4GAg4KDgICDgwCDA4IDg4OAgICDg4KDg4OAg4ECg4KDA4KDg4ICA4MCgoMDgwIDg4IDAgGCAoGCg4KCg4EBA4GAgIMCgwKCggICA4ODgoKDAoKCg4KCg4MCgwIBAoOBgwKDAoGDAIMDgQEBAoKCgYKCgoECgoODgoECgoKCgQEDgYIDgAAAAAADgAAAAAABABAsDVAQQA1gEFQO+aEw0VJRkaDRkODwACJQ8iCg8lDhkhGAADJQ8iCwIlHxoABCUQIgELJREPHhUPIwAaHA8dHSULGCMlFQ8jAAsWFiURGRkOABgZHiUSCxYeExgRABgZHiUcDxYPCx0PDgAAAAAAAAAAAAAAAAAAAAAAAiUDJQQlDQAFJQYlByUOAAglCSUKJQ8ACyUBJQwlEAAGBcQAhgCIAIQCRgJIAkQEBgQIBAQFyAXKAIoCSgQKBf+/v7+/v4KrqJCOCgouA=="
  },
  "./1-tests/1-chip8-logo.ch8": {
    name: "1-chip8-logo",
    filename: "./1-tests/1-chip8-logo.ch8",
    program: "AOBhAWAIolDQH2AQol/QH2AYom7QH2Agon3QH2AooozQH2AwopvQH2EQYAiiqtAfYBCiudAfYBiiyNAfYCCi19AfYCii5tAfYDCi9dAfEk4PAgICAgIAAB8/ceDl4OigDSooKCgAABi4uDg4P78AGaW9oZ0AAAwdHQENHZ0BxykpKScAAPj8zsbGxsYASUpJSDsAAAABAwMDAfAwkAAAgAAAAP7Hg4ODxvzn4ODg4HE/HwAABwICAgI5ODg4OLi4OAAAMUp5QDvd3d3d3d3d3QAAoDggoBjO/PjA1NzExQAAMEQkFGPxAwcHd1dTcQAAKI6oqKbOhwMDA4f+/AAAYJDwgHA="
  },
  "./1-tests/4-flags.ch8": {
    name: "4-flags",
    filename: "./1-tests/4-flags.ch8",
    program: "EqBgAOChEgRwAUAQAO4SBPxlInZBAADugBAidkIAAO6AICJ2QwAA7oAwInZEAADugEAidkUAAO6AUCJ2RgAA7oBgInZHAADugHAidkgAAO6AgCJ2SQAA7oCQInZKAADugKAidksAAO6AsCJ2TAAA7oDAInYA7qU/8B7d5H0EAO6lQ47Qju6O7v4e2rR6BQDupUCSwKU9ewHas3oEe/8A7gDgajJrG6Xx2rRqOqX12rRtAG4Apd8iEGoWawBhD20BIoBjD28Ug/FvAGIyghGO8Gw/IpCC4GwAIpCCMGwfIpB6BW0CIoBjD28Ug/JvAGIyghKO8GwCIpCC4GwAIpCCMGwEIpB7BWoAbQMigGMPbxSD828AYjKCE47wbD0ikILgbAAikIIwbBsikHoFbQQigG8UjxSE8GMPbxSD9G+qYjKCFI7wbEEikILgbAAikIIwbCMikIJAbAAikHoBbQUigG8UjxWE8GMUbw+D9W+qYjKCFY7wbCMikILgbAEikIIwbAUikIJAbAEikHsFagBtBiKAbzyP9oPwb6piPIImjvBsHiKQguBsACKQgjBsACKQegVtByKAbwqPF4TwYw9vFIP3b6piD2EygheO8GwjIpCC4GwBIpCCMGwFIpCCQGwBIpB6AW0OIoBvMo/+g/BvqmIygi6O8GxkIpCC4GwAIpCCMGwAIpBtAG4QpeUiEGoWaxBhZG0EIoBvyI8UhPBjZG/Ig/RvqmLIghSO8GwsIpCC4GwBIpCCMGwsIpCCQGwBIpB6AW0FIoBvX48VhPBjX29kg/VvqmJfghWO8Gz7IpCC4GwAIpCCMGz7IpCCQGwAIpB7BWoAbQYigG89j/aD8G+qYj2CJo7wbB4ikILgbAEikIIwbAEikHoFbQcigG9pjxeE8GNpb2SD92+qYmmCF47wbPsikILgbAAikIIwbPsikIJAbAAikHoBbQ4igG+8j/6D8G+qYryCLo7wbHgikILgbAEikIIwbAEikG0Abhul6yIQahZrG20PIoB6/20OIoClLGEQ8R5gqvBVpTzwZYIAbKoikKUsbxD/HmBV8FWlPPBlggBsVSKQFSoAAAAAAAAAAAAAAAAAAAAAAKDAgKBAoOCgoODAQEDg4CDA4OBgIOCg4CAg4MAgwOCA4ODgICAg4OCg4ODgIOBAoOCgwOCg4OCAgODAoKDA4MCA4OCAwIBggKBgoOCgoOBAQOBgICDAoMCgoICAgODg4KCgwKCgoOCgoODAoMCAQKDgYMCgwKBgwCDA4EBAQKCgoGCgoKBAoKDg4KBAoKCgoEBA4GCA4AAAAAAA4AAAAAAAQEgsaGiMADQscHCMAGR4SDxwAAquokI4KCi4"
  },
  "./1-tests/7-hires-quirks.ch8": {
    name: "7-hires-quirks",
    filename: "./1-tests/7-hires-quirks.ch8",
    program: "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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABlABWyZQEVsg=="
  },
  "./1-tests/2-ibm-logo.ch8": {
    name: "2-ibm-logo",
    filename: "./1-tests/2-ibm-logo.ch8",
    program: "AOCiKmAMYQjQH3AJojnQH6JIcAjQH3AEolfQH3AIombQH3AIonXQHxIo/wD/ADwAPAA8ADwA/wD//wD/ADgAPwA/ADgA/wD/gADgAOAAgACAAOAA4ACA+AD8AD4APwA7ADkA+AD4AwAHAA8AvwD7APMA4wBD5QXiAIUHgQGAAoAH5QXn"
  },
  "./2-demos/Particle Demo [zeroZshadow, 2008].ch8": {
    name: "Particle Demo [zeroZshadow, 2008]",
    filename: "./2-demos/Particle Demo [zeroZshadow, 2008].ch8",
    program: "oyFgAGEAYgjQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFfIegCTQFWYFZwJqABK4awBsAKLY+x7zZSLOIlwSYiLOIlx7BHwBXGASQBI8EgCjIN7RAO6i2Pse82WAJIE0jgCNEI7mjdaE4GXChFRPARKSTQBjAYTQZeGEVE8BEpIzAnMBEpQinKLY+x7zVRJMowD6HvBlggB6AWQfikJgIGEegA6BHsMDc/gA7msAbAAinKLY+x7zVXsEfAFcYBK8EjyOAI0QjuaN1gDuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPj6+f77/P3/AgEDBQQGBwgGBwQFAwEC/v/8+/36+fj6gPcGdwY2AAAAx2zPDAwAAACf2d/Z2QAAAD+MDIyMAAAAZ2xsbGcAAACwMDAwvgAAAPnD8cD7AAAA7wDOYMwAAAA="
  },
  "./2-demos/Maze (alt) [David Winter, 199x].ch8": {
    name: "Maze (alt) [David Winter, 199x]",
    filename: "./2-demos/Maze (alt) [David Winter, 199x].ch8",
    program: "YABhAKIiwgEyAaIe0BRwBDBAEgRgAHEEMSASBBIcgEAgECBAgBA="
  },
  "./2-demos/Maze [David Winter, 199x].ch8": {
    name: "Maze [David Winter, 199x]",
    filename: "./2-demos/Maze [David Winter, 199x].ch8",
    program: "oh7CATIBohrQFHAEMEASAGAAcQQxIBIAEhiAQCAQIECAEA=="
  },
  "./2-demos/keyboard.ch8": {
    name: "keyboard",
    filename: "./2-demos/keyboard.ch8",
    program: "EikAAAAAAAAAAAAAAAAAAAAAAQIDDAQFBg0HCAkOCgALD37//////35hEmIBYwCiEvMe8GXwKdElcQhBMnIIQTJhEnMBMxASL2EBYhBjAKIC8GUwABJj4Z4SYWABoiLSNxJt4aESbWAAoiLSN6IC8FVhAmIYYwCiA/BlMAASi+GeEolgAaIi0jcSleGhEpVgAKIi0jeiA/BVYQNiIGMAogTwZTAAErPhnhKxYAGiItI3Er3hoRK9YACiItI3ogTwVWEMYihjAKIF8GUwABLb4Z4S2WABoiLSNxLl4aES5WAAoiLSN6IF8FVhBGIQYwiiBvBlMAATA+GeEwFgAaIi0jcTDeGhEw1gAKIi0jeiBvBVYQViGGMIogfwZTAAEyvhnhMpYAGiItI3EzXhoRM1YACiItI3ogfwVWEGYiBjCKII8GUwABNT4Z4TUWABoiLSNxNd4aETXWAAoiLSN6II8FVhDWIoYwiiCfBlMAATe+GeE3lgAaIi0jcTheGhE4VgAKIi0jeiCfBVYQdiEGMQogrwZTAAE6PhnhOhYAGiItI3E63hoROtYACiItI3ogrwVWEIYhhjEKIL8GUwABPL4Z4TyWABoiLSNxPV4aET1WAAoiLSN6IL8FVhCWIgYxCiDPBlMAAT8+GeE/FgAaIi0jcT/eGhE/1gAKIi0jeiDPBVYQ5iKGMQog3wZTAAFBvhnhQZYAGiItI3FCXhoRQlYACiItI3og3wVWEKYhBjGKIO8GUwABRD4Z4UQWABoiLSNxRN4aEUTWAAoiLSN6IO8FVhAGIYYxiiD/BlMAAUa+GeFGlgAaIi0jcUdeGhFHVgAKIi0jeiD/BVYQtiIGMYohDwZTAAFJPhnhSRYAGiItI3FJ3hoRSdYACiItI3ohDwVWEPYihjGKIR8GUwABS74Z4UuWABoiLSNxTF4aEUxWAAoiLSN6IR8FUSSQ=="
  },
  "./2-demos/Stars [Sergey Naydenov, 2010].ch8": {
    name: "Stars [Sergey Naydenov, 2010]",
    filename: "./2-demos/Stars [Sergey Naydenov, 2010].ch8",
    program: "EgVDOFBgAIUAwDiBUKWw8R7wVWAAhQDAGIFQpbjxHvBVYAClsPAe8GWKAGAApbjwHvBliwBgAKWA8B7auGABpcLwVWAHpcTwVaXC8GWFAMA4gVClsPEe8FVgAKXB8FWlwvBlhQBgAYEAgFCAFaXG8FWlwvBlpbDwHvBlhQClwfBlpbDwHvBlhgBgCIEAgGCAFIEAgFCCAIAVgCA/ABLbpcLwZaWw8B7wZYUApcHwZaWw8B7wZYYAYAiBAIBggBWBAIBQghCBBYEgPwAS1WABpcPwVRLbYAClw/BVpcHwZYUApcbwZYEAgFCCEIEFgSCQEG8APwETAaXB8GVwAfBVEnGlw/BlhQBgAYFQUBBvAT8AEyOlwvBlhQDAeIFQpbDxHvBVpcPwZYUAYACBUFAQbwGQEG8APwASWaXC8GWFAMAYgVCluPEe8FVgAKXB8FWlwvBlhQBgAYEAgFCAFaXG8FWlwvBlpbjwHvBlhQClwfBlpbjwHvBlhgBgCIEAgGCAFIEAgFCCAIAVgCA/ABPLpcLwZaW48B7wZYUApcHwZaW48B7wZYYAYAiBAIBggBWBAIBQghCBBYEgPwATxWABpcPwVRPLYAClw/BVpcHwZYUApcbwZYEAgFCCEIEFgSCQEG8APwET8aXB8GVwAfBVE2Glw/BlhQBgAYFQUBBvAT8AFBOlwvBlhQDAGIFQpbjxHvBVpcPwZYUAYACBUFAQbwGQEG8APwATSaXC8GWlsPAe8GWKAKXC8GWluPAe8GWLAGAApYDwHtq4pcLwZYUApcTwZYEAgFCCEIEFgSCQEG8APwEUb6XC8GVwAfBVEknAB6XA8FWlwPBlpbDwHvBligClwPBlpbjwHvBliwClwPBlpajwHvBlpYDwHvBl2rhgCvAVpcDwZYUApcDwZaWo8B7wZYYAYAiBAIBggBSBUKWo8R7wVaXA8GWlqPAe8GWFAGAggQCAUIIQgQWBID8AFPGlwPBlhQBgAIFQpajxHvBVpcDwZYUAYDKBUFAQbwGQEG8APwAUbxUHgQClx2IBjiX+HvBlAO5iAWMAgwSBJTEAFRuAMADupcf+HvZVZgCCAIIVPwEVU4MAgwaEEGUBgjCCRT8BFU2EDoUOFT+ARYZUFS/1ZYBgAO6CAIAVPwAVWYAgAO6lffAz8mXwKdNFcwbxKdNFcwbyKdNFAO4oYykAAAAQAAAAAAAAOCg4AAAAAFQARABUAACSAACCAACSAJJUOP44VJIACAgICAgICAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  },
  "./2-demos/Sierpinski [Sergey Naydenov, 2010].ch8": {
    name: "Sierpinski [Sergey Naydenov, 2010]",
    filename: "./2-demos/Sierpinski [Sergey Naydenov, 2010].ch8",
    program: "EgVDOFBgAIUAYAGBUKPm8R7wVWAfigBgAIsAo8LwZaPC2rFgAaPD8FVgH6QG8FVgAaPE8FWjw/BlhQBgAYEAgFCAFKQH8FWjxPBlhQBgAYEAgFCAFaPF8FWjxPBlhQCjxfBlo+bwHvBlhgCjxPBlhwBgAYEAgHCAFKPm8B7wZYEAgGCAE4FQo8bxHvBVo8XwZYUAo8XwZaPG8B7wZYFQo+bxHvBVo8TwZaPG8B7wZYUAYAGBUFAQbwE/ABL5o8TwZYUAYB+BAIBQgBSKAKPD8GWLAKPC8GWjwtqxYB+FAKPE8GWBAIBQgBWKAKPD8GWLAKPC8GWjwtqxo8TwZYUApAfwZYEAgFCCEIEFgSCQEG8APwETIaPE8GVwAaPE8FUSR6PD8GWFAKQG8GWBAIBQghCBBYEgkBBvAD8BE0mjw/BlcAGjw/BVEi8TSYEApAhiAY4l/h7wZQDuYgFjAIMEgSUxABNdgDAA7qQI/h72VWYAggCCFT8BE5WDAIMGhBBlAYIwgkU/AROPhA6FDhOBgEWGVBNx9WWAYADuggCAFT8AE5uAIADuo7/wM/Jl8CnTRXMG8SnTRXMG8inTRQDuKGMpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  },
  "./2-demos/Trip8 Demo (2008) [Revival Studios].ch8": {
    name: "Trip8 Demo (2008) [Revival Studios]",
    filename: "./2-demos/Trip8 Demo (2008) [Revival Studios].ch8",
    program: "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"
  },
  "./2-demos/Sirpinski [Sergey Naydenov, 2010].ch8": {
    name: "Sirpinski [Sergey Naydenov, 2010]",
    filename: "./2-demos/Sirpinski [Sergey Naydenov, 2010].ch8",
    program: "EgVDOFBgAIUAYAGBUKPm8R7wVWAfigBgAIsAo8LwZaPC2rFgAaPD8FVgH6QG8FVgAaPE8FWjw/BlhQBgAYEAgFCAFKQH8FWjxPBlhQBgAYEAgFCAFaPF8FWjxPBlhQCjxfBlo+bwHvBlhgCjxPBlhwBgAYEAgHCAFKPm8B7wZYEAgGCAE4FQo8bxHvBVo8XwZYUAo8XwZaPG8B7wZYFQo+bxHvBVo8TwZaPG8B7wZYUAYAGBUFAQbwE/ABL5o8TwZYUAYB+BAIBQgBSKAKPD8GWLAKPC8GWjwtqxYB+FAKPE8GWBAIBQgBWKAKPD8GWLAKPC8GWjwtqxo8TwZYUApAfwZYEAgFCCEIEFgSCQEG8APwETIaPE8GVwAaPE8FUSR6PD8GWFAKQG8GWBAIBQghCBBYEgkBBvAD8BE0mjw/BlcAGjw/BVEi8TSYEApAhiAY4l/h7wZQDuYgFjAIMEgSUxABNdgDAA7qQI/h72VWYAggCCFT8BE5WDAIMGhBBlAYIwgkU/AROPhA6FDhOBgEWGVBNx9WWAYADuggCAFT8AE5uAIADuo7/wM/Jl8CnTRXMG8SnTRXMG8inTRQDuKGMpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
  },
  "./2-demos/Zero Demo [zeroZshadow, 2007].ch8": {
    name: "Zero Demo [zeroZshadow, 2007]",
    filename: "./2-demos/Zero Demo [zeroZshadow, 2007].ch8",
    program: "YAplBWYKZw9oFGEBYgFjAWQBYAqieNBWcAqiftBmcAqihNB2cAqiitCGagP6FWAKonjQVkUUYf9FAWEBhRTQVnAKon7QZkYUYv9GAWIBhiTQZnAKooTQdkcUY/9HAWMBhzTQdnAKoorQhkgUZP9IAWQBiETQhhIq/wMMMMD//8DA/MD/8MzM8MzDPMPDw8M8"
  }
};

// roms/utils.ts
function decodeProgram(program) {
  return Array.from(atob(program)).map((c) => c.charCodeAt(0));
}

// frontend/CanvasDisplay.ts
class CanvasDisplay extends Display {
  canvas;
  context;
  renderCanvas;
  renderContext;
  imageData;
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
  }
  resize(w, h) {
    Display.prototype.resize.call(this, w, h);
    this.renderCanvas = new OffscreenCanvas(w, h);
    this.renderContext = this.renderCanvas.getContext("2d");
    this.imageData = this.renderContext.createImageData(w, h);
  }
  render() {
    this.imageData.data.set(this.pixmap8);
    this.renderContext.putImageData(this.imageData, 0, 0);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.renderCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }
}

// src/chip8/sound.ts
class Sound {
  playing = false;
  constructor() {
    this.reset();
  }
  reset() {
  }
  start() {
    if (!this.playing) {
      this.playing = true;
      this.play();
    }
  }
  stop() {
    if (this.playing) {
      this.playing = false;
      this.pause();
    }
  }
}

// frontend/BrowserAudio.ts
class BrowserAudio extends Sound {
  constructor() {
    super(...arguments);
  }
  context;
  oscillator;
  gain;
  init() {
    if (!this.context) {
      this.context = new AudioContext;
    }
    if (!this.gain) {
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.25;
      this.gain.connect(this.context.destination);
    }
  }
  play() {
    if (this.oscillator)
      return;
    this.init();
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = "square";
    this.oscillator.frequency.value = 300;
    this.oscillator.connect(this.gain);
    this.oscillator.start(this.context.currentTime);
  }
  pause() {
    if (!this.oscillator)
      return;
    this.oscillator.stop();
    this.oscillator = undefined;
  }
}

// frontend/index.ts
var tick = function() {
  let chip8_clock = 500;
  let framerate = 60;
  chip82.tick(STEPPING ? 1 : chip8_clock / framerate);
  debug.innerText = `PC: \$${chip82.cpu.r.PC.toString(16)} I: \$${chip82.cpu.r.I.toString(16)} Vx: \$${chip82.cpu.r.Vx} DT: \$${chip82.cpu.r.DT} ST: \$${chip82.cpu.r.ST}`;
};
var run = function() {
  chip82.start();
  setTimeout(function frameCallback() {
    tick();
    if (chip82.running && !STEPPING) {
      setTimeout(frameCallback, 16.666666666666668);
    }
  }, 16.666666666666668);
};
var canvas = document.getElementById("chip8--canvas");
var debug = document.getElementById("chip8--debug");
var chip82 = new Chip8(new CanvasDisplay(canvas), new BrowserAudio);
{
  let selectQuirks = function() {
    chip82.quirks = QuirkModes[quirksMode.value];
  };
  const quirksMode = document.getElementById("quirksMode");
  quirksMode.addEventListener("change", selectQuirks);
  selectQuirks();
}
{
  let loadProgram = function() {
    window.location.hash = program_select.value;
    chip82.running = false;
    chip82.reset();
    chip82.load(decodeProgram(roms_default[program_select.value].program));
    run();
  };
  const program_select = document.getElementById("chip8--selector");
  Object.entries(roms_default).sort(([ak, av], [bk, bv]) => ak > bk ? 1 : -1).forEach(([filename, program_data]) => {
    const opt = document.createElement("option");
    opt.value = filename;
    opt.textContent = program_data.filename.slice(2).split("/").join(" :: ");
    program_select.options.add(opt);
  });
  program_select.addEventListener("change", loadProgram);
  if (window.location.hash) {
    const opt = Array.prototype.find.call(program_select.options, (opt2) => opt2.value == window.location.hash.substring(1));
    if (opt) {
      opt.selected = true;
      loadProgram();
    }
  }
}
var STEPPING = false;
{
  const keymap = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 12,
    q: 4,
    w: 5,
    e: 6,
    r: 13,
    a: 7,
    s: 8,
    d: 9,
    f: 14,
    z: 10,
    x: 0,
    c: 11,
    v: 15
  };
  window.addEventListener("keydown", (ev) => {
    let key;
    if ((key = keymap[ev.key]) != null) {
      chip82.input.press(key);
    }
    if (ev.key == "t") {
      chip82.cpu.reset();
      chip82.display.reset();
      chip82.display.render();
      chip82.start();
      if (!STEPPING) {
        run();
      }
    }
    if (ev.key == "j") {
      STEPPING = true;
      tick();
    }
    if (ev.key == "k") {
      STEPPING = false;
      if (chip82.running) {
        run();
      }
    }
  });
  window.addEventListener("keyup", (ev) => {
    let key;
    if ((key = keymap[ev.key]) != null) {
      chip82.input.release(key);
    }
  });
}
