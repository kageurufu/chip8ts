import type Chip8 from "../chip8";
import type Display from "./display";
import type Memory from "./memory";
import type Input from "./input";

import randomInt from "../utils/randomInt";
import {
  op_addr,
  op_kk,
  op_n,
  op_x,
  op_y,
  nib_hi,
  nib_lo,
  word,
} from "../utils/bit_math";
import { Byte, Address, Instruction, Nibble, Vx, Vy, Word } from "../types";

const formatInst = ({ op, ...args }: Instruction) => {
  const strArgs = Object.entries(args)
    .map(([k, v]) => `${k}=$${v.toString(16)}`)
    .join(" ");
  return op + " (" + strArgs + ")";
};

import Registers from "./registers";
import { Direction } from "./display";

export type CPUDump = number[];

export default class CPU {
  chip8: Chip8;

  display: Display;
  input: Input;
  memory: Memory;

  r: Registers;
  halt_keypress: null | number;

  constructor(chip8: Chip8, display: Display, input: Input, memory: Memory) {
    this.chip8 = chip8;

    this.display = display;
    this.input = input;
    this.memory = memory;

    this.r = new Registers();
    this.halt_keypress = null;
  }

  dump(): CPUDump {
    return [...this.r.raw, ...this.r.Save];
  }

  restore(dump: CPUDump) {
    this.r.raw.set(dump.slice(0, this.r.raw.length));
    if (dump.length > this.r.raw.length) {
      this.r.Save.set(dump.slice(this.r.raw.length));
    }
  }

  reset() {
    // this.r.SP = 0x200;
    this.r.raw.fill(0);
    this.r.PC = 0x200;
  }

  tick() {
    const hi = this.chip8.memory.read(this.r.PC);
    const lo = this.chip8.memory.read(this.r.PC + 1);

    const instruction = this.parse(hi, lo);

    console.debug(
      `$${hi.toString(16).padStart(2, "0")}${lo.toString(16).padStart(2, "0")}`,
      formatInst(instruction).padEnd(32, " "),
      `PC=$${this.r.PC.toString(16)}`,
      `I=$${this.r.I.toString(16)}`,
      `Vx=$${Array.prototype.map
        .call(this.r.Vx, (x) => x.toString(16))
        .join(",")}`,
      `DT=$${this.r.DT.toString(16)}`,
      `ST=$${this.r.ST.toString(16)}`,
      `SP=$${this.r.SP}`,
      `Stack=$${Array.prototype.map
        .call(this.r.Stack.subarray(0, this.r.SP), (x) => x.toString(16))
        .join(",")}`
    );
    this.r.PC += 2;

    this.execute(instruction);

    return instruction;
  }

