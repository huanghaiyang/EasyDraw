import { IPoint, ISize, IStageMask } from "@/types";

export default class StageMask implements IStageMask {
  position?: IPoint;
  size: ISize;
  canvas: HTMLCanvasElement;

  /**
   * 初始化画布
   */
  initCanvas(renderEl: HTMLDivElement): void {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'm-shield';
    this.canvas.style.pointerEvents = 'none';
    renderEl.insertBefore(this.canvas, renderEl.firstChild);
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
}