import { defaults, cursorCanvasSize, Creator, CreatorCategories } from "@/types/constants";
import { addResizeListener } from '@/utils/resize-event';
import CrossSvg from "@/assets/Cross.svg";

export default class StageShield implements IStageShield {
  size: ISize = {
    width: defaults.state.shield.width,
    height: defaults.state.shield.height
  };
  // 画布在世界中的坐标,画布始终是居中的,所以坐标都是相对于画布中心点的,当画布尺寸发生变化时,需要重新计算
  position: IPoint;
  // 画布
  private canvas: HTMLCanvasElement;
  // 遮罩画布用以绘制鼠标样式,工具图标等
  private mCanvas: HTMLCanvasElement;
  // 当前正在使用的创作工具
  private currentCreator: Creator;
  // canvas渲染容器
  private renderEl: HTMLDivElement;
  // 鼠标位置
  private mousePos: IPoint;
  // 鼠标样式画布,用以加速绘制
  private cursorCanvasCache: HTMLCanvasElement;
  // 画布容器尺寸
  private canvasRectCache: DOMRect;

  constructor() {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  // 销毁鼠标样式画布
  destroyCursorCanvasCache(): void {
    this.cursorCanvasCache = null;
  }

  // 清除鼠标样式画布
  clearCursorCanvasCache(): void {
    this.cursorCanvasCache.getContext('2d').clearRect(0, 0, this.cursorCanvasCache.width, this.cursorCanvasCache.height);
  }

  /**
   * 初始化
   * 
   * @param renderEl 
   */
  async init(renderEl: HTMLDivElement): Promise<void> {
    this.renderEl = renderEl;
    Promise.all([
      this.initCanvas(),
      this.initEvents()
    ])
  }

  /**
   * 初始化画布
   */
  async initCanvas(): Promise<void> {
    this.mCanvas = document.createElement('canvas');
    this.mCanvas.id = 'm-shield';
    this.mCanvas.style.pointerEvents = 'none';
    this.renderEl.insertBefore(this.mCanvas, this.renderEl.firstChild);

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'shield';
    this.renderEl.insertBefore(this.canvas, this.renderEl.firstChild);
  }

  /**
   * 初始化事件
   */
  async initEvents(): Promise<void> {
    Promise.all([
      this.initRenderResizeEvent(),
      this.initMouseEvents()
    ])
  }

  /**
   * 初始化鼠标样式画布
   */
  async initCanvasCaches(): Promise<void> {
    this.cursorCanvasCache = document.createElement('canvas');
    this.cursorCanvasCache.width = cursorCanvasSize;
    this.cursorCanvasCache.height = cursorCanvasSize;
    // 同时绘制图标
    await this.drawImgLike(this.cursorCanvasCache, this.getCreatorMouseIcon(), {
      x: 0,
      y: 0,
      width: cursorCanvasSize,
      height: cursorCanvasSize,
    })
  }

  /**
   * 初始化画布容器尺寸变更监听
   */
  async initRenderResizeEvent(): Promise<void> {
    addResizeListener(this.renderEl, () => {
      this.refreshSize();
    })
  }

  /**
   * 初始化鼠标事件
   */
  async initMouseEvents(): Promise<void> {
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave)
  }

  /**
   * 鼠标移动事件
   * 
   * @param e 
   */
  handleMouseMove(e: MouseEvent): void {
    this.calcMousePos(e);
    this.applyMousePosMove(e);
  }

  /**
   * 鼠标离开画布事件
   * 
   * @param e 
   */
  handleMouseLeave(e: MouseEvent): void {
    this.clearMousePos();
    this.applyMousePosLeave(e)
  }

  /**
   * 计算鼠标位置
   * 
   * @param e 
   */
  calcMousePos(e: MouseEvent): IPoint {
    const { x, y } = this.canvasRectCache;
    this.mousePos = {
      x: e.clientX - x,
      y: e.clientY - y
    }
    return this.mousePos;
  }

