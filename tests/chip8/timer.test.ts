import { beforeAll, describe, test, it, expect } from "bun:test";
import Registers from "../../src/chip8/registers";
import Timer from "../../src/chip8/timer";
import { NullSound } from "../../src/chip8/sound";

describe("Timer should manage DT and ST registers", () => {
  const makeTimer = () => new Timer({ r: new Registers() }, new NullSound());

  test("Timer should not decrement 0 registers", () => {
    const timer = makeTimer();

    expect(timer.cpu.r.DT).toBe(0);
    expect(timer.cpu.r.ST).toBe(0);

    timer.tick();

    expect(timer.cpu.r.DT).toBe(0);
    expect(timer.cpu.r.ST).toBe(0);
  });

  test("Timer should decrement registers until 0", () => {
    const timer = makeTimer();

    timer.cpu.r.DT = 2;
    timer.cpu.r.ST = 3;

    expect(timer.cpu.r.DT).toBe(2);
    expect(timer.cpu.r.ST).toBe(3);

    timer.tick();

    expect(timer.cpu.r.DT).toBe(1);
    expect(timer.cpu.r.ST).toBe(2);

    timer.tick();

    expect(timer.cpu.r.DT).toBe(0);
    expect(timer.cpu.r.ST).toBe(1);

    timer.tick();

    expect(timer.cpu.r.DT).toBe(0);
    expect(timer.cpu.r.ST).toBe(0);
  });

  test("Timer should manage sound", () => {
    const timer = makeTimer();

    expect(timer.cpu.r.ST).toBe(0);
    expect(timer.sound.playing).toBe(false);

    timer.tick();
    expect(timer.cpu.r.ST).toBe(0);
    expect(timer.sound.playing).toBe(false);

    timer.cpu.r.ST = 5;
    expect(timer.cpu.r.ST).toBe(5);
    expect(timer.sound.playing).toBe(false);

    timer.tick();
    expect(timer.cpu.r.ST).toBe(4);
    expect(timer.sound.playing).toBe(true);

    timer.tick();
    expect(timer.cpu.r.ST).toBe(3);
    expect(timer.sound.playing).toBe(true);

    timer.tick();
    expect(timer.cpu.r.ST).toBe(2);
    expect(timer.sound.playing).toBe(true);

    timer.tick();
    expect(timer.cpu.r.ST).toBe(1);
    expect(timer.sound.playing).toBe(true);

    timer.tick();
    expect(timer.cpu.r.ST).toBe(0);
    expect(timer.sound.playing).toBe(false);

    timer.tick();
    expect(timer.cpu.r.ST).toBe(0);
    expect(timer.sound.playing).toBe(false);
  });
});
