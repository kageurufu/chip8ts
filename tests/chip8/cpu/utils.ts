import Chip8, { Chip8Dump } from "../../../src/chip8";
import { NullDisplay } from "../../../src/chip8/display";
import { NullSound } from "../../../src/chip8/sound";

export const makeChip8 = (
  opts?: { dump?: Chip8Dump; program?: ArrayLike<number> } = {}
) => {
  const c = new Chip8(new NullDisplay(), new NullSound());

  if (opts.dump) {
    c.restore(opts.dump);
  }

  if (opts.program) {
    c.memory.load(opts.program);
  }

  c.start();
  return c;
};