  parse(hi: number, lo: number): Instruction {
    // TODO: Make this more readable! somehow...

    if (hi == 0x00) {
      /* 00Cn */
      if (nib_hi(lo) == 0xc) return { op: "SCD n", n: op_n(hi, lo) };

      /* 00E0 */
      if (lo == 0xe0) return { op: "CLS" };

      /* 00EE */
      if (lo == 0xee) return { op: "RET" };

      /* 00FB */
      if (lo == 0xfb) return { op: "SCR" };

      /* 00FC */
      if (lo == 0xfc) return { op: "SCL" };

      /* 00FD */
      if (lo == 0xfd) return { op: "EXIT" };

      /* 00FE */
      if (lo == 0xfe) return { op: "LORES" };

      /* 00FF */
      if (lo == 0xff) return { op: "HIRES" };
    }

    /* 0nnn */
    if ((hi & 0xf0) == 0x00) return { op: "SYS addr", addr: op_addr(hi, lo) };

    /* 1nnn */
    if ((hi & 0xf0) == 0x10) return { op: "JP addr", addr: op_addr(hi, lo) };

    /* 2nnn */
    if ((hi & 0xf0) == 0x20) return { op: "CALL addr", addr: op_addr(hi, lo) };

    /* 3xkk */
    if ((hi & 0xf0) == 0x30)
      return { op: "SE Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };

    /* 4xkk */
    if ((hi & 0xf0) == 0x40)
      return { op: "SNE Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };

    /* 5xy0 */
    if ((hi & 0xf0) == 0x50 && (lo & 0x0f) == 0x00)
      return { op: "SE Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 6xkk */
    if ((hi & 0xf0) == 0x60)
      return { op: "LD Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };

    /* 7xkk */
    if ((hi & 0xf0) == 0x70)
      return { op: "ADD Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };

    /* 8xy0 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x00)
      return { op: "LD Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xy1 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x01)
      return { op: "OR Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xy2 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x02)
      return { op: "AND Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xy3 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x03)
      return { op: "XOR Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xy4 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x04)
      return { op: "ADD Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xy5 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x05)
      return { op: "SUB Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xy6 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x06)
      return { op: "SHR Vx{, Vy}", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xy7 */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x07)
      return { op: "SUBN Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 8xyE */
    if ((hi & 0xf0) == 0x80 && (lo & 0x0f) == 0x0e)
      return { op: "SHL Vx{, Vy}", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* 9xy0 */
    if ((hi & 0xf0) == 0x90 && (lo & 0x0f) == 0x00)
      return { op: "SNE Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* Annn */
    if ((hi & 0xf0) == 0xa0) return { op: "LD I, addr", addr: op_addr(hi, lo) };

    /* Bnnn */
    if ((hi & 0xf0) == 0xb0) {
      return {
        op: "JP Vx, addr",
        x: this.chip8.quirks.Jumping ? op_x(hi, lo) : 0,
        addr: op_addr(hi, lo),
      };
    }

    /* Cxkk */
    if ((hi & 0xf0) == 0xc0)
      return { op: "RND Vx, kk", x: op_x(hi, lo), kk: op_kk(hi, lo) };

    /* Dxy0 */
    if ((hi & 0xf0) == 0xd0 && (lo & 0x0f) == 0x00)
      return { op: "DRW16 Vx, Vy", x: op_x(hi, lo), y: op_y(hi, lo) };

    /* Dxyn */
    if ((hi & 0xf0) == 0xd0)
      return {
        op: "DRW Vx, Vy, n",
        x: op_x(hi, lo),
        y: op_y(hi, lo),
        n: op_n(hi, lo),
      };

    /* Ex9E */
    if ((hi & 0xf0) == 0xe0 && lo == 0x9e)
      return { op: "SKP Vx", x: op_x(hi, lo) };

    /* ExA1 */
    if ((hi & 0xf0) == 0xe0 && lo == 0xa1)
      return { op: "SKNP Vx", x: op_x(hi, lo) };

    /* Fx07 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x07)
      return { op: "LD Vx, DT", x: op_x(hi, lo) };

    /* Fx0A */
    if ((hi & 0xf0) == 0xf0 && lo == 0x0a)
      return { op: "LD Vx, K", x: op_x(hi, lo) };

    /* Fx15 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x15)
      return { op: "LD DT, Vx", x: op_x(hi, lo) };

    /* Fx18 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x18)
      return { op: "LD ST, Vx", x: op_x(hi, lo) };

    /* Fx1E */
    if ((hi & 0xf0) == 0xf0 && lo == 0x1e)
      return { op: "ADD I, Vx", x: op_x(hi, lo) };

    /* Fx29 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x29)
      return { op: "LD F, Vx", x: op_x(hi, lo) };

    /* Fx30 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x30)
      return { op: "LD HF, Vx", x: op_x(hi, lo) };

    /* Fx33 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x33)
      return { op: "LD B, Vx", x: op_x(hi, lo) };

    /* Fx55 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x55)
      return { op: "LD [I], Vx", x: op_x(hi, lo) };

    /* Fx65 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x65)
      return { op: "LD Vx, [I]", x: op_x(hi, lo) };

    /* Fx75 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x75)
      return { op: "SAVE Vx", x: op_x(hi, lo) };

    /* Fx85 */
    if ((hi & 0xf0) == 0xf0 && lo == 0x85)
      return { op: "LOAD Vx", x: op_x(hi, lo) };

    throw new Error(
      `Unable to parse opcode ${hi.toString(16).padStart(2, "0")}${lo
        .toString(16)
        .padStart(2, "0")} at ${this.r.PC.toString(16).padStart(3, "0")}`
    );
  }

  execute(i: Instruction) {
    switch (i.op) {
      case "SYS addr": {
        /* ignored */ break;
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
        this.r.I = 0x05 * this.r.Vx[i.x];
        break;
      }

      case "LD B, Vx": {
        const Vx = this.r.Vx[i.x];
        const I = this.r.I;
        this.chip8.memory.write(I + 0, (Vx / 100) % 10);
        this.chip8.memory.write(I + 1, (Vx / 10) % 10);
        this.chip8.memory.write(I + 2, (Vx / 1) % 10);
        break;
      }

      case "LD [I], Vx": {
        for (let n = 0; n <= i.x; n++) {
          this.chip8.memory.write(this.r.I + n, this.r.Vx[n]);
        }
        if (this.chip8.quirks.Memory) this.r.I += i.x + 1;
        break;
      }

      case "LD Vx, [I]": {
        for (let n = 0; n <= i.x; n++) {
          this.r.Vx[n] = this.chip8.memory.read(this.r.I + n);
        }
        if (this.chip8.quirks.Memory) this.r.I += i.x + 1;
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
        this.r.VF = sum > 0xff ? 1 : 0;
        if (i.x != 0xf) this.r.Vx[i.x] = sum & 0xff;
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
        if (this.chip8.quirks.VF_Reset) this.r.VF = 0;
        this.r.Vx[i.x] &= this.r.Vx[i.y];
        break;
      }

      case "OR Vx, Vy": {
        if (this.chip8.quirks.VF_Reset) this.r.VF = 0;
        this.r.Vx[i.x] |= this.r.Vx[i.y];
        break;
      }

      case "XOR Vx, Vy": {
        if (this.chip8.quirks.VF_Reset) this.r.VF = 0;
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
        this.r.PC = (i.addr + this.r.Vx[i.x]) & 0xfff;
        break;
      }

      case "RND Vx, kk": {
        this.r.Vx[i.x] = randomInt(0, 255) & i.kk;
        break;
      }

      case "SE Vx, kk": {
        if (this.r.Vx[i.x] == i.kk) this.r.PC += 2;
        break;
      }

      case "SNE Vx, kk": {
        if (this.r.Vx[i.x] != i.kk) this.r.PC += 2;
        break;
      }

      case "SE Vx, Vy": {
        if (this.r.Vx[i.x] == this.r.Vx[i.y]) this.r.PC += 2;
        break;
      }

      case "SNE Vx, Vy": {
        if (this.r.Vx[i.x] != this.r.Vx[i.y]) this.r.PC += 2;
        break;
      }

      case "SHL Vx{, Vy}": {
        if (!this.chip8.quirks.Shifting) {
          this.r.Vx[i.x] = this.r.Vx[i.y];
        }
        const VF = (this.r.Vx[i.x] >> 7) & 0x01;
        this.r.Vx[i.x] <<= 1;
        this.r.VF = VF;
        break;
      }

      case "SHR Vx{, Vy}": {
        if (!this.chip8.quirks.Shifting) {
          this.r.Vx[i.x] = this.r.Vx[i.y];
        }
        const VF = this.r.Vx[i.x] & 0x01;
        this.r.Vx[i.x] >>= 1;
        this.r.VF = VF;
        break;
      }

      case "SKNP Vx": {
        if (!this.chip8.input.keys[this.r.Vx[i.x]]) this.r.PC += 2;
        break;
      }

      case "SKP Vx": {
        if (this.chip8.input.keys[this.r.Vx[i.x]]) this.r.PC += 2;
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
        this.chip8.display.pixmap32.fill(0x000000ff);
        break;
      }

      // Cxyn - DRW Vx, Vy, nibble : Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
      case "DRW Vx, Vy, n": {
        this.r.VF = 0;

        let Vx = this.r.Vx[i.x];
        let Vy = this.r.Vx[i.y];

        for (let row = 0; row < i.n; row++) {
          if (
            !this.chip8.quirks.Clipping &&
            Vy + row > this.chip8.display.height
          )
            break;

          let bits = this.chip8.memory.read(this.r.I + row);

          this.r.VF |= this.display.set(
            Vx,
            Vy + row,
            bits,
            8,
            this.chip8.quirks.Clipping
          );
        }

        break;
      }

      // Super Chip-8
      case "SAVE Vx": {
        this.r.save(i.x);
        if (this.r.quir) break;
      }
      case "LOAD Vx": {
        this.r.load(i.x);
        if (this.r.quir) break;
      }

      case "SCD n": {
        this.display.scroll(Direction.Down, i.n, this.chip8.quirks.Clipping);
        break;
      }
      case "SCR": {
        this.display.scroll(
          Direction.Right,
          this.display.width === 128 ? 4 : 2,
          this.chip8.quirks.Clipping
        );
        break;
      }
      case "SCL": {
        this.display.scroll(
          Direction.Left,
          this.display.width === 128 ? 4 : 2,
          this.chip8.quirks.Clipping
        );
        break;
      }

      case "LORES": {
        // Resize display to 64x32
        this.display.resize(64, 32);
        break;
      }

      case "HIRES": {
        // Resize display to 128x64
        this.display.resize(128, 64);
        break;
      }

      case "DRW16 Vx, Vy":
      case "LD HF, Vx": // Set I to 10-byte font sprite for digit Vx

      default:
        throw new Error(`Unimplemented instruction ${formatInst(i)}`);
    }
  }
}
