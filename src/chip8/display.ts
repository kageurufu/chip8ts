import type Chip8 from "../chip8";

const PIXEL_FLIP_XOR = 0xffffff00;

export enum Direction {
  Left,
  Right,
  Up,
  Down,
}
export type DisplayDump = [number, number, number[]];

export default abstract class Display {
  pixmap: ArrayBuffer;
  pixmap8: Uint8Array;
  pixmap32: Uint32Array;

  black = 0x000000ff;
  white = 0xffffffff;
  colors = [0x000000ff, 0xffffffff];

  width = 64;
  height = 32;

  dirty = false;

  abstract render(): void;

  reset() {
    this.resize(64, 32);
    this.render();
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.pixmap = new ArrayBuffer(this.width * this.height * 4);
    this.pixmap8 = new Uint8Array(this.pixmap);
    this.pixmap32 = new Uint32Array(this.pixmap);
  }

  offset(x: number, y: number) {
    return y * this.width + x;
  }
  tick() {
    this.render();
  }

  set(
    x: number,
    y: number,
    v: number,
    w: number = 8,
    clipping = false
  ): number {
    let clobber = 0;

    for (let col = 0; col < w; col++) {
      if (!clipping && x + col > this.width) break;

      if ((v >> (7 - col)) & 1) {
        clobber |= this.flip((x + col) % this.width, y);
      }
    }

    return clobber & 1;
  }

  flip(x: number, y: number): 0 | 1 {
    const r = this.pixmap32[this.offset(x, y)] > 0xff;
    this.pixmap32[this.offset(x, y)] = this.colors[r ? 0 : 1];
    this.dirty = true;
    return r ? 1 : 0;
  }

  scroll(dir: Direction, dist: number, clipping = false) {
    switch (dir) {
      case Direction.Left:
        for (let row = 0; row < this.height; row++) {
          let offset = this.offset(0, row);
          this.pixmap32.set(
            this.pixmap32.subarray(offset + dist, offset + this.width),
            offset
          );

          this.pixmap32.fill(
            this.black,
            offset + this.width - dist + 1,
            offset + this.width
          );
        }
        return;

      case Direction.Right:
        for (let row = 0; row < this.height; row++) {
          let offset = this.offset(0, row);
          this.pixmap32.set(
            this.pixmap32.subarray(offset, offset + this.width - dist),
            offset + dist
          );
          this.pixmap32.fill(this.black, offset, offset + dist);
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

  dump(): DisplayDump {
    return [
      this.width,
      this.height,
      Array.from(this.pixmap32).map((p) => (p === this.white ? 1 : 0)),
    ];
  }

  restore([w, h, pxl]: DisplayDump) {
    this.resize(w, h);
    this.pixmap32.set(pxl.map((p) => this.colors[p & 1]));
  }

  dump_debug() {
    const res = [];

    for (let i = 0; i < this.height; i++) {
      res.push(
        Array.prototype.slice
          .call(this.pixmap32, i * this.width, (i + 1) * this.width)
          .map((p) => (p > 0xff ? "█" : " "))
          .join("")
      );
    }

    return res;
  }
}

export class NullDisplay extends Display {
  render() {}
}
