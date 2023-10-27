/// <reference lib="dom" />

import Sound from "../src/chip8/sound";

export default class BrowserAudio extends Sound {
  context?: AudioContext;
  oscillator?: OscillatorNode;
  gain?: GainNode;

  init() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (!this.gain) {
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.25;
      this.gain.connect(this.context.destination);
    }
  }

  play() {
    if (this.oscillator) return;
    this.init();

    this.oscillator = this.context!.createOscillator();
    // this.oscillator.type = 'sine'
    this.oscillator.type = "square";
    this.oscillator.frequency.value = 300;
    this.oscillator.connect(this.gain!);

    this.oscillator.start(this.context!.currentTime);
  }

  pause() {
    if (!this.oscillator) return;

    this.oscillator.stop();
    this.oscillator = undefined;
  }
}
