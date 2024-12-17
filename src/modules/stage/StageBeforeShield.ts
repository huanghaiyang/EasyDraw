import { ISize, IStageBeforeShield} from "@/types";

export default class StageBeforeShield implements IStageBeforeShield{
  size: ISize;
  canvas: HTMLCanvasElement;

  initCanvas(renderEl: HTMLDivElement, siblingBeforeEl: HTMLElement): void {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'b-shield';
    this.canvas.style.pointerEvents = 'none';
    renderEl.insertBefore(this.canvas, siblingBeforeEl);
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