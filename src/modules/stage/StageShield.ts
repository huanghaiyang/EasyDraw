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
  CreatorTypes,
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
import CommonUtils from "@/utils/CommonUtils";
import ElementUtils from "../elements/ElementUtils";

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
  private _isFirstResizeRender: boolean = true;
  // 鼠标按下位置
  private _pressDownPosition: IPoint;
  // 鼠标按下时距离世界坐标中心点的偏移
  private _pressDownStageWorldCoord: IPoint;
  // 鼠标抬起位置
  private _pressUpPosition: IPoint;
  // 鼠标抬起时距离世界坐标中心点的偏移
  private _pressUpStageWorldCoord: IPoint;
  // 鼠标按下并移动时的位置  
  private _pressMovePosition: IPoint;
  // 鼠标移动时距离世界坐标中心点的偏移
  private _pressMoveStageWorldCoord: IPoint;
  // 鼠标是否按下过
  private _isPressDown: boolean = false;
  // 是否正在拖拽组件
  private _isElementsDragging: boolean = false;
  // 是否正在调整组件大小
  private _isElementsResizing: boolean = false;

  get isElementsDragging(): boolean {
    return this._isElementsDragging;
  }

  set isElementsDragging(value: boolean) {
    this._isElementsResizing = value;
  }

  get isElementsResizing(): boolean {
    return this._isElementsResizing;
  }

  set isElementsResizing(value: boolean) {
    this._isElementsResizing = value;
  }

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
    this.cursor.transform(e);

    // 判断是否是绘制模式
    if (this.checkDrawerActive()) {
      this.setCursorStyle(CursorUtils.getCursorStyle(this.currentCreator.category));
    } else {
      this.setCursorStyle('default');
      this.selection.hitElements(this.cursor.value);
    }
    // 判断鼠标是否按下
    if (this._isPressDown) {
      this.calcPressMove(e);
      // 绘制模式
      if (this.checkDrawerActive()) {
        // 移动过程中创建元素
        this.creatingElementIfy(e);
      }
      // 如果是选择模式
      if (this.checkMoveableActive()) {
        // 如果不存在选中的元素
        if (this.store.selectedElements.length === 0) {
          // 计算选区
          const rangePoints = CommonUtils.getBoxPoints([this._pressDownPosition, this._pressMovePosition]);
          // 更新选区，命中组件
          this.selection.setRange(rangePoints);
        } else if (this._isElementsDragging || this.selection.checkSelectContainsHitting()) {
          if (this.checkCursorPressMovedALittle(e)) {
            // 标记拖动
            this._isElementsDragging = true;
            // 更新元素位置
            this.store.updateSelectedElementsMovement({
              x: this._pressMoveStageWorldCoord.x - this._pressDownStageWorldCoord.x,
              y: this._pressMoveStageWorldCoord.y - this._pressDownStageWorldCoord.y
            })
            // 标记组件正在拖动
            this.store.updateElements(this.store.selectedElements, { isDragging: true });
            funcs.push(() => this.redraw())
          }
        }
      }
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
    this._isPressDown = true;
    this.calcPressDown(e);

    // 1. 如果是绘制模式则直接清空
    // 2. 如果是选择模式且当前鼠标位置没有选中元素，也清空选区
    // 3. 如果是选择模式且当前鼠标位置有命中元素，但该元素不包含在选中元素中，则清空选区
    if (this.checkDrawerActive() || (this.checkMoveableActive() && (!this.selection.getElementOnPoint(this.cursor.value) || !this.selection.checkSelectContainsHitting()))) {
      // 清空所有组件的选中状态
      this.selection.clearSelects();
      // 将处于命中状态的组件转换为被选中状态
      this.selection.changeHittingElementsToSelect();
      // 清空选区
      this.selection.setRange([]);
    }
    this.mask.redraw();
  }

  /**
   * 鼠标抬起事件
   * 
   * @param e 
   */
  async handlePressUp(e: MouseEvent): Promise<void> {
    this._isPressDown = false;
    this.calcPressUp(e);
    // 如果是绘制模式，则完成元素的绘制
    if (this.checkDrawerActive()) {
      this.store.finishCreatingElement();
    } else if (this.checkMoveableActive()) { // 如果是选择模式
      // 判断是否是拖动组件操作，并且判断拖动位移是否有效
      if (this.store.selectedElements.length) {
        // 检查位移是否有效
        if (this.checkCursorPressUpALittle(e)) {
          // 如果当前是在拖动中
          if (this._isElementsDragging) {
            // 更新组件的坐标位置
            this.store.updateSelectedElementsMovement({
              x: this._pressUpStageWorldCoord.x - this._pressDownStageWorldCoord.x,
              y: this._pressUpStageWorldCoord.y - this._pressDownStageWorldCoord.y
            })
            // 取消组件拖动状态
            this.store.updateElements(this.store.selectedElements, { isDragging: false });
            // 刷新组件坐标数据
            this.store.refreshElementsCoords(this.store.selectedElements);
            // 将拖动状态置为false
            this._isElementsDragging = false;
          }
        } else {
          // 将除当前鼠标位置的组件设置为被选中，其他组件取消选中状态
          const topAElement = ElementUtils.getTopAElementByPoint(this.store.selectedElements, this.cursor.value);
          this.store.updateElements(this.store.selectedElements, { isSelected: false })
          if (topAElement) {
            this.store.updateElementById(topAElement.id, { isSelected: true });
          }
        }
      } else {
        this.selection.selectRange();
        this.selection.setRange(null);
      }
    }
    await Promise.all([
      this.mask.redraw(),
      this.provisional.redraw(),
      this.renderCreatedElement()
    ])
  }

  /**
   * 提交绘制
   */
  async renderCreatedElement(): Promise<void> {
    await this.redraw();
    const noneRenderedElements = this.store.noneRenderedElements;
    if (noneRenderedElements.length) {
      this.store.updateElements(noneRenderedElements, { isRendered: true, isOnStage: true });
      this.emit(ShieldDispatcherNames.elementCreated, noneRenderedElements.map(item => item.id));
    }
  }

  /**
   * 鼠标按下时计算位置
   * 
   * @param e 
   */
  calcPressDown(e: MouseEvent): void {
    this._pressDownPosition = this.cursor.transform(e);
    this._pressDownStageWorldCoord = this.calcWorldCoord(this._pressDownPosition);
  }

  /**
   * 鼠标抬起时计算位置
   * 
   * @param e 
   */
  calcPressUp(e: MouseEvent): void {
    this._pressUpPosition = this.cursor.transform(e);
    this._pressUpStageWorldCoord = this.calcWorldCoord(this._pressUpPosition);
  }

  /**
   * 鼠标按压并移动时候，计算偏移量
   * 
   * @param e 
   */
  calcPressMove(e: MouseEvent): void {
    this._pressMovePosition = this.cursor.transform(e);
    this._pressMoveStageWorldCoord = this.calcWorldCoord(this._pressMovePosition);
  }

  /**
   * 检查鼠标是否移动过短（移动距离过短，可能为误触）
   * 
   * @param e 
   * @returns 
   */
  checkCursorPressMovedALittle(e: MouseEvent): boolean {
    return Math.abs(this._pressMoveStageWorldCoord.x - this._pressDownStageWorldCoord.x) >= MinCursorMoveXDistance
      || Math.abs(this._pressMoveStageWorldCoord.y - this._pressDownStageWorldCoord.y) >= MinCursorMoveYDistance;
  }

  /**
   * 检查鼠标抬起是否移动过短（移动距离过短，可能为误触）
   * 
   * @param e 
   * @returns 
   */
  checkCursorPressUpALittle(e: MouseEvent): boolean {
    return Math.abs(this._pressUpStageWorldCoord.x - this._pressDownStageWorldCoord.x) >= MinCursorMoveXDistance
      || Math.abs(this._pressUpStageWorldCoord.y - this._pressDownStageWorldCoord.y) >= MinCursorMoveYDistance;
  }

  /**
   * 给定坐标计算距离世界坐标中心点的偏移
   * 
   * @param pos 
   */
  calcWorldCoord(pos: IPoint): IPoint {
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
    this.stageRect = rect;
    // TODO this.worldCenterCoord = ?
    this.store.refreshAllElementStagePoints();
    this.mask.updateCanvasSize(rect)
    this.provisional.updateCanvasSize(rect);
    this.updateCanvasSize(rect);
    if (this._isFirstResizeRender) {
      this._isFirstResizeRender = false;
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
  checkDrawerActive(): boolean {
    if (!this.currentCreator) return false;
    return [CreatorCategories.shapes].includes(this.currentCreator.category);
  }

  /**
   * 检查移动工具是否可用
   * 
   * @returns 
   */
  checkMoveableActive(): boolean {
    return CreatorTypes.moveable === this.currentCreator?.type;
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
  creatingElementIfy(e: MouseEvent): IStageElement | null {
    if (this.checkCursorPressMovedALittle(e)) {
      const element = this.store.creatingElement([this._pressDownStageWorldCoord, this._pressMoveStageWorldCoord]);
      if (element) {
        return element;
      }
    }
  }

}