import { describe, expect, test } from "bun:test";
import { Direction, NullDisplay } from "../../src/chip8/display";

describe("Scrolling", () => {
  const makeDisplay = () => {
    const d = new NullDisplay();

    d.resize(5, 5);
    d.set(1, 1, 0b11100000, 3);
    d.set(1, 2, 0b11100000, 3);
    d.set(1, 3, 0b11100000, 3);
    d.tick();

    expect(d.dump_debug()).toEqual([
      "     ",
      " ███ ",
      " ███ ",
      " ███ ",
      "     ",
    ]);

    return d;
  };

  test("Scroll left", () => {
    const d = makeDisplay();

    d.scroll(Direction.Left, 1);

    expect(d.dump_debug()).toEqual([
      "     ",
      "███  ",
      "███  ",
      "███  ",
      "     ",
    ]);
  });

  test("Scroll right", () => {
    const d = makeDisplay();

    d.scroll(Direction.Right, 1);

    expect(d.dump_debug()).toEqual([
      "     ",
      "  ███",
      "  ███",
      "  ███",
      "     ",
    ]);
  });

  test("Scroll up", () => {
    const d = makeDisplay();

    d.scroll(Direction.Up, 1);

    expect(d.dump_debug()).toEqual([
      " ███ ",
      " ███ ",
      " ███ ",
      "     ",
      "     ",
    ]);
  });

  test("Scroll down", () => {
    const d = makeDisplay();

    d.scroll(Direction.Down, 1);

    expect(d.dump_debug()).toEqual([
      "     ",
      "     ",
      " ███ ",
      " ███ ",
      " ███ ",
    ]);
  });
});
