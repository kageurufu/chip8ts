/// <reference lib="dom" />

import Chip8, { QuirkModes } from "../src/chip8";
import Programs from "../roms";
import { decodeProgram } from "../roms/utils";
import CanvasDisplay from "./CanvasDisplay";
import BrowserAudio from "./BrowserAudio";

const canvas: HTMLCanvasElement = document.getElementById(
  "chip8--canvas"
) as HTMLCanvasElement;
const debug: HTMLPreElement = document.getElementById(
  "chip8--debug"
) as HTMLPreElement;

const chip8 = new Chip8(new CanvasDisplay(canvas), new BrowserAudio());

function tick() {
  let chip8_clock = 500.0; // Hz
  let framerate = 60; // Hz

  chip8.tick(STEPPING ? 1 : chip8_clock / framerate);
  debug.innerText = `PC: $${chip8.cpu.r.PC.toString(
    16
  )} I: $${chip8.cpu.r.I.toString(16)} Vx: $${chip8.cpu.r.Vx} DT: $${
    chip8.cpu.r.DT
  } ST: $${chip8.cpu.r.ST}`;
}

function run() {
  chip8.start();

  setTimeout(function frameCallback() {
    tick();

    if (chip8.running && !STEPPING) {
      setTimeout(frameCallback, 1000 / 60);
    }
  }, 1000 / 60);
}

{
  const quirksMode = document.getElementById("quirksMode") as HTMLSelectElement;
  function selectQuirks() {
    chip8.quirks = QuirkModes[quirksMode.value];
  }
  quirksMode.addEventListener("change", selectQuirks);
  selectQuirks();
}

{
  const program_select = document.getElementById(
    "chip8--selector"
  ) as HTMLSelectElement;

  Object.entries(Programs)
    .sort(([ak, av], [bk, bv]) => (ak > bk ? 1 : -1))
    .forEach(([filename, program_data]) => {
      const opt = document.createElement("option");
      opt.value = filename;
      opt.textContent = program_data.filename.slice(2).split("/").join(" :: ");
      program_select.options.add(opt);
    });

  function loadProgram() {
    window.location.hash = program_select.value;
    chip8.running = false;
    chip8.reset();
    chip8.load(
      decodeProgram(Programs[program_select.value as keyof Programs].program)
    );
    run();
  }
  program_select.addEventListener("change", loadProgram);

  if (window.location.hash) {
    const opt = Array.prototype.find.call(
      program_select.options,
      (opt) => opt.value == window.location.hash.substring(1)
    );
    if (opt) {
      opt.selected = true;
      loadProgram();
    }
  }
}

let STEPPING = false;
{
  const keymap: Record<string, number> = {
    "1": 0x1,
    "2": 0x2,
    "3": 0x3,
    "4": 0xc,
    q: 0x4,
    w: 0x5,
    e: 0x6,
    r: 0xd,
    a: 0x7,
    s: 0x8,
    d: 0x9,
    f: 0xe,
    z: 0xa,
    x: 0x0,
    c: 0xb,
    v: 0xf,
  };

  window.addEventListener("keydown", (ev) => {
    let key;
    if ((key = keymap[ev.key]) != undefined) {
      chip8.input.press(key);
    }
    if (ev.key == "t") {
      chip8.cpu.reset();
      chip8.display.reset();
      chip8.display.render();
      chip8.start();
      if (!STEPPING) {
        run();
      }
    }
    if (ev.key == "j") {
      STEPPING = true;
      tick();
    }
    if (ev.key == "k") {
      STEPPING = false;
      if (chip8.running) {
        run();
      }
    }
  });

  window.addEventListener("keyup", (ev) => {
    let key;
    if ((key = keymap[ev.key]) != undefined) {
      chip8.input.release(key);
    }
  });
}
