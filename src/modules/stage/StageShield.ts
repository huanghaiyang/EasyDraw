import { defaults, minCursorMoveXDistance, minCursorMoveYDistance } from "@/types/constants";
import { addResizeListener } from '@/utils/resize-event';
import { Creator, CreatorCategories, IPoint, ISize, IStageProvisional, IStageMask, IStageStore, IStageShield } from "@/types";
import StageStore from "@/modules/stage/StageStore";
import StageMask from "@/modules/stage/StageMask";
import StageProvisional from "@/modules/stage/StageProvisional";

export default class StageShield implements IStageShield {
  // 舞台尺寸
  size: ISize = {
    width: defaults.state.shield.width,
    height: defaults.state.shield.height
  };
  // 鼠标位置
  cursorPos: IPoint;
  // 当前正在使用的创作工具
  currentCreator: Creator;

  // 画布在世界中的坐标,画布始终是居中的,所以坐标都是相对于画布中心点的,当画布尺寸发生变化时,需要重新计算
  private worldCenterOffset: IPoint = {
    x: 0,
    y: 0
  };
  // 画布
  private canvas: HTMLCanvasElement;
  // 遮罩画布用以绘制鼠标样式,工具图标等
  private mask: IStageMask;
  // 前景画板
  private provisional: IStageProvisional;
  // 数据存储
  private store: IStageStore;
  // canvas渲染容器
  private renderEl: HTMLDivElement;
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
  // 鼠标按下并移动时的位置  
  private pressMovePosition: IPoint;
  // 鼠标移动时距离世界坐标中心点的偏移
  private pressMoveWorldCenterOffset: IPoint;
  // 鼠标是否按下过
  private isPressDown: boolean = false;

  constructor() {
    this.store = new StageStore(this);
    this.mask = new StageMask(this);
    this.provisional = new StageProvisional();
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
    this.mask.initCanvas(this.renderEl);
    this.provisional.initCanvas(this.renderEl, this.mask.canvas);

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'shield';
    this.renderEl.insertBefore(this.canvas, this.provisional.canvas);
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
    this.applyCursorMove(e);

    if (this.isPressDown) {
      this.calcPressMove(e);
      this.renderElementIfy(e);
    }
  }

  /**
   * 鼠标离开画布事件
   * 
   * @param e 
   */
  handleCursorLeave(e: MouseEvent): void {
    this.clearCursorPos();
    this.applyCursorLeave(e)
  }

  /**
   * 鼠标按下事件
   * 
   * @param e 
   */
  handlePressDown(e: MouseEvent): void {
    this.isPressDown = true;
    this.calcPressDown(e);
    this.initPressDownEvent();
  }

  /**
   * 鼠标抬起事件
   * 
   * @param e 
   */
  handlePressUp(e: MouseEvent): void {
    this.isPressDown = false;
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
  async applyCursorMove(e: MouseEvent): Promise<void> {
    this.mask.applyCursorMove(e, this.cursorPos);
    if (this.checkCreatorActive(this.currentCreator)) {
      this.setCursorStyle('none')
    }
  }

  /**
   * 鼠标离开画布事件
   * 
   * @param e 
   */
  applyCursorLeave(e: MouseEvent): void {
    this.mask.clearCanvas();
    this.mask.clearCursorCache();
    this.setCursorStyle('default');
  }

  /**
   * 鼠标按下时计算位置
   * 
   * @param e 
   */
  calcPressDown(e: MouseEvent): void {
    this.pressDownPosition = this.calcCursorPos(e);
    this.pressDownWorldCenterOffset = this.calcOffsetByPos(this.pressDownPosition);
  }

  /**
   * 鼠标抬起时计算位置
   * 
   * @param e 
   */
  calcPressUp(e: MouseEvent): void {
    this.pressUpPosition = this.calcCursorPos(e);
    this.pressUpWorldCenterOffset = this.calcOffsetByPos(this.pressUpPosition);
  }

  /**
   * 鼠标按压并移动时候，计算偏移量
   * 
   * @param e 
   */
  calcPressMove(e: MouseEvent): void {
    this.pressMovePosition = this.calcCursorPos(e);
    this.pressMoveWorldCenterOffset = this.calcOffsetByPos(this.pressMovePosition);
  }

  /**
   * 处理鼠标抬起逻辑（正常抬起、拖动抬起、绘制完成抬起等）
   * 
   * @param e 
   */
  applyPressUp(e) {
    if (this.checkCreatorActive(this.currentCreator)) {
      this.createElementAtPosition();
    }
  }

  /**
   * 检查鼠标是否移动过短（移动距离过短，可能为误触）
   * 
   * @param e 
   * @returns 
   */
  checkCursorPressMovedAvailable(e: MouseEvent): boolean {
    return Math.abs(this.pressMoveWorldCenterOffset.x - this.pressDownWorldCenterOffset.x) >= minCursorMoveXDistance
      || Math.abs(this.pressMoveWorldCenterOffset.y - this.pressDownWorldCenterOffset.y) >= minCursorMoveYDistance;
  }

  /**
   * 在当前鼠标位置创建元素
   */
  createElementAtPosition(): void {

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
   * 刷新画布尺寸
   */
  refreshSize(): void {
    const rect = this.renderEl.getBoundingClientRect();
    const { width, height } = rect;

    this.canvasRectCache = rect;
    this.mask.setSize({ width, height })
    this.provisional.setSize({ width, height });
    this.canvas.width = width;
    this.canvas.height = height;
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
   * 检查创作工具是否可用
   * 
   * @param creator 
   */
  checkCreatorActive(creator: Creator): boolean {
    if (!creator) return false;
    return [CreatorCategories.shapes].includes(creator.category);
  }

  /**
   * 清除画布内容
   */
  clearCanvas(): void {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 设置画布鼠标样式
   * 
   * @param cursor 
   */
  setCursorStyle(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }

  /**
   * 尝试渲染创作工具
   * 
   * @param e 
   */
  renderElementIfy(e: MouseEvent): void {
    if (this.checkCreatorActive(this.currentCreator) && this.checkCursorPressMovedAvailable(e)) {
      const element = this.store.createOrUpdateElement([this.pressDownWorldCenterOffset, this.pressMoveWorldCenterOffset], this.canvasRectCache, this.worldCenterOffset);
      if (element) {
        this.provisional.renderElement(e, element);
      }
    }
  }

}