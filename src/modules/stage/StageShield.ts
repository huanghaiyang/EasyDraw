import { MinCursorMoveXDistance, MinCursorMoveYDistance } from "@/types/constants";
import {
  Creator,
  CreatorCategories,
  IPoint,
  IStageDrawerProvisional,
  IStageDrawerMask,
  IStageStore,
  IStageShield,
  IStageSelection,
  IStageElement,
  IStageCursor,
  IStageEvent,
  ShieldDispatcherNames,
} from "@/types";
import StageStore from "@/modules/stage/StageStore";
import StageDrawerMask from "@/modules/stage/drawer/StageDrawerMask";
import StageDrawerProvisional from "@/modules/stage/drawer/StageDrawerProvisional";
import StageSelection from "@/modules/stage/StageSelection";
import StageCursor from "@/modules/stage/StageCursor";
import StageEvent from '@/modules/stage/StageEvent';
import CursorUtils from "@/utils/CursorUtils";
import StageDrawerBase from "@/modules/stage/drawer/StageDrawerBase";
import StageDrawerShieldRenderer from "@/modules/render/renderer/drawer/StageDrawerShieldRenderer";

export default class StageShield extends StageDrawerBase implements IStageShield {
  // 当前正在使用的创作工具
  currentCreator: Creator;
  // 鼠标操作
  cursor: IStageCursor;
  // 遮罩画布用以绘制鼠标样式,工具图标等
  mask: IStageDrawerMask;
  // 前景画板
  provisional: IStageDrawerProvisional;
  // 数据存储
  store: IStageStore;
  // 选区操作
  selection: IStageSelection;
  // 事件处理中心
  event: IStageEvent;
  // 画布在世界中的坐标,画布始终是居中的,所以坐标都是相对于画布中心点的,当画布尺寸发生变化时,需要重新计算
  stageWorldCoord: IPoint = {
    x: 0,
    y: 0
  };
  // canvas渲染容器
  renderEl: HTMLDivElement;
  // 画布容器尺寸
  stageRect: DOMRect;

  get stageRectPoints(): IPoint[] {
    return [{
      x: 0, y: 0
    }, {
      x: this.stageRect.width,
      y: 0
    }, {
      x: this.stageRect.width,
      y: this.stageRect.height
    }, {
      x: 0, y: this.stageRect.height
    }]
  }

  get stageWordRectPoints(): IPoint[] {
    return [{
      x: this.stageWorldCoord.x - this.stageRect.width / 2,
      y: this.stageWorldCoord.y - this.stageRect.height / 2
    }, {
      x: this.stageWorldCoord.x + this.stageRect.width / 2,
      y: this.stageWorldCoord.y - this.stageRect.height / 2
    }, {
      x: this.stageWorldCoord.x + this.stageRect.width / 2,
      y: this.stageWorldCoord.y + this.stageRect.height / 2
    }, {
      x: this.stageWorldCoord.x - this.stageRect.width / 2,
      y: this.stageWorldCoord.y + this.stageRect.height / 2
    }]
  }

  // 画布是否是第一次渲染
  private isFirstResizeRender: boolean = true;
  // 鼠标按下位置
  private pressDownPosition: IPoint;
  // 鼠标按下时距离世界坐标中心点的偏移
  private pressDownStageWorldCoord: IPoint;
  // 鼠标抬起位置
  private pressUpPosition: IPoint;
  // 鼠标抬起时距离世界坐标中心点的偏移
  private pressUpStageWorldCoord: IPoint;
  // 鼠标按下并移动时的位置  
  private pressMovePosition: IPoint;
  // 鼠标移动时距离世界坐标中心点的偏移
  private pressMoveStageWorldCoord: IPoint;
  // 鼠标是否按下过
  private isPressDown: boolean = false;

  constructor() {
    super();
    this.event = new StageEvent(this);
    this.store = new StageStore(this);
    this.cursor = new StageCursor(this);
    this.provisional = new StageDrawerProvisional(this);
    this.selection = new StageSelection(this);
    this.mask = new StageDrawerMask(this);
    this.renderer = new StageDrawerShieldRenderer(this);

    this.refreshSize = this.refreshSize.bind(this);
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
    await Promise.all([
      this.initCanvas(),
      this.event.init(),
    ])
    this.event.on('resize', this.refreshSize)
    this.event.on('cursorMove', this.handleCursorMove)
    this.event.on('cursorLeave', this.handleCursorLeave)
    this.event.on('pressDown', this.handlePressDown)
    this.event.on('pressUp', this.handlePressUp)
  }

  /**
   * 初始化画布
   */
  initCanvas(): HTMLCanvasElement {
    super.initCanvas();

    const maskCanvas = this.mask.initCanvas();
    const provisionalCanvas = this.provisional.initCanvas();

    this.renderEl.insertBefore(maskCanvas, this.renderEl.firstChild);
    this.renderEl.insertBefore(provisionalCanvas, this.mask.canvas);

    this.canvas.id = 'shield';
    this.renderEl.insertBefore(this.canvas, this.provisional.canvas);

    return this.canvas;
  }

