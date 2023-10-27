import type Chip8 from "../chip8";

export default class Input {
  keys: boolean[];
  released: boolean[];

  constructor() {
    this.keys = new Array(16).fill(false);
    this.released = new Array(16).fill(false);
  }

  tick() {
    for (let i = 0; i < 16; i++) {
      if (this.released[i]) {
        this.keys[i] = false;
        this.released[i] = false;
      }
    }
  }

  press(k: number) {
    this.keys[k] = true;
  }
  
  release(k: number) {
    this.released[k] = true;
  }
}
