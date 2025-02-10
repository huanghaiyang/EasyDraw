import { MinCursorMXD, MinCursorMYD } from "@/types/Constants";
import { IPoint, ShieldDispatcherNames } from "@/types";
import StageStore from "@/modules/stage/StageStore";
import DrawerMask from "@/modules/stage/drawer/DrawerMask";
import DrawerProvisional from "@/modules/stage/drawer/DrawerProvisional";
import StageSelection from "@/modules/stage/StageSelection";
import StageCursor from "@/modules/stage/StageCursor";
import StageEvent from "@/modules/stage/StageEvent";
import DrawerBase from "@/modules/stage/drawer/DrawerBase";
import ShieldRenderer from "@/modules/render/renderer/drawer/ShieldRenderer";
import CommonUtils from "@/utils/CommonUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { clamp, cloneDeep, flatten, isBoolean } from "lodash";
import StageConfigure from "@/modules/stage/StageConfigure";
import IStageConfigure from "@/types/IStageConfigure";
import IElement, { RefreshSubOptions } from "@/types/IElement";
import IStageStore from "@/types/IStageStore";
import IStageSelection from "@/types/IStageSelection";
import { IDrawerMask, IDrawerProvisional } from "@/types/IStageDrawer";
import IStageShield, { StageCalcParams } from "@/types/IStageShield";
import IStageCursor from "@/types/IStageCursor";
import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator";
import IStageEvent from "@/types/IStageEvent";
import CanvasUtils from "@/utils/CanvasUtils";
import { StrokeTypes } from "@/styles/ElementStyles";
import IController from "@/types/IController";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import MathUtils from "@/utils/MathUtils";
import { AutoFitPadding } from "@/types/Stage";
import IStageAlign, { IStageAlignFuncs } from "@/types/IStageAlign";
import StageAlign from "@/modules/stage/StageAlign";
import { HandCreator, MoveableCreator } from "@/types/CreatorDicts";

export default class StageShield extends DrawerBase implements IStageShield, IStageAlignFuncs {
  // 当前正在使用的创作工具
  currentCreator: Creator;
  // 鼠标操作
  cursor: IStageCursor;
  // 遮罩画布用以绘制鼠标样式,工具图标等
  mask: IDrawerMask;
  // 前景画板
  provisional: IDrawerProvisional;
  // 配置
  configure: IStageConfigure;
  // 数据存储
  store: IStageStore;
  // 选区操作
  selection: IStageSelection;
  // 事件处理中心
  event: IStageEvent;
  // 对齐
  align: IStageAlign;
  // 舞台缩放比例
  stageScale: number = 1;
  // 画布在世界中的坐标,画布始终是居中的,所以坐标都是相对于画布中心点的,当画布尺寸发生变化时,需要重新计算
  stageWorldCoord: IPoint = {
    x: 0,
    y: 0,
  };
  // 画布容器尺寸
  stageRect: DOMRect;
  // canvas渲染容器
  renderEl: HTMLDivElement;
  // 画布矩形顶点坐标
  get stageRectPoints(): IPoint[] {
    return CommonUtils.getRectVertices(this.stageRect);
  }
  // 舞台矩形顶点坐标
  get stageWordRectCoords(): IPoint[] {
    let { width, height } = this.stageRect;
    width /= this.stageScale;
    height /= this.stageScale;
    return CommonUtils.getBoxVertices(this.stageWorldCoord, { width, height });
  }

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
  // 舞台是否在移动
  private _isStageMoving: boolean = false;
  // 是否正在调整组件大小
  private _isElementsTransforming: boolean = false;
  // 组件是否旋转中
  private _isElementsRotating: boolean = false;
  // 是否处于编辑状态
  private _isElementsEditing: boolean = false;
  // 移动舞台前的原始坐标
  private _originalStageWorldCoord: IPoint;
  // 是否需要重绘
  get shouldRedraw(): boolean {
    return this.isElementsDragging || this.isElementsRotating || this.isElementsTransforming || this.isStageMoving;
  }

  // 组件是否处于活动中
  get isElementsBusy(): boolean {
    return this.isElementsRotating || this.isElementsTransforming || this.isElementsDragging;
  }

  // 是否正在拖拽组件
  get isElementsDragging(): boolean {
    return this._isElementsDragging;
  }

  // 设置是否正在拖拽组件
  set isElementsDragging(value: boolean) {
    this._isElementsTransforming = value;
  }

  // 是否正在形变组件
  get isElementsTransforming(): boolean {
    return this._isElementsTransforming;
  }

  // 设置是否正在形变组件
  set isElementsTransforming(value: boolean) {
    this._isElementsTransforming = value;
  }