  /**
   * 鼠标移动事件
   * 
   * @param e 
   */
  async handleCursorMove(e: MouseEvent): Promise<void> {
    const funcs = [];
    this.cursor.calcPos(e, this.stageRect);

    if (this.checkCreatorActive()) {
      this.setCursorStyle(CursorUtils.getCursorStyle(this.currentCreator.category));
    } else {
      this.setCursorStyle('default');
      this.selection.hitElements(this.cursor.pos);
    }
    if (this.isPressDown) {
      this.calcPressMove(e);
      this.creatingElement(e);
      funcs.push(() => this.provisional.redraw())
    }
    funcs.push(() => this.mask.redraw());
    await Promise.all(funcs.map(func => func()));
  }

  /**
   * 鼠标离开画布事件
   * 
   * @param e 
   */
  async handleCursorLeave(e: MouseEvent): Promise<void> {
    this.cursor.clear();
    this.setCursorStyle('default');
    await this.mask.redraw();
  }

  /**
   * 鼠标按下事件
   * 
   * @param e 
   */
  async handlePressDown(e: MouseEvent): Promise<void> {
    this.isPressDown = true;
    this.calcPressDown(e);
    this.selection.clearSelects();
  }

  /**
   * 鼠标抬起事件
   * 
   * @param e 
   */
  async handlePressUp(e: MouseEvent): Promise<void> {
    this.isPressDown = false;
    this.calcPressUp(e);
    if (this.checkCreatorActive()) {
      this.store.finishCreatingElement();
    }
    await this.commitRedraw();
  }

  /**
   * 提交绘制
   */
  async commitRedraw(): Promise<void> {
    await this.redraw();
    const noneRenderedElements = this.store.noneRenderedElements;
    if (noneRenderedElements.length) {
      this.store.updateElements(noneRenderedElements, { isRendered: true });
      this.emit(ShieldDispatcherNames.elementCreated, noneRenderedElements.map(item => item.id));
    }
  }

  /**
   * 鼠标按下时计算位置
   * 
   * @param e 
   */
  calcPressDown(e: MouseEvent): void {
    this.pressDownPosition = this.cursor.calcPos(e, this.stageRect);
    this.pressDownStageWorldCoord = this.calcOffsetByPos(this.pressDownPosition);
  }

  /**
   * 鼠标抬起时计算位置
   * 
   * @param e 
   */
  calcPressUp(e: MouseEvent): void {
    this.pressUpPosition = this.cursor.calcPos(e, this.stageRect);
    this.pressUpStageWorldCoord = this.calcOffsetByPos(this.pressUpPosition);
  }

  /**
   * 鼠标按压并移动时候，计算偏移量
   * 
   * @param e 
   */
  calcPressMove(e: MouseEvent): void {
    this.pressMovePosition = this.cursor.calcPos(e, this.stageRect);
    this.pressMoveStageWorldCoord = this.calcOffsetByPos(this.pressMovePosition);
  }

  /**
   * 检查鼠标是否移动过短（移动距离过短，可能为误触）
   * 
   * @param e 
   * @returns 
   */
  checkCursorPressMovedAvailable(e: MouseEvent): boolean {
    return Math.abs(this.pressMoveStageWorldCoord.x - this.pressDownStageWorldCoord.x) >= MinCursorMoveXDistance
      || Math.abs(this.pressMoveStageWorldCoord.y - this.pressDownStageWorldCoord.y) >= MinCursorMoveYDistance;
  }

  /**
   * 给定坐标计算距离世界坐标中心点的偏移
   * 
   * @param pos 
   */
  calcOffsetByPos(pos: IPoint): IPoint {
    return {
      x: pos.x - this.stageRect.width / 2 + this.stageWorldCoord.x,
      y: pos.y - this.stageRect.height / 2 + this.stageWorldCoord.y
    }
  }

  /**
   * 刷新画布尺寸
   */
  refreshSize(): void {
    const rect = this.renderEl.getBoundingClientRect();
    const { width, height } = rect;

    this.stageRect = rect;
    // TODO this.worldCenterCoord = ?
    this.store.refreshAllElementStagePoints();
    this.mask.updateCanvasSize(rect)
    this.provisional.updateCanvasSize(rect);
    this.updateCanvasSize(rect);
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
  checkCreatorActive(): boolean {
    if (!this.currentCreator) return false;
    return [CreatorCategories.shapes].includes(this.currentCreator.category);
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
  creatingElement(e: MouseEvent): IStageElement | null {
    if (this.checkCreatorActive() && this.checkCursorPressMovedAvailable(e)) {
      const element = this.store.creatingElement([this.pressDownStageWorldCoord, this.pressMoveStageWorldCoord]);
      if (element) {
        return element;
      }
    }
  }

}