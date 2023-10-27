/// <reference lib="dom" />

import Display from "../src/chip8/display";

export default class CanvasDisplay extends Display {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  renderCanvas: OffscreenCanvas;
  renderContext: any;
  imageData: any;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;

    this.context.imageSmoothingEnabled = false;
  }

  resize(w: number, h: number): void {
    Display.prototype.resize.call(this, w, h);

    this.renderCanvas = new OffscreenCanvas(w, h);
    this.renderContext = this.renderCanvas.getContext("2d");
    this.imageData = this.renderContext.createImageData(w, h);
  }

  render(): void {
    this.imageData.data.set(this.pixmap8);

    this.renderContext.putImageData(this.imageData, 0, 0);

    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      this.renderCanvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
  }
}
