import { describe, expect, test } from "bun:test";
import Chip8, { QuirkModes } from "../../src/chip8";

import { readFile } from "fs/promises";
import { NullDisplay } from "../../src/chip8/display";
import { NullSound } from "../../src/chip8/sound";
import { makeChip8 } from "./cpu/utils";

describe("CHIP-8 Test Roms", () => {
  const ROMS = ["1-chip8-logo", "2-ibm-logo", "3-corax+", "4-flags"];

  ROMS.forEach((rom) => {
    test(`${rom}.ch8`, async () => {
      const chip8 = new Chip8(new NullDisplay(), new NullSound());

      const program = await readFile(`roms/1-tests/${rom}.ch8`);
      const expected_results = await readFile(
        `roms/1-tests/${rom}.txt`,
        "utf-8"
      );

      chip8.load(program);
      chip8.start();

      while (chip8.running) {
        chip8.tick(1000 / 60);
      }

      expect(chip8.display.dump_debug()).toEqual(expected_results.split("\n"));
    });
  });
});

test("Chip8 state can be saved/restored", async () => {
  const c1 = makeChip8();
  const c2 = makeChip8();

  const expected_results = await readFile(
    "roms/1-tests/1-chip8-logo.txt",
    "utf-8"
  );

  c1.load(await readFile("roms/1-tests/1-chip8-logo.ch8"));
  c1.start();
  c1.tick(5);

  c2.restore(c1.save());
  while (c1.running) {
    c1.tick(1000 / 60);
  }

  c2.start();
  while (c2.running) {
    c2.tick(1000 / 60);
  }

  expect(c1.display.dump_debug()).toEqual(expected_results.split("\n"));
  expect(c2.display.dump_debug()).toEqual(expected_results.split("\n"));
});
