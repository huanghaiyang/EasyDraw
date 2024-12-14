import { defaults, creatorTypes } from "@/types/constants";
import { addResizeListener } from '@/utils/resize-event';
import CrossSvg from "@/assets/Cross.svg";

export default class StageShield implements IStageShield {
  size: ISize = {
    width: defaults.state.shield.width,
    height: defaults.state.shield.height
  };
  private canvas: HTMLCanvasElement;
  private mCanvas: HTMLCanvasElement;
  private currentCreator: number;
  private renderEl: HTMLDivElement;
  private mousePos: IPoint;

  constructor() {
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

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
    this.mCanvas = document.createElement('canvas');
    this.mCanvas.id = 'm-shield';
    this.mCanvas.style.pointerEvents = 'none';
    this.renderEl.insertBefore(this.mCanvas, this.renderEl.firstChild);

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'shield';
    this.renderEl.insertBefore(this.canvas, this.renderEl.firstChild);
  }

  async initEvents(): Promise<void> {
    Promise.all([
      this.initRenderResizeEvent(),
      this.initMouseEvents()
    ])
  }

  async initRenderResizeEvent(): Promise<void> {
    addResizeListener(this.renderEl, () => {
      this.refreshSize();
    })
  }

  async initMouseEvents(): Promise<void> {
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
  }

  handleMouseMove(e: MouseEvent): void {
    this.calcMousePos(e);
    this.applyMousePos(e);
  }

  calcMousePos(e: MouseEvent): IPoint {
    const { x, y } = this.renderEl.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - x,
      y: e.clientY - y
    }
    return this.mousePos;
  }

  applyMousePos(e: MouseEvent): void {
    this.applyMCanvasMousePos(e)
  }

  applyMCanvasMousePos(e: MouseEvent): void {
    this.renderCreatorIfy(e)
  }

  renderCreatorIfy(e: MouseEvent): void {
    if (this.checkCreatorActive(this.currentCreator)) {
      this.clearMCanvas();
      this.setCanvasCursor('none');
      this.drawSvg(this.mCanvas, this.getCreatorMouseIcon(), {
        x: this.mousePos.x - 15,
        y: this.mousePos.y - 15,
        width: 30,
        height: 30,
        color: '#000'
      })
    }
  }

  refreshSize(): void {
    const { width, height } = this.renderEl.getBoundingClientRect();
    this.size = {
      width: width,
      height: height
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.mCanvas.width = width;
    this.mCanvas.height = height;
  }

  async setCreator(creator: number): Promise<void> {
    this.currentCreator = creator;
  }

  getCreatorMouseIcon(): string {
    switch (this.currentCreator) {
      case creatorTypes.shapes:
        return CrossSvg;
      default:
        return CrossSvg;
    }
  }

  checkCreatorActive(creator: number): boolean {
    if ([creatorTypes.shapes].includes(creator)) {
      return true;
    } else {
      return false;
    }
  }

  clearMCanvas(): void {
    this.mCanvas.getContext('2d').clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);
  }

  setCanvasCursor(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }

  /**
   * 绘制svg
   * 
   * @param target 
   * @param svg 
   * @param options 
   */
  drawSvg(target: HTMLCanvasElement, svg: string, options: { x: number, y: number, width: number, height: number, color: string }): void {
    const ctx = target.getContext('2d');
    const img = new Image();
    img.src = svg;
    img.onload = () => {
      ctx.drawImage(img, options.x, options.y, options.width, options.height);
    }
  }

}