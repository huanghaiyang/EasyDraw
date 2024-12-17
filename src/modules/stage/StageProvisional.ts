import { ISize, IStageElement, IStageProvisional } from "@/types";

export default class StageProvisional implements IStageProvisional {
  size: ISize;
  canvas: HTMLCanvasElement;

  /**
   * 画板初始化
   * 
   * @param renderEl 
   * @param siblingBeforeEl 
   */
  initCanvas(renderEl: HTMLDivElement, siblingBeforeEl?: HTMLElement): void {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'b-shield';
    this.canvas.style.pointerEvents = 'none';
    renderEl.insertBefore(this.canvas, siblingBeforeEl || renderEl.firstElementChild);
  }

  /**
   * 设置画布大小
   * 
   * @param size 
   */
  setSize(size: ISize): void {
    this.size = size;
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  /**
   * 画布清空
   */
  clearCanvas(): void {
    this.canvas.getContext('2d')?.clearRect(0, 0, this.size.width, this.size.height);
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