  /**
   * 清除鼠标位置
   */
  clearMousePos(): void {
    this.mousePos = null;
  }

  /**
   * 鼠标移动事件
   * 
   * @param e 
   */
  async applyMousePosMove(e: MouseEvent): Promise<void> {
    this.applyMCanvasMousePosMove(e)
  }

  /**
   * 鼠标离开画布事件
   * 
   * @param e 
   */
  applyMousePosLeave(e: MouseEvent): void {
    this.clearMCanvas();
    this.setCanvasCursor('default');
    this.destroyCursorCanvasCache();
  }

  /**
   * 渲染鼠标样式
   * 
   * @param e 
   */
  async applyMCanvasMousePosMove(e: MouseEvent): Promise<void> {
    this.renderMCreatorIfy(e)
  }

  /**
   * 渲染鼠标样式
   * 
   * @param e 
   */
  async renderMCreatorIfy(e: MouseEvent): Promise<void> {
    // 检测当前创作工具是否可用
    if (this.checkCreatorActive(this.currentCreator)) {
      // 清除画布
      this.clearMCanvas();
      await this.setCanvasCursor('none');
      if (this.cursorCanvasCache) {
        await this.drawImgLike(this.mCanvas, this.cursorCanvasCache, {
          x: this.mousePos.x - cursorCanvasSize / 2,
          y: this.mousePos.y - cursorCanvasSize / 2,
          width: cursorCanvasSize,
          height: cursorCanvasSize,
        })
      } else {
        await this.initCanvasCaches();
      }
    } else {
      this.applyMousePosLeave(e);
    }
  }

  /**
   * 刷新画布尺寸
   */
  refreshSize(): void {
    const rect = this.renderEl.getBoundingClientRect();
    const { width, height } = rect;
    this.size = {
      width: width,
      height: height
    }
    this.position = {
      x: -width / 2,
      y: -height / 2
    }
    this.canvasRectCache = rect;
    this.canvas.width = width;
    this.canvas.height = height;
    this.mCanvas.width = width;
    this.mCanvas.height = height;
  }

  /**
   * 设置当前创作工具
   * 
   * @param creator 
   */
  async setCreator(creator: Creator): Promise<void> {
    this.currentCreator = creator;
  }

  /**
   * 获取当前创作工具的鼠标图标
   */
  getCreatorMouseIcon(): string {
    switch (this.currentCreator.category) {
      case CreatorCategories.shapes:
        return CrossSvg;
      default:
        return CrossSvg;
    }
  }

  /**
   * 检查创作工具是否可用
   * 
   * @param creator 
   */
  checkCreatorActive(creator: Creator): boolean {
    if (!creator) return false;
    if ([CreatorCategories.shapes].includes(creator.category)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 清除遮罩画布内容
   */
  clearMCanvas(): void {
    this.mCanvas.getContext('2d').clearRect(0, 0, this.mCanvas.width, this.mCanvas.height);
  }

  /**
   * 设置画布鼠标样式
   * 
   * @param cursor 
   */
  async setCanvasCursor(cursor: string): Promise<void> {
    this.canvas.style.cursor = cursor;
  }

  /**
   * 绘制svg
   * 
   * @param target 
   * @param svg 
   * @param options 
   */
  async drawImgLike(target: HTMLCanvasElement, svg: string | HTMLCanvasElement, options: { x: number, y: number, width: number, height: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      const ctx = target.getContext('2d');
      if (typeof svg === 'string') {
        const img = new Image();
        img.src = svg;
        img.onload = () => {
          ctx.drawImage(img, options.x, options.y, options.width, options.height);
          resolve();
        }
        img.onerror = () => {
          reject();
        }
      } else if (svg instanceof HTMLCanvasElement) {
        ctx.drawImage(svg, options.x, options.y, options.width, options.height);
        resolve();
      }
    })
  }

}