import { ISize, IStageDrawer, IStageRenderer, IStageShield } from "@/types";

export default class StageDrawerBase implements IStageDrawer {
  canvas: HTMLCanvasElement;
  shield: IStageShield;
  renderer: IStageRenderer;

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 初始化画布
   * 
   * @returns 
   */
  initCanvas(): HTMLCanvasElement {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'm-shield';
    this.canvas.style.pointerEvents = 'none';
    return this.canvas;
  }

  /**
   * 设置画布大小
   * 
   * @param size 
   */
  updateCanvasSize(size: ISize): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  /**
   * 画布清空
   */
  clearCanvas(): void {
    this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 重绘
   */
  redraw(): void {
    this.renderer.redraw();
  }
}