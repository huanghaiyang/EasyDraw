import { defaults, cursorCanvasSize, minCursorMoveXDistance, minCursorMoveYDistance } from "@/types/constants";
import { addResizeListener } from '@/utils/resize-event';
import CrossSvg from "@/assets/Cross.svg";
import { Creator, CreatorCategories, ElementObject, IPoint, ISize, IStageElement, IStageEngine, IStageShield } from "@/types";
import StageEngine from "@/modules/stage/StageEngine";

export default class StageShield implements IStageShield {
  size: ISize = {
    width: defaults.state.shield.width,
    height: defaults.state.shield.height
  };
  // 画布在世界中的坐标,画布始终是居中的,所以坐标都是相对于画布中心点的,当画布尺寸发生变化时,需要重新计算
  private worldCenterOffset: IPoint = {
    x: 0,
    y: 0
  };
  // 画布
  private canvas: HTMLCanvasElement;
  // 遮罩画布用以绘制鼠标样式,工具图标等
  private mCanvas: HTMLCanvasElement;
  // 当前正在使用的创作工具
  private currentCreator: Creator;
  // canvas渲染容器
  private renderEl: HTMLDivElement;
  // 鼠标位置
  private cursorPos: IPoint;
  // 鼠标样式画布,用以加速绘制
  private cursorCanvasCache: HTMLCanvasElement;
  // 画布容器尺寸
  private canvasRectCache: DOMRect;
  // 画布是否是第一次渲染
  private isFirstResizeRender: boolean = true;
  // 鼠标按下位置
  private pressDownPosition: IPoint;
  // 鼠标按下时距离世界坐标中心点的偏移
  private pressDownWorldCenterOffset: IPoint;
  // 鼠标抬起位置
  private pressUpPosition: IPoint;
  // 鼠标抬起时距离世界坐标中心点的偏移
  private pressUpWorldCenterOffset: IPoint;
  // 绘制引擎
  private stageEngine: IStageEngine;
  // 当前正在创建的元素
  private currentCreatingElementId;

  constructor() {
    this.stageEngine = new StageEngine(this);
    this.initEventHandlers();
  }

  /**
   * 初始化事件处理器
   */
  initEventHandlers() {
    this.handleCursorMove = this.handleCursorMove.bind(this);
    this.handleCursorLeave = this.handleCursorLeave.bind(this);
    this.handlePressDown = this.handlePressDown.bind(this);
    this.handlePressUp = this.handlePressUp.bind(this);
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
    this.canvas.addEventListener('mousemove', this.handleCursorMove)
    this.canvas.addEventListener('mouseleave', this.handleCursorLeave)
    this.canvas.addEventListener('mousedown', this.handlePressDown)
  }

  /**
   * 鼠标移动事件
   * 
   * @param e 
   */
  handleCursorMove(e: MouseEvent): void {
    this.calcCursorPos(e);
    this.applyCursorPosMove(e);
  }

  /**
   * 鼠标离开画布事件
   * 
   * @param e 
   */
  handleCursorLeave(e: MouseEvent): void {
    this.clearCursorPos();
    this.applyCursorPosLeave(e)
  }

  /**
   * 鼠标按下事件
   * 
   * @param e 
   */
  handlePressDown(e: MouseEvent): void {
    this.calcPressDown(e);
    this.initPressDownEvent();
  }

  /**
   * 鼠标抬起事件
   * 
   * @param e 
   */
  handlePressUp(e: MouseEvent): void {
    this.calcPressUp(e);
    this.applyPressUp(e);
  }

  /**
   * 初始化鼠标按下事件
   */
  initPressDownEvent(): void {
    this.canvas.addEventListener('mouseup', this.handlePressUp)
  }

  /**
   * 计算鼠标位置
   * 
   * @param e 
   */
  calcCursorPos(e: MouseEvent): IPoint {
    const { x, y } = this.canvasRectCache;
    this.cursorPos = {
      x: e.clientX - x,
      y: e.clientY - y
    }
    return this.cursorPos;
  }

  /**
   * 清除鼠标位置
   */
  clearCursorPos(): void {
    this.cursorPos = null;
  }