  // 设置是否正在移动舞台
  set isStageMoving(value: boolean) {
    this._isStageMoving = value;
  }

  // 是否正在移动舞台
  get isStageMoving(): boolean {
    return this._isStageMoving;
  }

  // 是否是绘制工具
  get isDrawerActive(): boolean {
    return [CreatorCategories.shapes, CreatorCategories.freedom].includes(this.currentCreator?.category);
  }

  // 是否是手绘工具
  get isHandActive(): boolean {
    return this.currentCreator?.type === CreatorTypes.hand;
  }

  // 是否是移动工具
  get isMoveableActive(): boolean {
    return this.currentCreator?.type === CreatorTypes.moveable;
  }

  // 是否正在旋转组件
  get isElementsRotating(): boolean {
    return this._isElementsRotating;
  }

  // 是否是任意绘制工具
  get isArbitraryDrawing(): boolean {
    return this.currentCreator?.type === CreatorTypes.arbitrary;
  }

  // 是否处于编辑状态
  get isElementsEditing(): boolean {
    return this._isElementsEditing;
  }

  // 舞台计算参数
  get stageCalcParams(): StageCalcParams {
    return { rect: this.stageRect, worldCoord: this.stageWorldCoord, scale: this.stageScale };
  }

  constructor() {
    super();
    this.configure = new StageConfigure();
    this.event = new StageEvent(this);
    this.store = new StageStore(this);
    this.cursor = new StageCursor(this);
    this.provisional = new DrawerProvisional(this);
    this.selection = new StageSelection(this);
    this.align = new StageAlign(this);
    this.mask = new DrawerMask(this);
    this.renderer = new ShieldRenderer(this);
  }

