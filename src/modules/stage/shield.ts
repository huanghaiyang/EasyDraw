import { defaults } from "@/types/constants";

export default class StageShield implements IStageShield, ICanvas {
  size: ISize =  {
    width: defaults.state.shield.width,
    height: defaults.state.shield.height
  };
  position: IPoint;
  canvas: HTMLCanvasElement;

  getSize(): ISize {
    return this.size;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  async init(): Promise<void> {
    Promise.all([
      this.initCanvas()
    ])
  }

  async initCanvas(): Promise<void> {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;
  }
  
}