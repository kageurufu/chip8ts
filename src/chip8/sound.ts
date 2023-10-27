import type Chip8 from "../chip8";
import CPU from "./cpu";

export default abstract class Sound {
  playing: boolean = false;

  constructor() {
    this.reset();
  }

  reset() {}

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

  abstract play(): void;
  abstract pause(): void;
}

export class NullSound extends Sound {
  play() {}
  pause() {}
}
