import { ISize, IStageElement, IStageProvisional, IStageShield } from "@/types";

export default class StageProvisional implements IStageProvisional {
  canvas: HTMLCanvasElement;
  shield: IStageShield;

  constructor(shield: IStageShield) {
    this.shield = shield;
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