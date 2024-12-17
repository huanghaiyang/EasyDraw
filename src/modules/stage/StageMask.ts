import { CreatorCategories, IPoint, ISize, IStageMask, IStageShield } from "@/types";
import { CursorCanvasSize } from "@/types/constants";
import CanvasUtils from "@/utils/CanvasUtils";
import CrossSvg from '@/assets/Cross.svg';

export default class StageMask implements IStageMask {
  canvas: HTMLCanvasElement;
  shield: IStageShield;
  private cursorCacheCanvas: HTMLCanvasElement;

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

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
   * 清除鼠标样式画布
   */
  clearCursorCache(): void {
    if (this.cursorCacheCanvas) {
      this.cursorCacheCanvas.getContext('2d').clearRect(0, 0, this.cursorCacheCanvas.width, this.cursorCacheCanvas.height);
      this.cursorCacheCanvas = null;
    }
  }

  /**
   * 初始化鼠标样式画布
   */
  async initCursorCacheCanvas(): Promise<void> {
    this.cursorCacheCanvas = document.createElement('canvas');
    this.cursorCacheCanvas.width = CursorCanvasSize;
    this.cursorCacheCanvas.height = CursorCanvasSize;
    // 同时绘制图标
    await CanvasUtils.drawImgLike(this.cursorCacheCanvas, this.getCreatorMouseIcon(), {
      x: 0,
      y: 0,
      width: CursorCanvasSize,
      height: CursorCanvasSize,
    })
  }

  /**
   * 鼠标移动时，记录鼠标位置
   * 
   * @param e 
   * @param pos 
   */
  applyCursorMove(e: MouseEvent, pos: IPoint) {
    this.renderCursor(e);
  }

  /**
   * 渲染鼠标样式
   * 
   * @param e 
   */
  async renderCursor(e: MouseEvent): Promise<void> {
    // 检测当前创作工具是否可用
    if (this.shield.checkCreatorActive(this.shield.currentCreator)) {
      // 清除画布
      this.clearCanvas();
      if (this.cursorCacheCanvas) {
        await CanvasUtils.drawImgLike(this.canvas, this.cursorCacheCanvas, {
          x: this.shield.cursorPos.x - CursorCanvasSize / 2,
          y: this.shield.cursorPos.y - CursorCanvasSize / 2,
          width: CursorCanvasSize,
          height: CursorCanvasSize,
        })
      } else {
        await this.initCursorCacheCanvas();
      }
    }
  }

  /**
   * 获取当前创作工具的鼠标图标
   */
  getCreatorMouseIcon(): string {
    switch (this.shield.currentCreator.category) {
      case CreatorCategories.shapes:
        return CrossSvg;
      default:
        return CrossSvg;
    }
  }
}