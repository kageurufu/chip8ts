import type CPU from "./cpu";
import type Sound from "./sound";
import type Registers from "./registers";

export default class Timer<
  C extends { r: Registers } = CPU,
  S extends { start(): void; stop(): void } = Sound,
> {
  cpu: C;
  sound: S;

  constructor(cpu: C, sound: S) {
    this.cpu = cpu;
    this.sound = sound;
  }

  reset() {}

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
