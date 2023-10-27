import type Chip8 from "../chip8";
import ROM from "./rom";

export type MemoryDump = number[];

export default class Memory {
  buffer: ArrayBuffer;
  mem8: Uint8Array;

  constructor() {
    this.buffer = new ArrayBuffer(0x1000);

    this.mem8 = new Uint8Array(this.buffer);
  }

  reset() {
    this.mem8.fill(0);
    this.mem8.set(ROM, 0);
  }
  load(program: ArrayLike<number>) {
    this.mem8.set(program, 0x200);
  }

  tick() {}

  read(addr: number): number {
    return this.mem8[addr & 0xfff];
  }
  
  write(addr: number, byte: number) {
    this.mem8[addr & 0xfff] = byte & 0xff;
  }

  dump(): MemoryDump {
    return Array.from(this.mem8);
  }

  restore(save: MemoryDump) {
    this.mem8.set(save);
  }
}
