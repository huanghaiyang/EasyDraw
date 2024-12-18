import { IRenderQueue, IRenderTaskCargo, ISize, IStageMask, IStageShield } from "@/types";
import RenderQueue from "@/modules/render/RenderQueue";

export default class StageMask implements IStageMask {
  canvas: HTMLCanvasElement;
  shield: IStageShield;
  private renderQueue: IRenderQueue;

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.renderQueue = new RenderQueue();
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
   * 执行渲染任务
   * 
   * @param cargo 
   */
  async renderCargo(cargo: IRenderTaskCargo): Promise<void> {
    await this.renderQueue.add(cargo);
  }
}