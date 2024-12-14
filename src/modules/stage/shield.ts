import { defaults } from "@/types/constants";
import { addResizeListener } from '@/utils/resize-event';

export default class StageShield implements IStageShield, ICanvas {
  size: ISize = {
    width: defaults.state.shield.width,
    height: defaults.state.shield.height
  };
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
      this.refreshSize();
    })
  }

  refreshSize(): void {
    const { width, height } = this.renderEl.getBoundingClientRect();
    this.size = {
      width: width,
      height: height
    }
    this.canvas.width = width;
    this.canvas.height = height;
  }

}