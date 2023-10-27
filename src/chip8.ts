import CPU, { CPUDump } from "./chip8/cpu";
import Display, { DisplayDump } from "./chip8/display";
import Input from "./chip8/input";
import Memory, { MemoryDump } from "./chip8/memory";
import Sound from "./chip8/sound";
import Timer from "./chip8/timer";

export type Chip8Dump = {
  cpu: CPUDump;
  display: DisplayDump;
  memory: MemoryDump;
};

export interface Quirks {
  VF_Reset?: boolean;
  Memory?: boolean;
  Display_Wait?: boolean;
  Clipping?: boolean;
  Shifting?: boolean;
  Jumping?: boolean;
}

export const QuirkModes: { [key: string]: Quirks } = {
  Chip8: { VF_Reset: true, Memory: true, Display_Wait: true, Clipping: true },
  SuperChip: { Clipping: true, Shifting: true, Jumping: true },
  XOChip: { Memory: true, Clipping: true },
};

export default class Chip8 {
  cpu: CPU;
  memory: Memory;
  timer: Timer<CPU, Sound>;
  sound: Sound;
  1;
  display: Display;
  input: Input;

  quirks: Quirks = {};
  running: boolean = false;

  constructor(display: Display, sound: Sound) {
    this.quirks = QuirkModes.SuperChip;

    this.display = display;
    this.sound = sound;

    this.memory = new Memory();
    this.input = new Input();
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

  load(program: ArrayLike<number>) {
    this.memory.load(program);
  }

  start() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }

  tick(steps: number = 500 / 60) {
    for (var i = 0; i < steps; i++) {
      const { op } = this.cpu.tick();

      if (op == "DRW Vx, Vy, n" && this.quirks.Display_Wait) {
        break;
      }
    }

    this.display.tick();
    this.timer.tick();
    this.input.tick();
  }

  save(): Chip8Dump {
    return {
      cpu: this.cpu.dump(),
      display: this.display.dump(),
      memory: this.memory.dump(),
    };
  }
  
  restore({ cpu, display, memory }: Chip8Dump) {
    this.cpu.restore(cpu);
    this.display.restore(display);
    this.memory.restore(memory);
  }
}
