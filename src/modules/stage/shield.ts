import { defaults } from "@/types/constants";
import { addResizeListener } from '@/utils/resize-event';

export default class StageShield implements IStageShield, ICanvas {
  size: ISize = {
    width: defaults.state.shield.width,
    height: defaults.state.shield.height
  };
  position: IPoint;
  canvas: HTMLCanvasElement;

  private renderEl: HTMLDivElement;

  getSize(): ISize {
    return this.size;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  async init(renderEl: HTMLDivElement): Promise<void> {
    this.renderEl = renderEl;
    Promise.all([
      this.initCanvas(),
      this.initEvents()
    ])
  }

  async initCanvas(): Promise<void> {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;
    this.canvas.id = 'shield';

    this.renderEl.appendChild(this.canvas);
  }

  async initEvents(): Promise<void> {
    Promise.all([
      this.initRenderResizeEvent()
    ])
  }

  async initRenderResizeEvent(): Promise<void> {
    addResizeListener(this.renderEl, () => {
      this.refreshPosition();
      this.refreshRenderPosition();
    })
  }

  refreshPosition(): void {
    const { width, height } = this.renderEl.getBoundingClientRect();
    this.position = { x: (width - this.size.width) / 2, y: (height - this.size.height) / 2 }
  }

  refreshRenderPosition(): void {
    this.canvas.style.left = `${this.position.x}px`;
    this.canvas.style.top = `${this.position.y}px`;
  }

}