import { IRenderQueue, ISize, IStageElement, IStageProvisional, IStageShield } from "@/types";
import RenderQueue from "@/modules/render/RenderQueue";

export default class StageProvisional implements IStageProvisional {
  canvas: HTMLCanvasElement;
  shield: IStageShield;
  private renderQueue: IRenderQueue;

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.renderQueue = new RenderQueue();
  }

  /**
   * 画板初始化
   */
  initCanvas(): HTMLCanvasElement {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'b-shield';
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
   * 渲染组件元素
   * 
   * @param e 
   * @param element
   */
  renderElement(e: MouseEvent, element: IStageElement): void {
    if (element) {
      this.clearCanvas();
      element.render(this.canvas);
    }
  }
}