  /**
   * 鼠标移动事件
   * 
   * @param e 
   */
  async applyCursorPosMove(e: MouseEvent): Promise<void> {
    this.applyMCanvasCursorPosMove(e)
  }

  /**
   * 鼠标离开画布事件
   * 
   * @param e 
   */
  applyCursorPosLeave(e: MouseEvent): void {
    this.clearMCanvas();
    this.setCanvasCursor('default');
    this.destroyCursorCanvasCache();
  }

  /**
   * 鼠标按下事件
   * 
   * @param e 
   */
  calcPressDown(e: MouseEvent): void {
    this.pressDownPosition = this.calcCursorPos(e);
    this.pressDownWorldCenterOffset = this.calcOffsetByPos(this.pressDownPosition);
  }

  /**
   * 鼠标抬起事件
   * 
   * @param e 
   */
  calcPressUp(e: MouseEvent): void {
    this.pressUpPosition = this.calcCursorPos(e);
    this.pressUpWorldCenterOffset = this.calcOffsetByPos(this.pressUpPosition);
  }

  /**
   * 处理鼠标抬起逻辑（正常抬起、拖动抬起、绘制完成抬起等）
   * 
   * @param e 
   */
  applyPressUp(e) {
    if (this.checkCreatorActive(this.currentCreator)) {
      if (this.checkCursorPressMovedAvailable(e)) {
        this.createElementTemporary();
      } else {
        this.createElementAtPosition();
      }
    }
  }

  /**
   * 检查鼠标是否移动过短（移动距离过短，可能为误触）
   * 
   * @param e 
   * @returns 
   */
  checkCursorPressMovedAvailable(e: MouseEvent): boolean {
    return Math.abs(this.pressUpWorldCenterOffset.x - this.pressDownWorldCenterOffset.x) < minCursorMoveXDistance
      || Math.abs(this.pressUpWorldCenterOffset.y - this.pressDownWorldCenterOffset.y) < minCursorMoveYDistance;
  }

  /**
   * 在当前鼠标位置创建元素
   */
  createElementAtPosition(): void {
    
  }

  /**
   * 在当前鼠标位置创建临时元素
   */
  createElementTemporary(): void {
    const { category, type } = this.currentCreator;
    switch(category) {
      case CreatorCategories.shapes: {
        const obj = this.stageEngine.createObject(type, [this.pressDownWorldCenterOffset, this.pressUpWorldCenterOffset])
        if (this.currentCreatingElementId) {
          this.stageEngine.updateElement(this.currentCreatingElementId, obj);
        } else {
          const element = this.stageEngine.createElement(obj);
          this.stageEngine.addElement(element);
          this.currentCreatingElementId = element.id;
        }
        break;
      }
      default: 
        break;
    }
  }

  /**
   * 渲染鼠标样式
   * 
   * @param e 
   */
  async applyMCanvasCursorPosMove(e: MouseEvent): Promise<void> {
    this.renderMCreatorIfy(e)
  }

  /**
   * 给定坐标计算距离世界坐标中心点的偏移
   * 
   * @param pos 
   */
  calcOffsetByPos(pos: IPoint): IPoint {
    return {
      x: pos.x - this.canvasRectCache.width / 2 + this.worldCenterOffset.x,
      y: pos.y - this.canvasRectCache.height / 2 + this.worldCenterOffset.y
    }
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
          x: this.cursorPos.x - cursorCanvasSize / 2,
          y: this.cursorPos.y - cursorCanvasSize / 2,
          width: cursorCanvasSize,
          height: cursorCanvasSize,
        })
      } else {
        await this.initCanvasCaches();
      }
    } else {
      this.applyCursorPosLeave(e);
    }
  }

  /**
   * 刷新画布尺寸
   */
  refreshSize(): void {
    const rect = this.renderEl.getBoundingClientRect();
    const { width, height } = rect;

    this.canvasRectCache = rect;
    this.canvas.width = width;
    this.canvas.height = height;
    this.mCanvas.width = width;
    this.mCanvas.height = height;

    this.size = {
      width,
      height
    }
    if (this.isFirstResizeRender) {
      this.isFirstResizeRender = false;
    }
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
    return [CreatorCategories.shapes].includes(creator.category);
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