  /**
   * 设置组件位置
   *
   * @param elements
   * @param value
   */
  async setElementsPosition(elements: IElement[], value: IPoint): Promise<void> {
    await this.store.setElementsPosition(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件宽度
   *
   * @param elements
   * @param value
   */
  async setElementsWidth(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsWidth(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件高度
   *
   * @param elements
   * @param value
   */
  async setElementsHeight(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsHeight(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件Y倾斜角度
   *
   * @param elements
   * @param value
   */
  async setElementsLeanYAngle(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsLeanYAngle(elements, value);
    await this._redrawAll({ shield: true, mask: true });
  }

  /**
   * 设置组件X倾斜角度
   *
   * @param elements
   * @param value
   */
  async setElementsLeanXAngle(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsLeanXAngle(elements, value);
    await this._redrawAll({ shield: true, mask: true });
  }

  /**
   * 设置组件角度
   *
   * @param elements
   * @param value
   */
  async setElementsAngle(elements: IElement[], value: number): Promise<void> {
    this._refreshElementsOriginals(elements, { deepSubs: true });
    await this.store.setElementsAngle(elements, value);
    await this._redrawAll({ shield: true });
    this._refreshElementsOriginals(elements, { deepSubs: true });
  }

  /**
   * 设置组件边框类型
   *
   * @param elements
   * @param value
   */
  async setElementsStrokeType(elements: IElement[], value: StrokeTypes): Promise<void> {
    await this.store.setElementsStrokeType(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件边框宽度
   *
   * @param elements
   * @param value
   */
  async setElementsStrokeWidth(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsStrokeWidth(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件边框颜色
   *
   * @param elements
   * @param value
   */
  async setElementsStrokeColor(elements: IElement[], value: string): Promise<void> {
    await this.store.setElementsStrokeColor(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件边框颜色透明度
   *
   * @param elements
   * @param value
   */
  async setElementsStrokeColorOpacity(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsStrokeColorOpacity(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件填充颜色
   *
   * @param elements
   * @param value
   */
  async setElementsFillColor(elements: IElement[], value: string): Promise<void> {
    await this.store.setElementsFillColor(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件填充颜色透明度
   *
   * @param elements
   * @param value
   */
  async setElementsFillColorOpacity(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsFillColorOpacity(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件文本对齐方式
   *
   * @param elements
   * @param value
   */
  async setElementsTextAlign(elements: IElement[], value: CanvasTextAlign): Promise<void> {
    await this.store.setElementsTextAlign(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件文本基线
   *
   * @param elements
   * @param value
   */
  async setElementsTextBaseline(elements: IElement[], value: CanvasTextBaseline): Promise<void> {
    await this.store.setElementsTextBaseline(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件字体大小
   *
   * @param elements
   * @param value
   */
  async setElementsFontSize(elements: IElement[], value: number): Promise<void> {
    await this.store.setElementsFontSize(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 设置组件字体
   *
   * @param elements
   * @param value
   */
  async setElementsFontFamily(elements: IElement[], value: string): Promise<void> {
    await this.store.setElementsFontFamily(elements, value);
    await this._redrawAll({ shield: true });
  }

  /**
   * 锁定比例
   *
   * @param elements
   * @param value
   */
  async setElementsRatioLocked(elements: IElement[], value: boolean): Promise<void> {
    await this.store.setElementsRatioLocked(elements, value);
  }

  /**
   * 初始化
   *
   * @param renderEl
   */
  async init(renderEl: HTMLDivElement): Promise<void> {
    this.renderEl = renderEl;
    await Promise.all([this.initCanvas(), this.event.init()]);
    this._addEventListeners();
  }

  /**
   * 添加事件监听
   */
  private _addEventListeners() {
    this.event.on("resize", this._refreshSize.bind(this));
    this.event.on("cursorMove", this._handleCursorMove.bind(this));
    this.event.on("cursorLeave", this._handleCursorLeave.bind(this));
    this.event.on("pressDown", this._handlePressDown.bind(this));
    this.event.on("pressUp", this._handlePressUp.bind(this));
    this.event.on("dblClick", this._handleDblClick.bind(this));
    this.event.on("wheelScale", this._handleWheelScale.bind(this));
    this.event.on("wheelMove", this._handleWheelMove.bind(this));
    this.event.on("scaleReduce", this._handleScaleReduce.bind(this));
    this.event.on("scaleIncrease", this._handleScaleIncrease.bind(this));
    this.event.on("scaleAutoFit", this._handleScaleAutoFit.bind(this));
    this.event.on("scale100", this._handleScale100.bind(this));
    this.event.on("pasteImage", this._handleImagePasted.bind(this));
    this.event.on("deleteSelects", this._handleSelectsDelete.bind(this));
    this.event.on("selectAll", this._handleSelectAll.bind(this));
    this.event.on("cancel", this._handleCancel.bind(this));
    this.event.on("selectMoveable", this._handleSelectMoveable.bind(this));
    this.event.on("selectHand", this._handleSelectHand.bind(this));
    this.event.on("selectGroup", this._handleSelectGroup.bind(this));
    this.event.on("selectGroupCancel", this._handleSelectGroupCancel.bind(this));
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

    this.canvas.id = "shield";
    this.renderEl.insertBefore(this.canvas, this.provisional.canvas);

    return this.canvas;
  }

  /**
   * 鼠标移动事件
   *
   * @param e
   */
  async _handleCursorMove(e: MouseEvent): Promise<void> {
    let flag = false;
    this.cursor.transform(e);
    this.cursor.updateStyle(e);

    // 只有在未对组件进行旋转/移动/形变的情况下才会启用组件命中逻辑
    if (this.isMoveableActive && !this.isElementsBusy) {
      this.selection.hitTargetElements(this.cursor.value);
    }

    // 判断鼠标是否按下
    if (this._isPressDown) {
      this.calcPressMove(e);
      if (this.isArbitraryDrawing) {
        // 移动过程中创建元素
        this._updatingArbitraryElementOnMovement(e);
      } else if (this.isDrawerActive) {
        // 移动过程中创建元素
        this._creatingElementOnMovement(e);
      } else if (this.isMoveableActive) {
        // 如果是选择模式
        // 如果不存在选中的元素
        if (this.store.isSelectedEmpty) {
          this._createRange();
        } else if (this._isElementsRotating) {
          if (this.checkCursorPressMovedALittle(e)) {
            this._rotateElements();
            flag = true;
          }
        } else if (this._isElementsTransforming) {
          if (this.checkCursorPressMovedALittle(e)) {
            this._transformElements();
            flag = true;
          }
        } else if (this._isElementsDragging || this.store.isSelectedContainsTarget()) {
          if (this.checkCursorPressMovedALittle(e)) {
            // 标记拖动
            this._isElementsDragging = true;
            this._dragElements();
            flag = true;
          }
        }
      } else if (this.isHandActive) {
        this._isStageMoving = true;
        this._dragStage(e);
        flag = true;
      }
    } else if (this.isMoveableActive) {
      this._tryActiveController();
    }
    if (this.isElementsBusy) {
      this.store.cancelTargetElements();
    }
    await this._redrawAllIfy({
      shield: flag,
      provisional: this._isPressDown,
      mask: true,
    });
  }

  /**
   * 尝试激活控制器
   *
   * @returns
   */
  private _tryActiveController(): IController {
    const controller = this.selection.tryActiveController(this.cursor.value);
    // 判断是否是旋转控制器
    const isRotationController = controller instanceof ElementRotation;
    if (!isRotationController) {
      this.selection.deActiveElementsRotations();
    }
    // 判断是否是变换控制器
    const isTransformerController = controller instanceof VerticesTransformer;
    if (!isTransformerController) {
      this.selection.deActiveElementsTransformers();
    }
    // 判断是否是边框变换控制器
    const isBorderTransformerController = controller instanceof BorderTransformer;
    if (!isBorderTransformerController) {
      this.selection.deActiveElementsBorderTransformers();
    }
    return controller;
  }

  /**
   * 舞台拖动
   *
   * @param e
   */
  private _dragStage(e: MouseEvent): void {
    this._refreshStageWorldCoord(e);
    this.store.refreshStageElements();
  }

  /**
   * 拖动组件移动
   */
  private _dragElements(): void {
    // 标记组件正在拖动
    this.store.updateElements(this.store.selectedElements, { isDragging: true });
    // 更新元素位置
    this.store.updateSelectedElementsMovement({
      x: this._pressMoveStageWorldCoord.x - this._pressDownStageWorldCoord.x,
      y: this._pressMoveStageWorldCoord.y - this._pressDownStageWorldCoord.y,
    });
  }

  /**
   * 组件形变
   */
  private _transformElements(): void {
    this.store.updateElements(this.store.selectedElements, { isTransforming: true });
    this.store.updateSelectedElementsTransform({
      x: this._pressMoveStageWorldCoord.x - this._pressDownStageWorldCoord.x,
      y: this._pressMoveStageWorldCoord.y - this._pressDownStageWorldCoord.y,
    });
  }

  /**
   * 旋转组件
   */
  private _rotateElements(): void {
    this.store.updateElements(this.store.selectedElements, { isRotating: true });
    this.store.updateSelectedElementsRotation(this._pressMovePosition);
  }

  /**
   * 创建选区
   */
  private _createRange(): void {
    // 计算选区
    const rangePoints = CommonUtils.getBoxPoints([this._pressDownPosition, this._pressMovePosition]);
    // 更新选区，命中组件
    this.selection.setRange(rangePoints);
  }

  /**
   * 鼠标离开画布事件
   */
  async _handleCursorLeave(): Promise<void> {
    this.cursor.clear();
    this.cursor.setStyle("default");
    await this.mask.redraw();
  }

  /**
   * 鼠标按下事件
   *
   * @param e
   */
  async _handlePressDown(e: MouseEvent): Promise<void> {
    this._isPressDown = true;
    this.calcPressDown(e);

    // 如果当前是绘制模式或则是开始绘制自由多边形，则清空选区
    if (this.isDrawerActive && !this.store.isSelectedEqCreating()) {
      this._clearStageSelects();
    } else if (this.isMoveableActive) {
      // 尝试激活控制器
      const controller = this._tryActiveController();
      if (controller) {
        this._refreshElementsOriginals(this.store.selectedElements, { deepSubs: true });
      }
      if (controller instanceof ElementRotation) {
        this.store.updateElementById(controller.element.id, { isRotatingTarget: true });
        this.store.refreshRotatingStates(this._pressDownPosition);
        this._isElementsRotating = true;
      } else if (controller instanceof VerticesTransformer) {
        this._isElementsTransforming = true;
      } else if (controller instanceof BorderTransformer) {
        this._isElementsTransforming = true;
      } else {
        // 获取鼠标点击的组件
        const targetElement = this.selection.getElementOnPoint(this.cursor.value);
        // 判断当前鼠标位置的组件是否已经被选中
        const isSelectContainsTarget = this.store.isSelectedContainsTarget();
        if (e.ctrlKey) {
          targetElement && this.store.toggleSelectElement(targetElement);
        } else {
          // 如果当前鼠标位置的组件没有被选中，则将当前组件设置为选中状态，其他组件取消选中状态
          if (!isSelectContainsTarget) {
            this._clearStageSelects();
            if (targetElement) {
              this.store.selectElement(targetElement);
            }
          }
        }
      }
    } else if (this.isHandActive) {
      this._originalStageWorldCoord = cloneDeep(this.stageWorldCoord);
    }
    await this.mask.redraw();
  }

  /**
   * 刷新元素原始数据
   *
   * @param elements
   * @param options
   */
  private _refreshElementsOriginals(elements: IElement[], options?: RefreshSubOptions): void {
    this.store.refreshElementsOriginalAngles(elements, options);
    this.store.refreshElementsOriginals(elements, options);
  }

  /**
   * 处理自由绘制下的鼠标按下事件
   */
  private _handleArbitraryPressUp(): void {
    const element = this.store.creatingArbitraryElement(this.cursor.worldValue, true);
    if (element?.model.isFold) {
      this.commitArbitraryDrawing();
    }
  }

  /**
   * 清除舞台组件状态
   */
  private _clearStageSelects(): void {
    // 清空所有组件的选中状态
    this.selection.clearSelects();
    // 清空选区
    this.selection.setRange([]);
  }

  /**
   * 鼠标抬起事件
   *
   * @param e
   */
  async _handlePressUp(e: MouseEvent): Promise<void> {
    this._isPressDown = false;
    this.calcPressUp(e);
    // 如果是绘制模式，则完成元素的绘制
    if (this.isArbitraryDrawing) {
      this._isPressDown = true;
      this._handleArbitraryPressUp();
    } else if (this.isDrawerActive) {
      this.store.finishCreatingElement();
    } else if (this.isMoveableActive) {
      // 如果是选择模式
      // 判断是否是拖动组件操作，并且判断拖动位移是否有效
      if (this.store.isSelectedEmpty) {
        this._makeRangeEmpty();
      } else if (this.checkCursorPressUpALittle(e)) {
        // 如果当前是在拖动中
        if (this._isElementsDragging) {
          this._endElementsDrag();
          // 将拖动状态置为false
          this._isElementsDragging = false;
        } else if (this._isElementsRotating) {
          this._endElementsRotate();
          // 将旋转状态置为false
          this._isElementsRotating = false;
        } else if (this._isElementsTransforming) {
          this._endElementsTransform();
          // 将旋转状态置为false
          this._isElementsTransforming = false;
        }
      } else if (!e.ctrlKey && !e.shiftKey) {
        this._selectTopAElement(this.store.selectedElements);
      }
    } else if (this.isHandActive) {
      this._processHandCreatorMove(e);
    }
    // 非自由绘制模式，绘制完成之后重绘
    if (!this.isArbitraryDrawing) {
      this._redrawAfterCreated();
    }
  }

  /**
   * 处理鼠标双击事件
   *
   * @param e
   */
  async _handleDblClick(e: MouseEvent): Promise<void> {
    if (this.isMoveableActive) {
      this._selectTopAElement(this.store.stageElements);
      this.store.beginEditingElements(this.store.selectedElements);
      this._isElementsEditing = !this.store.isEditingEmpty;
      this._redrawAllIfy({
        mask: true,
        provisional: false,
        shield: true,
      });
    }
  }

  /**
   * 绘制完成之后的重绘
   */
  private async _redrawAfterCreated(): Promise<void> {
    await Promise.all([this.mask.redraw(), this.provisional.redraw(), this.redraw(), this.triggerElementCreated()]);
  }

  /**
   * 结束组件拖拽操作
   */
  private _endElementsDrag() {
    this._refreshElementsOriginals(this.store.selectedElements, { deepSubs: true });
    // 取消组件拖动状态
    this.store.updateElements(this.store.selectedElements, { isDragging: false });
    // 刷新组件坐标数据
    this.store.refreshElementsPosition(this.store.selectedElements);
  }

  /**
   * 结束组件旋转操作
   */
  private _endElementsRotate() {
    this._refreshElementsOriginals(this.store.selectedElements, { deepSubs: true });
    // 更新组件状态
    this.store.updateElements(this.store.rotatingTargetElements, {
      isRotatingTarget: false,
      isRotating: false,
    });
    this.store.clearRotatingStates();
  }

  /**
   * 结束组件变换操作
   */
  private _endElementsTransform() {
    this._refreshElementsOriginals(this.store.selectedElements, { deepSubs: true });
    // 更新组件状态
    this.store.updateElements(this.store.selectedElements, {
      isTransforming: false,
    });
  }

  /**
   * 将除当前鼠标位置的组件设置为被选中，其他组件取消选中状态
   */
  private _selectTopAElement(elements: IElement[]): void {
    const topAElement = ElementUtils.getTopAElementByPoint(elements, this.cursor.value);
    this.store.deSelectElements(
      this.store.selectedElements.filter((element) => {
        if (topAElement && topAElement.isGroup) {
          return element.ancestorGroup !== topAElement;
        }
        return element !== topAElement;
      })
    );
    if (topAElement && !topAElement.isSelected) {
      this.store.selectElement(topAElement);
    }
  }

  /**
   * 处理选区为空的情况
   */
  private _makeRangeEmpty() {
    this.selection.selectRange();
    this.selection.setRange(null);
  }

  /**
   * 处理手型工具移动事件
   *
   * @param e
   */
  private _processHandCreatorMove(e: MouseEvent): void {
    this._refreshStageWorldCoord(e);
    this.store.refreshStageElements();
    this._isStageMoving = false;
  }

  /**
   * 提交绘制
   */
  async triggerElementCreated(): Promise<void> {
    const provisionalElements = this.store.provisionalElements;
    if (provisionalElements.length) {
      this.store.updateElements(provisionalElements, { isProvisional: false, isOnStage: true });
      this.emit(
        ShieldDispatcherNames.elementCreated,
        provisionalElements.map((item) => item.id)
      );
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
    return (
      Math.abs(this._pressMoveStageWorldCoord.x - this._pressDownStageWorldCoord.x) >= MinCursorMXD || Math.abs(this._pressMoveStageWorldCoord.y - this._pressDownStageWorldCoord.y) >= MinCursorMYD
    );
  }

  /**
   * 检查鼠标抬起是否移动过短（移动距离过短，可能为误触）
   *
   * @param e
   * @returns
   */
  checkCursorPressUpALittle(e: MouseEvent): boolean {
    return Math.abs(this._pressUpStageWorldCoord.x - this._pressDownStageWorldCoord.x) >= MinCursorMXD || Math.abs(this._pressUpStageWorldCoord.y - this._pressDownStageWorldCoord.y) >= MinCursorMYD;
  }

  /**
   * 给定坐标计算距离世界坐标中心点的偏移
   *
   * @param pos
   */
  calcWorldCoord(pos: IPoint): IPoint {
    return ElementUtils.calcWorldPoint(pos, this.stageCalcParams);
  }

  /**
   * 刷新画布尺寸
   */
  private async _refreshSize(): Promise<void> {
    const rect = this.renderEl.getBoundingClientRect();
    this.stageRect = rect;
    this._setCanvasSize(rect);
    this.store.refreshStageElements();
    await this._redrawAll(true);
  }

  /**
   * 更新所有画布尺寸
   *
   * @param size
   */
  private _setCanvasSize(size: DOMRect): void {
    this.mask.updateCanvasSize(size);
    this.provisional.updateCanvasSize(size);
    this.updateCanvasSize(size);
  }

  /**
   * 重新绘制所有内容
   */
  private async _redrawAll(force?: boolean | { mask?: boolean; provisional?: boolean; shield?: boolean }): Promise<void> {
    if (isBoolean(force)) {
      await Promise.all([this.mask.redraw(force), this.provisional.redraw(force), this.redraw(force)]);
    } else {
      await Promise.all([this.mask.redraw(force.mask), this.provisional.redraw(force.provisional), this.redraw(force.shield)]);
    }
  }

  /**
   * 可选渲染
   *
   * @param options
   */
  private async _redrawAllIfy(options: { mask?: boolean; provisional?: boolean; shield?: boolean }): Promise<void> {
    const funcs: Function[] = [];
    if (options.shield) {
      funcs.push(() => this.redraw());
    }
    if (options.provisional) {
      funcs.push(() => this.provisional.redraw());
    }
    if (options.mask) {
      funcs.push(() => this.mask.redraw());
    }
    await Promise.all(funcs.map((func) => func()));
  }

  /**
   * 设置当前创作工具
   *
   * @param creator
   */
  async setCreator(creator: Creator): Promise<void> {
    this.currentCreator = creator;
    this.emit(ShieldDispatcherNames.creatorChanged, creator);
  }

  /**
   * 尝试渲染创作工具
   *
   * @param e
   */
  _creatingElementOnMovement(e: MouseEvent): IElement {
    if (this.checkCursorPressMovedALittle(e)) {
      return this.store.creatingElement([this._pressDownStageWorldCoord, this._pressMoveStageWorldCoord]);
    }
  }

  /**
   * 更新自由绘制组件
   *
   * @param e
   * @returns
   */
  _updatingArbitraryElementOnMovement(e: MouseEvent): IElement {
    if (this.checkCursorPressMovedALittle(e)) {
      return this.store.creatingArbitraryElement(this._pressMoveStageWorldCoord, false);
    }
  }

  /**
   * 刷新当前舞台世界坐标
   */
  private _refreshStageWorldCoord(e: MouseEvent): void {
    const point = CommonUtils.getEventPosition(e, this.stageRect, this.stageScale);
    this.stageWorldCoord = {
      x: this._originalStageWorldCoord.x - (point.x - this._pressDownPosition.x),
      y: this._originalStageWorldCoord.y - (point.y - this._pressDownPosition.y),
    };
  }

  /**
   *  检查缩放值
   *
   * @param deltaScale
   * @returns
   */
  private _checkScale(deltaScale: number): number {
    let value = clamp(this.stageScale + deltaScale, 0.02, 100);
    value = MathUtils.preciseToFixed(value, 2);
    if (this.stageScale === 0.02) {
      if (deltaScale > 0) {
        value = 0.1;
      }
    }
    return value;
  }

  /**
   * 设置缩放
   *
   * @param value
   */
  async setScale(value: number): Promise<void> {
    this.stageScale = value;
    CanvasUtils.scale = value;
    this.emit(ShieldDispatcherNames.scaleChanged, value);
    this.store.refreshStageElements();
    await this._redrawAll(true);
  }

  /**
   * 滚轮缩放
   *
   * @param deltaScale
   * @param e
   */
  private _handleWheelScale(deltaScale: number, e: MouseEvent): void {
    const prevCursorPosition = CommonUtils.getEventPosition(e, this.stageRect, this.stageScale);
    const cursorCoord = ElementUtils.calcWorldPoint(prevCursorPosition, this.stageCalcParams);
    const value = this._checkScale(deltaScale);
    const cursorCoordOffsetX = (e.clientX - this.stageRect.left) / value;
    const cursorCoordOffsetY = (e.clientY - this.stageRect.top) / value;
    const stageRectCoordX = cursorCoord.x - cursorCoordOffsetX;
    const stageRectCoordY = cursorCoord.y - cursorCoordOffsetY;
    const stageWorldCoordX = stageRectCoordX + this.stageRect.width / 2 / value;
    const stageWorldCoordY = stageRectCoordY + this.stageRect.height / 2 / value;
    this.stageWorldCoord = {
      x: stageWorldCoordX,
      y: stageWorldCoordY,
    };

    this.setScale(value);
  }

  /**
   * 舞台滚动
   *
   * @param delta
   */
  private _handleWheelMove(delta: IPoint): void {
    this.stageWorldCoord.x += delta.x / 2 / this.stageScale;
    this.stageWorldCoord.y += delta.y / 2 / this.stageScale;
    this.store.refreshStageElements();
    this._redrawAll(true);
  }

  /**
   * 给定矩形计算自动适应缩放值
   *
   * @param box
   * @returns
   */
  calcScaleAutoFitValueByBox(box: IPoint[]): number {
    const { width, height } = CommonUtils.calcRectangleSize(box);
    let scale = MathUtils.preciseToFixed(CommonUtils.calcScale(this.stageRect, { width, height }, AutoFitPadding * this.stageScale), 2);
    scale = clamp(scale, 0.02, 1);
    return scale;
  }

  /**
   * 计算自动适应缩放值
   *
   * @returns
   */
  calcScaleAutoFitValue(): number {
    const elementsBox = CommonUtils.getBoxPoints(flatten(this.store.visibleElements.map((element) => element.maxOutlineBoxPoints)));
    return this.calcScaleAutoFitValueByBox(elementsBox);
  }

  /**
   * 计算某个组件的自动适应缩放值
   *
   * @param element
   * @returns
   */
  calcElementAutoFitValue(element: IElement): number {
    return this.calcScaleAutoFitValueByBox(element.maxOutlineBoxPoints);
  }

  /**
   * 舞台自适应
   */
  setScaleAutoFit(): void {
    if (!this.store.isVisibleEmpty) {
      const center = MathUtils.calcCenter(flatten(this.store.visibleElements.map((element) => element.rotateOutlinePathCoords)));
      this.stageWorldCoord = center;
      this.store.refreshStageElements();
      this.setScale(this.calcScaleAutoFitValue());
    } else {
      this.stageWorldCoord = { x: 0, y: 0 };
      this.setScale(1);
    }
  }

  /**
   * 舞台缩小
   */
  setScaleReduce(): void {
    const value = this._checkScale(-0.05);
    this.setScale(value);
  }

  /**
   * 舞台放大
   */
  setScaleIncrease(): void {
    const value = this._checkScale(0.05);
    this.setScale(value);
  }

  /**
   * 舞台100%缩放
   */
  setScale100(): void {
    this.setScale(1);
  }

  /**
   * 处理缩小
   */
  _handleScaleReduce(): void {
    this.setScaleReduce();
  }

  /**
   * 处理放大
   */
  _handleScaleIncrease(): void {
    this.setScaleIncrease();
  }

  /**
   * 处理自适应
   */
  _handleScaleAutoFit(): void {
    this.setScaleAutoFit();
  }

  /**
   * 处理100%缩放
   */
  _handleScale100(): void {
    this.setScale100();
  }

  /**
   * 处理图片粘贴
   *
   * @param imageData
   * @param callback
   */
  async _handleImagePasted(imageData: ImageData, callback?: Function): Promise<void> {
    this._clearStageSelects();
    const element = await this.store.insertImageElement(imageData);
    const nextScale = this.calcElementAutoFitValue(element);
    if (this.stageScale > nextScale) {
      await this.setScale(nextScale);
    } else {
      await this._redrawAll(true);
    }
    callback && callback();
  }

  /**
   * 图片上传
   *
   * @param images
   */
  async uploadImages(images: File[]): Promise<void> {
    if (images.length) {
      await this.event.onImagesUpload(images);
    }
  }

  /**
   * 删除选中元素
   */
  deleteSelectElements(): void {
    if (this.store.isSelectedEmpty) {
      return;
    }
    this.store.deleteSelects();
    this._redrawAll(true);
  }

  /**
   * 处理选中元素删除
   */
  _handleSelectsDelete(): void {
    this.deleteSelectElements();
  }

  /**
   * 选中所有元素
   */
  selectAll(): void {
    this.store.selectAll();
    this._redrawAll(true);
  }

  /**
   * 处理全选
   */
  _handleSelectAll(): void {
    this.selectAll();
  }

  /**
   * 操作取消的处理
   */
  _handleCancel(): void {
    if (this.isArbitraryDrawing) {
      this.commitArbitraryDrawing();
    } else if (!this.store.isEditingEmpty) {
      this.commitEditingDrawing();
    }
  }

  /**
   * 处理组件移动操作
   */
  _handleSelectMoveable(): void {
    if (this.currentCreator.type === HandCreator.type) {
      this.setCreator(MoveableCreator);
      this.cursor.updateStyle();
    }
  }

  /**
   * 处理组件手型操作
   */
  _handleSelectHand(): void {
    if (this.currentCreator.type === MoveableCreator.type) {
      this.setCreator(HandCreator);
      this.cursor.updateStyle();
    }
  }

  /**
   * 处理组件组合操作
   */
  _handleSelectGroup(): void {
    if (this.isElementsBusy) return;
    const group = this.store.selectToGroup();
    if (group) {
      this.store.selectGroup(group);
      this.mask.redraw(true);
    }
  }

  /**
   * 处理组件组合取消操作
   */
  _handleSelectGroupCancel(): void {
    if (this.isElementsBusy) return;
    const groups = this.store.cancelSelectedGroups();
    if (groups) {
      const elements = groups.map((group) => group.getAllSubElements()).flat();
      this.store.deSelectGroups(groups);
      this.store.selectElements(elements);
      this.mask.redraw(true);
    }
  }

  /**
   * 左对齐
   *
   * @param elements
   */
  setElementsAlignLeft(elements: IElement[]): void {
    this.align.setElementsAlignLeft(elements);
    this._redrawAll(true);
  }

  /**
   * 右对齐
   *
   * @param elements
   */
  setElementsAlignRight(elements: IElement[]): void {
    this.align.setElementsAlignRight(elements);
    this._redrawAll(true);
  }

  /**
   * 顶部对齐
   *
   * @param elements
   */
  setElementsAlignTop(elements: IElement[]): void {
    this.align.setElementsAlignTop(elements);
    this._redrawAll(true);
  }

  /**
   * 底部对齐
   *
   * @param elements
   */
  setElementsAlignBottom(elements: IElement[]): void {
    this.align.setElementsAlignBottom(elements);
    this._redrawAll(true);
  }

  /**
   * 水平居中
   *
   * @param elements
   */
  setElementsAlignCenter(elements: IElement[]): void {
    this.align.setElementsAlignCenter(elements);
    this._redrawAll(true);
  }

  /**
   * 垂直居中
   *
   * @param elements
   */
  setElementsAlignMiddle(elements: IElement[]): void {
    this.align.setElementsAlignMiddle(elements);
    this._redrawAll(true);
  }

  /**
   * 水平平均分布
   *
   * @param elements
   */
  setElementsAverageVertical(elements: IElement[]): void {
    this.align.setElementsAverageVertical(elements);
    this._redrawAll(true);
  }

  /**
   * 垂直平均分布
   *
   * @param elements
   */
  setElementsAverageHorizontal(elements: IElement[]): void {
    this.align.setElementsAverageHorizontal(elements);
    this._redrawAll(true);
  }

  /**
   * 提交自由绘制
   */
  async commitArbitraryDrawing(): Promise<void> {
    if (this.isArbitraryDrawing) {
      this._isPressDown = false;
      this.store.finishCreatingElement();
      await this._redrawAfterCreated();
    }
  }

  /**
   * 提交编辑绘制
   */
  async commitEditingDrawing(): Promise<void> {
    if (!this.store.isEditingEmpty) {
      this.store.endEditingElements(this.store.editingElements);
      this._isElementsEditing = false;
      await this._redrawAll(true);
    }
  }
}
