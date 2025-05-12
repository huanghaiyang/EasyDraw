import { MinCursorMXD, MinCursorMYD } from "@/types/constants";
import { IPoint, ISize, TextEditingStates, ShieldDispatcherNames } from "@/types";
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
import { clamp } from "lodash";
import StageConfigure from "@/modules/stage/StageConfigure";
import IStageConfigure from "@/types/IStageConfigure";
import IElement, { ElementObject, IElementText, RefreshSubOptions, TreeNodeDropType } from "@/types/IElement";
import IStageStore from "@/types/IStageStore";
import IStageSelection from "@/types/IStageSelection";
import { IDrawerHtml, IDrawerMask, IDrawerProvisional } from "@/types/IStageDrawer";
import IStageShield, { StageCalcParams, StageShieldElementsStatus } from "@/types/IStageShield";
import IStageCursor from "@/types/IStageCursor";
import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator";
import IStageEvent from "@/types/IStageEvent";
import CanvasUtils from "@/utils/CanvasUtils";
import { FontStyle, FontStyler, StrokeTypes, TextCase, TextDecoration, TextVerticalAlign } from "@/styles/ElementStyles";
import IController from "@/types/IController";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import MathUtils from "@/utils/MathUtils";
import { AutoFitPadding } from "@/types/Stage";
import IStageAlign, { IStageAlignFuncs } from "@/types/IStageAlign";
import StageAlign from "@/modules/stage/StageAlign";
import { HandCreator, MoveableCreator } from "@/types/CreatorDicts";
import CornerController from "@/modules/handler/controller/CornerController";
import DOMUtils from "@/utils/DOMUtils";
import RenderQueue from "@/modules/render/RenderQueue";
import ICommand, { ElementActionTypes, ElementCommandTypes, ElementsActionParam, ICommandElementObject, IElementCommandPayload } from "@/types/ICommand";
import LodashUtils from "@/utils/LodashUtils";
import { IElementGroup } from "@/types/IElementGroup";
import DrawerHtml from "@/modules/stage/drawer/DrawerHtml";
import ElementText from "@/modules/elements/ElementText";
import IUndoRedo from "@/types/IUndoRedo";
import UndoRedo from "@/modules/base/UndoRedo";
import { TextEditorPressTypes, TextFontStyleUpdateTypes } from "@/types/IText";
import GlobalConfig from "@/config";
import { computed, makeObservable, observable, reaction } from "mobx";
import { nanoid } from "nanoid";
import TextElementUtils from "@/modules/elements/utils/TextElementUtils";
import CommandHelper from "@/modules/command/helpers/CommandHelper";

export default class StageShield extends DrawerBase implements IStageShield, IStageAlignFuncs {
  // 当前正在使用的创作工具
  currentCreator: Creator;
  // 鼠标操作
  cursor: IStageCursor;
  // 遮罩画板用以绘制鼠标样式,工具图标等
  mask: IDrawerMask;
  // 前景画板
  provisional: IDrawerProvisional;
  // html画板
  html: IDrawerHtml;
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
  // 撤销
  undoRedo: IUndoRedo<IElementCommandPayload, boolean>;
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
  // 组件状态
  elementsStatus: StageShieldElementsStatus = StageShieldElementsStatus.NONE;
  // 光标移动队列
  private _cursorMoveQueue: RenderQueue = new RenderQueue();
  // 重绘队列
  private _redrawQueue: RenderQueue = new RenderQueue();
  // 重绘标志
  private _shouldRedraw: boolean = false;
  // 最近一次鼠标按下时间戳
  private _latestMousedownTimestamp: number = 0;
  // 是否在鼠标抬起时选中顶层组件
  private _shouldSelectTopAWhilePressUp: boolean = true;

  // 画布矩形顶点坐标
  get stageRectPoints(): IPoint[] {
    return CommonUtils.getRectBySize(this.stageRect);
  }
  // 舞台矩形顶点坐标
  get stageWordRectCoords(): IPoint[] {
    return CommonUtils.getBoxByCenter(this.stageWorldCoord, { width: this.stageRect.width / this.stageScale, height: this.stageRect.height / this.stageScale });
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
  // 舞台是否在移动
  private _isStageMoving: boolean = false;
  // 移动舞台前的原始坐标
  private _originalStageWorldCoord: IPoint;
  // 编辑前的原始数据
  private _originalEditingDataList: Array<ICommandElementObject>;

  // 组件是否处于活动中
  get isElementsBusy(): boolean {
    return (
      [StageShieldElementsStatus.ROTATING, StageShieldElementsStatus.MOVING, StageShieldElementsStatus.TRANSFORMING, StageShieldElementsStatus.CORNER_MOVING].includes(this.elementsStatus) ||
      this.isTextCreating ||
      this.isTextEditing ||
      this.isArbitraryDrawing ||
      this.isArbitraryEditing
    );
  }

  // 舞台是否在移动
  get isStageMoving(): boolean {
    return this._isStageMoving;
  }

  // 是否是绘制工具
  get isDrawerActive(): boolean {
    return [CreatorCategories.shapes, CreatorCategories.freedom].includes(this.currentCreator?.category);
  }

  // 是否是文本工具
  get isTextCreating(): boolean {
    return [CreatorCategories.text].includes(this.currentCreator?.category);
  }

  get isTextEditing(): boolean {
    return !this.store.isEditingEmpty && this.store.editingElements[0].model.type === CreatorTypes.text;
  }

  // 是否是手绘工具
  get isHandActive(): boolean {
    return this.currentCreator?.type === CreatorTypes.hand;
  }

  // 是否是移动工具
  get isMoveableActive(): boolean {
    return this.currentCreator?.type === CreatorTypes.moveable;
  }

  // 是否是任意绘制工具
  get isArbitraryDrawing(): boolean {
    return this.currentCreator?.type === CreatorTypes.arbitrary;
  }

  get isArbitraryEditing(): boolean {
    return !this.store.isEditingEmpty && this.store.editingElements[0].model.type === CreatorTypes.arbitrary;
  }

  // 舞台计算参数
  get stageCalcParams(): StageCalcParams {
    return {
      rect: this.stageRect,
      worldCoord: this.stageWorldCoord,
      scale: this.stageScale,
    };
  }

  // 移动偏移量
  get movingOffset(): IPoint {
    return {
      x: Math.floor(this._pressMoveStageWorldCoord.x - this._pressDownStageWorldCoord.x),
      y: Math.floor(this._pressMoveStageWorldCoord.y - this._pressDownStageWorldCoord.y),
    };
  }

  constructor() {
    super();
    this.configure = new StageConfigure();
    this.event = new StageEvent(this);
    this.store = new StageStore(this);
    this.cursor = new StageCursor(this);
    this.provisional = new DrawerProvisional(this);
    this.html = new DrawerHtml(this);
    this.selection = new StageSelection(this);
    this.align = new StageAlign(this);
    this.mask = new DrawerMask(this);
    this.undoRedo = new UndoRedo();
    this.renderer = new ShieldRenderer(this);
    makeObservable(this, {
      stageCalcParams: computed,
      stageRect: observable,
      stageWorldCoord: observable,
      stageScale: observable,
    });
    reaction(
      () => this.stageCalcParams,
      () => {
        GlobalConfig.stageCalcParams = this.stageCalcParams;
      },
    );
    this._requestAnimationRedraw();
    window.shield = this;
  }

  /**
   * 添加重绘任务
   *
   * @param force
   */
  private async _addRedrawTask(force?: boolean): Promise<void> {
    return new Promise(resolve => {
      this._redrawQueue.add({
        run: async () => {
          await Promise.all([this.redraw(force), this.mask.redraw(), this.provisional.redraw()]);
          resolve();
        },
      });
    });
  }

  /**
   * 重绘所有组件
   *
   * TODO 有性能问题，比较直观的浮现方式
   * 1. 打开控制台
   * 2. 绘制一个矩形
   * 3. 立刻拖动
   * 4. 发现拖动缓慢
   */
  private async _requestAnimationRedraw(): Promise<void> {
    requestAnimationFrame(async () => {
      await this._addRedrawTask(this._shouldRedraw);
      this._shouldRedraw = false;
      // 如果存在编辑中的文本组件
      if (!this.store.isEditingTextEmpty && !DOMUtils.isFocusOnInput()) {
        this.html.focusTextCursorInput();
      }
      await this._requestAnimationRedraw();
    });
  }

  /**
   * 根据数据创建更新命令
   *
   * @param uDataList
   * @param rDataList
   * @param id
   */
  private async _addUpdatedCommandByDataList(uDataList: ICommandElementObject[], rDataList: ICommandElementObject[], id?: string): Promise<void> {
    const command = CommandHelper.createElementsChangedCommand(uDataList, rDataList, ElementCommandTypes.ElementsUpdated, this.store, id);
    this.undoRedo.add(command);
  }

  /**
   * 创建组件平移命令
   *
   * @param elements
   * @param elementsUpdateFunction
   */
  private async _createTranslateCommand(elements: IElement[], elementsUpdateFunction: () => Promise<void>): Promise<void> {
    elements = this._flatWithAncestors(elements);
    // 记录原始数据
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toTranslateJson(), type: ElementActionTypes.Updated })));
    await elementsUpdateFunction();
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toTranslateJson(), type: ElementActionTypes.Updated })));
    await this._addUpdatedCommandByDataList(uDataList, rDataList);
  }

  /**
   * 设置组件位置
   *
   * @param elements
   * @param value
   */
  async setElementsPosition(elements: IElement[], value: IPoint): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.store.setElementsPosition(elements, value);
      this._refreshAncesorsByDetachedElements(elements);
    });
    elements.forEach(element => {
      element.onPositionChanged();
      this._refreshAncestorsTransformed(element);
    });
    this.selection.refresh();
    this._shouldRedraw = true;
  }

  /**
   * 创建组件变换命令
   *
   * @param elements
   * @param elementsUpdateFunction
   */
  private async _createTransformCommand(elements: IElement[], elementsUpdateFunction: () => Promise<void>): Promise<void> {
    elements = this._flatWithAncestors(elements);
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toTransformJson(), type: ElementActionTypes.Updated })));
    await elementsUpdateFunction();
    await this._reflowTextIfy(elements, true);
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toTransformJson(), type: ElementActionTypes.Updated })));
    await this._addUpdatedCommandByDataList(uDataList, rDataList);
  }

  /**
   * 设置组件宽度
   *
   * @param elements
   * @param value
   */
  async setElementsWidth(elements: IElement[], value: number): Promise<void> {
    await this._createTransformCommand(elements, async () => {
      await this.store.setElementsWidth(elements, value);
      this._refreshAncesorsByDetachedElements(elements);
      elements.forEach(element => {
        element.onWidthChanged();
        this._refreshAncestorsTransformed(element);
      });
      this.selection.refresh();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件高度
   *
   * @param elements
   * @param value
   */
  async setElementsHeight(elements: IElement[], value: number): Promise<void> {
    await this._createTransformCommand(elements, async () => {
      await this.store.setElementsHeight(elements, value);
      this._refreshAncesorsByDetachedElements(elements);
      elements.forEach(element => {
        element.onHeightChanged();
        this._refreshAncestorsTransformed(element);
      });
      this.selection.refresh();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件Y倾斜角度
   *
   * @param elements
   * @param value
   */
  async setElementsLeanYAngle(elements: IElement[], value: number): Promise<void> {
    await this._createTransformCommand(elements, async () => {
      await this.store.setElementsLeanYAngle(elements, value);
      this._refreshAncesorsByDetachedElements(elements);
      elements.forEach(element => {
        element.onLeanyAngleChanged();
        this._refreshAncestorsTransformed(element);
      });
      this.selection.refresh();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件角度
   *
   * @param elements
   * @param value
   */
  async setElementsAngle(elements: IElement[], value: number): Promise<void> {
    await this._createTransformCommand(elements, async () => {
      await this.store.setElementsAngle(elements, value);
      this._refreshAncesorsByDetachedElements(elements);
      elements.forEach(element => {
        element.onAngleChanged();
        this._refreshAncestorsTransformed(element);
      });
      this.selection.refresh();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件圆角
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsCorners(elements: IElement[], value: number, index?: number): Promise<void> {
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toCornerJson(), type: ElementActionTypes.Updated })));
    await this.store.setElementsCorners(elements, value, index);
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toCornerJson(), type: ElementActionTypes.Updated })));
    this._addUpdatedCommandByDataList(uDataList, rDataList);
    elements.forEach(element => element.onCornerChanged());
    this._shouldRedraw = true;
  }

  /**
   * 创建边框更新命令
   *
   * @param elements
   * @param elementsUpdateFunction
   */
  private async _createStrokeCommand(elements: IElement[], elementsUpdateFunction: () => Promise<void>): Promise<void> {
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toStrokesJson(), type: ElementActionTypes.Updated })));
    await elementsUpdateFunction();
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toStrokesJson(), type: ElementActionTypes.Updated })));
    this._addUpdatedCommandByDataList(uDataList, rDataList);
  }

  /**
   * 设置组件边框类型
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeType(elements: IElement[], value: StrokeTypes, index: number): Promise<void> {
    await this._createStrokeCommand(elements, async () => {
      await this.store.setElementsStrokeType(elements, value, index);
    });
    elements.forEach(element => element.onStrokeTypeChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件边框宽度
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeWidth(elements: IElement[], value: number, index: number): Promise<void> {
    await this._createStrokeCommand(elements, async () => {
      await this.store.setElementsStrokeWidth(elements, value, index);
    });
    elements.forEach(element => element.onStrokeWidthChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件边框颜色
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeColor(elements: IElement[], value: string, index: number): Promise<void> {
    await this._createStrokeCommand(elements, async () => {
      await this.store.setElementsStrokeColor(elements, value, index);
    });
    elements.forEach(element => element.onStrokeColorChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件边框颜色透明度
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeColorOpacity(elements: IElement[], value: number, index: number): Promise<void> {
    await this._createStrokeCommand(elements, async () => {
      await this.store.setElementsStrokeColorOpacity(elements, value, index);
    });
    elements.forEach(element => element.onStrokeColorOpacityChanged());
    this._shouldRedraw = true;
  }

  /**
   * 添加组件描边
   *
   * @param elements
   * @param prevIndex
   */
  async addElementsStroke(elements: IElement[], prevIndex: number): Promise<void> {
    await this._createStrokeCommand(elements, async () => {
      await this.store.addElementsStroke(elements, prevIndex);
    });
    elements.forEach(element => element.onStrokeAdded());
    this._shouldRedraw = true;
  }

  /**
   * 删除组件描边
   *
   * @param elements
   * @param index
   */
  async removeElementsStroke(elements: IElement[], index: number): Promise<void> {
    await this._createStrokeCommand(elements, async () => {
      await this.store.removeElementsStroke(elements, index);
    });
    elements.forEach(element => element.onStrokeRemoved());
    this._shouldRedraw = true;
  }

  /**
   * 创建填充更新命令
   *
   * @param elements
   * @param elementsUpdateFunction
   */
  private async _createFillCommand(elements: IElement[], elementsUpdateFunction: () => Promise<void>): Promise<void> {
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toFillsJson(), type: ElementActionTypes.Updated })));
    await elementsUpdateFunction();
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toFillsJson(), type: ElementActionTypes.Updated })));
    this._addUpdatedCommandByDataList(uDataList, rDataList);
  }

  /**
   * 设置组件填充颜色
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsFillColor(elements: IElement[], value: string, index: number): Promise<void> {
    await this._createFillCommand(elements, async () => {
      await this.store.setElementsFillColor(elements, value, index);
    });
    elements.forEach(element => element.onFillColorChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件填充颜色透明度
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsFillColorOpacity(elements: IElement[], value: number, index: number): Promise<void> {
    await this._createFillCommand(elements, async () => {
      await this.store.setElementsFillColorOpacity(elements, value, index);
    });
    elements.forEach(element => element.onFillColorOpacityChanged());
    this._shouldRedraw = true;
  }

  /**
   * 添加组件填充
   *
   * @param elements
   * @param prevIndex
   */
  async addElementsFill(elements: IElement[], prevIndex: number): Promise<void> {
    await this._createFillCommand(elements, async () => {
      await this.store.addElementsFill(elements, prevIndex);
    });
    elements.forEach(element => element.onFillAdded());
    this._shouldRedraw = true;
  }

  /**
   * 删除组件填充
   *
   * @param elements
   * @param index
   */
  async removeElementsFill(elements: IElement[], index: number): Promise<void> {
    await this._createFillCommand(elements, async () => {
      await this.store.removeElementsFill(elements, index);
    });
    elements.forEach(element => element.onFillRemoved());
    this._shouldRedraw = true;
  }

  /**
   * 创建字体样式更新命令
   *
   * @param elements
   * @param elementsUpdateFunction
   * @param updateType
   */
  private async _createFontStyleCommand(elements: IElement[], elementsUpdateFunction: () => Promise<void>, updateType: TextFontStyleUpdateTypes): Promise<void> {
    const shouldRelationUndoCommand = TextElementUtils.shouldRelationUndoCommand(updateType);
    const commandId = nanoid();
    const uDataList = await Promise.all(
      elements.map(async element => {
        if (shouldRelationUndoCommand && element.isEditing && element instanceof ElementText) {
          element.refreshUndoCommandObject();
        }
        return { model: await element.toFontStyleJson(), type: ElementActionTypes.Updated };
      }),
    );
    await elementsUpdateFunction();
    const rDataList = await Promise.all(
      elements.map(async element => {
        if (shouldRelationUndoCommand && element.isEditing && element instanceof ElementText) {
          element.relationUndoCommand(commandId);
        }
        return { model: await element.toFontStyleJson(), type: ElementActionTypes.Updated };
      }),
    );
    this._addUpdatedCommandByDataList(uDataList, rDataList, commandId);
  }

  /**
   * 重新排版文本
   *
   * @param elements
   * @param force 是否强制重新排版
   * @param changed 是否是因为文本内容变化才重新排版
   */
  private async _reflowTextIfy(elements: IElement[], force?: boolean, changed?: boolean): Promise<IElementText[]> {
    const reflowedElements: IElementText[] = [];
    await Promise.all(
      elements.map(async element => {
        if (element instanceof ElementText) {
          // 文本改变必定会引发重新排版
          const reflowed = element.reflowText(force || changed);
          if (reflowed) {
            reflowedElements.push(element);
          }
        }
      }),
    );
    if (reflowedElements.length > 0) {
      await this._addRedrawTask(true);
      reflowedElements.forEach(element => element.onTextReflowed(changed));
      await Promise.all(elements.map(async element => element instanceof ElementText && element.refreshTextCursors()));
      await this._addRedrawTask(true);
    }
    return reflowedElements;
  }

  /**
   * 设置组件文本对齐方式
   *
   * @param elements
   * @param value
   */
  async setElementsTextAlign(elements: IElement[], value: CanvasTextAlign): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextAlign(elements, value);
        await this._addRedrawTask(true);
        await this._reflowTextIfy(elements, true);
        elements.forEach(element => element.onTextAlignChanged());
      },
      TextFontStyleUpdateTypes.FONT_TEXT_ALIGN,
    );
  }

  /**
   * 设置组件文本垂直对齐方式
   *
   * @param elements
   * @param value
   */
  async setElementsTextVerticalAlign(elements: IElement[], value: TextVerticalAlign): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextVerticalAlign(elements, value);
        await this._addRedrawTask(true);
        await this._reflowTextIfy(elements, true);
        elements.forEach(element => element.onTextVerticalAlignChanged());
      },
      TextFontStyleUpdateTypes.FONT_TEXT_VERTICAL_ALIGN,
    );
  }

  /**
   * 设置组件文本基线

 * @param elements
   * @param value
   */
  async setElementsTextBaseline(elements: IElement[], value: CanvasTextBaseline): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextBaseline(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_TEXT_BASELINE,
    );
    elements.forEach(element => element.onTextBaselineChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件字体样式
   *
   * @param elements
   * @param value
   */
  async setElementsFontStyler(elements: IElement[], value: FontStyler): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontStyler(elements, value);
        await this._addRedrawTask(true);
        await this._reflowTextIfy(elements, true);
        elements.forEach(element => element.onFontStylerChanged());
      },
      TextFontStyleUpdateTypes.FONT_STYLER,
    );
  }

  /**
   * 设置组件字体大小
   *
   * @param elements
   * @param value
   */
  async setElementsFontSize(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontSize(elements, value);
        await this._addRedrawTask(true);
        await this._reflowTextIfy(elements, true);
        elements.forEach(element => {
          element.onFontSizeChanged();
          if (!(element as IElementText).isSelectionAvailable && element.fontLineHeightAutoFit) {
            element.onFontLineHeightChanged();
          }
        });
      },
      TextFontStyleUpdateTypes.FONT_SIZE,
    );
  }

  /**
   * 设置组件字体
   *
   * @param elements
   * @param value
   */
  async setElementsFontFamily(elements: IElement[], value: string): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontFamily(elements, value);
        await this._addRedrawTask(true);
        await this._reflowTextIfy(elements, true);
        elements.forEach(element => element.onFontFamilyChanged());
      },
      TextFontStyleUpdateTypes.FONT_FAMILY,
    );
  }

  /**
   * 设置组件字体行高
   *
   * @param elements
   * @param value
   */
  async setElementsFontLineHeight(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontLineHeight(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_LINE_HEIGHT,
    );
    elements.forEach(element => {
      element.onFontLineHeightChanged();
      element.onFontLineHeightFactorChanged();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件字体行高倍数
   *
   * @param elements
   * @param value
   */
  async setElementsFontLineHeightFactor(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontLineHeightFactor(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_LINE_HEIGHT_FACTOR,
    );
    elements.forEach(element => {
      element.onFontLineHeightFactorChanged();
      element.onFontLineHeightChanged();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件字体行高自动适应
   *
   * @param elements
   * @param value
   */
  async setElementsFontLineHeightAutoFit(elements: IElement[], value: boolean): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontLineHeightAutoFit(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_LINE_HEIGHT_AUTO_FIT,
    );
    elements.forEach(element => {
      element.onFontLineHeightAutoFitChanged();
      element.onFontLineHeightChanged();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件字体颜色
   *
   * @param elements
   * @param value
   */
  async setElementsFontColor(elements: IElement[], value: string): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontColor(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_COLOR,
    );
    elements.forEach(element => element.onFontColorChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件字体颜色透明度
   *
   * @param elements
   * @param value
   */
  async setElementsFontColorOpacity(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontColorOpacity(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_COLOR_OPACITY,
    );
    elements.forEach(element => element.onFontColorOpacityChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件字间距
   *
   * @param elements
   * @param value
   */
  async setElementsFontLetterSpacing(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsFontLetterSpacing(elements, value);
        await this._addRedrawTask(true);
        await this._reflowTextIfy(elements, true);
        elements.forEach(element => element.onFontLetterSpacingChanged());
      },
      TextFontStyleUpdateTypes.FONT_LETTER_SPACING,
    );
  }

  /**
   * 设置组件文本装饰
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecoration(elements: IElement[], value: TextDecoration): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextDecoration(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_TEXT_DECORATION,
    );
    elements.forEach(element => element.onTextDecorationChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件文本装饰颜色
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecorationColor(elements: IElement[], value: string): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextDecorationColor(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_TEXT_DECORATION_COLOR,
    );
    elements.forEach(element => element.onTextDecorationColorChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件文本装饰透明度
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecorationOpacity(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextDecorationOpacity(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_TEXT_DECORATION_OPACITY,
    );
    elements.forEach(element => element.onTextDecorationOpacityChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件文本装饰
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecorationThickness(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextDecorationThickness(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_TEXT_DECORATION_THICKNESS,
    );
    elements.forEach(element => element.onTextDecorationThicknessChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置段落间距
   *
   * @param elements
   * @param value
   */
  async setElementsParagraphSpacing(elements: IElement[], value: number): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsParagraphSpacing(elements, value);
      },
      TextFontStyleUpdateTypes.FONT_PARAGRAPH_SPACING,
    );
    elements.forEach(element => element.onParagraphSpacingChanged());
    this._shouldRedraw = true;
  }

  /**
   * 设置组件文本装饰
   *
   * @param elements
   * @param value
   */
  async setElementsTextCase(elements: IElement[], value: TextCase): Promise<void> {
    await this._createFontStyleCommand(
      elements,
      async () => {
        await this.store.setElementsTextCase(elements, value);
        await this._addRedrawTask(true);
        await this._reflowTextIfy(elements, true);
        elements.forEach(element => element.onTextCaseChanged());
      },
      TextFontStyleUpdateTypes.FONT_TEXT_CASE,
    );
  }

  /**
   * 锁定比例
   *
   * @param elements
   * @param value
   */
  async setElementsRatioLocked(elements: IElement[], value: boolean): Promise<void> {
    await this.store.setElementsRatioLocked(elements, value);
    elements.forEach(element => element.onRatioLockedChanged());
  }

  /**
   * 设置组件旋转角度
   *
   * @param elements
   * @param value
   */
  async setElementsRotate(elements: IElement[], value: number): Promise<void> {
    await this._createTransformCommand(elements, async () => {
      await this.store.setElementsRotate(elements, value);
      this._refreshAncesorsByDetachedElements(elements);
      elements.forEach(element => {
        element.onAngleChanged();
        this._refreshAncestorsTransformed(element);
      });
      this.selection.refresh();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件水平翻转
   *
   * @param elements
   */
  async setElementsFlipX(elements: IElement[]): Promise<void> {
    await this._createTransformCommand(elements, async () => {
      await this.store.setElementsFlipX(elements);
      this._refreshAncesorsByDetachedElements(elements);
      elements.forEach(element => {
        element.onFlipXChanged();
        this._refreshAncestorsTransformed(element);
      });
      this.selection.refresh();
    });
    this._shouldRedraw = true;
  }

  /**
   * 设置组件垂直翻转
   *
   * @param elements
   */
  async setElementsFlipY(elements: IElement[]): Promise<void> {
    await this._createTransformCommand(elements, async () => {
      await this.store.setElementsFlipY(elements);
      this._refreshAncesorsByDetachedElements(elements);
      elements.forEach(element => {
        element.onFlipYChanged();
        this._refreshAncestorsTransformed(element);
      });
      this.selection.refresh();
    });
    this._shouldRedraw = true;
  }

  /**
   * 初始化
   *
   * @param renderEl
   */
  async init(renderEl: HTMLDivElement): Promise<void> {
    this.renderEl = renderEl;
    await Promise.all([this.initNode(), this.event.init()]);
    this._addEventListeners();
  }

  /**
   * 添加一个任务到鼠标移动队列
   *
   * @param task
   */
  private _addCursorQueueTask(task: () => Promise<void>): void {
    this._cursorMoveQueue.add({
      run: task,
    });
  }

  /**
   * 添加事件监听
   */
  private _addEventListeners() {
    this.event.on("resize", this._refreshSize.bind(this));
    this.event.on("cursorMove", e => this._addCursorQueueTask(() => this._handleCursorMove(e)));
    this.event.on("pressDown", e => this._addCursorQueueTask(() => this._handlePressDown(e)));
    this.event.on("pressUp", e => this._addCursorQueueTask(() => this._handlePressUp(e)));
    this.event.on("cursorLeave", this._handleCursorLeave.bind(this));
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
    this.event.on("selectCopy", this._handleSelectCopy.bind(this));
    this.event.on("pasteElements", this._handlePasteElements.bind(this));
    this.event.on("cancel", this._handleCancel.bind(this));
    this.event.on("selectMoveable", this._handleSelectMoveable.bind(this));
    this.event.on("selectHand", this._handleSelectHand.bind(this));
    this.event.on("groupAdd", this._handleGroupAdd.bind(this));
    this.event.on("groupRemove", this._handleGroupCancel.bind(this));
    this.event.on("undo", this._handleUndo.bind(this));
    this.event.on("redo", this._handleRedo.bind(this));
    this.html.on("textInput", this._handleTextInput.bind(this));
    this.html.on("textUpdate", this._handleTextUpdate.bind(this));
  }

  /**
   * 初始化画布
   */
  initNode(): HTMLCanvasElement | HTMLDivElement {
    super.initNode();

    const maskCanvas = this.mask.initNode();
    const provisionalCanvas = this.provisional.initNode();
    const htmlDrawer = this.html.initNode();

    this.renderEl.insertBefore(maskCanvas, this.renderEl.firstChild);
    this.renderEl.insertBefore(htmlDrawer, this.mask.node);
    this.renderEl.insertBefore(provisionalCanvas, this.html.node);

    this.node.id = "shield";
    this.renderEl.insertBefore(this.node, this.provisional.node);

    return this.node;
  }

  /**
   * 执行组件操作
   */
  private async _doElementsOperating(): Promise<void> {
    switch (this.elementsStatus) {
      case StageShieldElementsStatus.ROTATING: {
        this._rotateElements();
        break;
      }
      case StageShieldElementsStatus.MOVING: {
        this._dragElements();
        break;
      }
      case StageShieldElementsStatus.TRANSFORMING: {
        this._transformElements();
        break;
      }
      case StageShieldElementsStatus.CORNER_MOVING: {
        this._movingElementsCorner();
        break;
      }
    }
  }

  /**
   * 处理祖先组件
   *
   * @param elements
   * @param func
   */
  private _processAncestorsByElements(elements: IElement[], func: (group: IElementGroup) => void): void {
    const ancestors = this.store.getAncestorsByDetachedElements(elements);
    ancestors.forEach(func);
  }

  /**
   * 刷新祖先组件的原始数据
   *
   * @param elements
   */
  private _refreshAncesorGroupsOriginals(elements: IElement[]): void {
    this._processAncestorsByElements(elements, group => group.refreshOriginals());
  }

  /**
   * 刷新组件的祖先组件
   *
   * @param elements
   */
  private _refreshAncesorsByDetachedElements(elements: IElement[]): void {
    this._processAncestorsByElements(elements, group => (group as IElementGroup).refreshBySubs());
  }

  /**
   * 当组件操作时更新状态
   */
  private async _updateStatusWhileElementsOperating(): Promise<void> {
    if (
      this.elementsStatus === StageShieldElementsStatus.MOVE_READY ||
      (![StageShieldElementsStatus.ROTATING, StageShieldElementsStatus.TRANSFORMING, StageShieldElementsStatus.CORNER_MOVING].includes(this.elementsStatus) &&
        this.store.isSelectedContainsTarget() &&
        this.store.isEditingEmpty)
    ) {
      // 已经确定是拖动操作的情况下，做如下逻辑判断
      if (this.elementsStatus !== StageShieldElementsStatus.MOVING) {
        this._refreshAncesorGroupsOriginals(this.store.detachedSelectedElements);
      }
      this.elementsStatus = StageShieldElementsStatus.MOVING;
    }
  }

  /**
   * 鼠标移动事件
   *
   * @param e
   */
  async _handleCursorMove(e: MouseEvent): Promise<void> {
    this.cursor.transform(e);
    this.cursor.updateStyle(e);

    // 只有在未对组件进行旋转/移动/形变的情况下才会启用组件命中逻辑
    if (this.isMoveableActive && !this.isElementsBusy) {
      this.selection.hitTargetElements(this.cursor.worldValue);
    }

    // 判断鼠标是否按下
    if (this._isPressDown) {
      this.calcPressMove(e);
      if (this.isTextEditing) {
        this._tryRetrieveTextCursor(TextEditorPressTypes.PRESS_MOVE, true);
      } else if (this.isArbitraryDrawing) {
        // 移动过程中创建组件
        this._updatingArbitraryElementOnMovement(e);
        this.selection.refreshTransformerModels();
      } else if (this.isDrawerActive) {
        // 移动过程中创建组件
        this._creatingElementOnMovement(e);
        this.selection.refreshTransformerModels();
      } else if (this.isMoveableActive) {
        // 如果是选择模式
        if (this.store.isSelectedEmpty) {
          // 没有选中组件，那么就创建一个范围组件
          this._createRange();
        } else if (this.checkCursorPressMovedALittle(e)) {
          // 更新当前组件状态
          await this._updateStatusWhileElementsOperating();
          // 处理组件操作
          await this._doElementsOperating();
        }
      } else if (this.isHandActive) {
        this._isStageMoving = true;
        this._dragStage(e);
      }
    } else if (this.isMoveableActive) {
      this._tryActiveController();
    }
    // 如果正在操作组件，那么就清除目标组件的isTarget状态
    if (this.isElementsBusy) {
      this.store.cancelTargetElements();
    }
  }

  /**
   * 尝试激活控制器
   *
   * @returns
   */
  private _tryActiveController(): IController {
    return this.selection.tryActiveController(this.cursor.worldValue);
  }

  /**
   * 触发编辑组件的舞台变化事件
   */
  private triggetEditingElementsStageChanged(): void {
    requestAnimationFrame(() => {
      this.store.editingElements.forEach(element => element.onStageChanged());
    });
  }

  /**
   * 舞台拖动
   *
   * @param e
   */
  private _dragStage(e: MouseEvent): void {
    this._refreshStageWorldCoord(e);
    this.store.refreshStageElements();
    this.selection.refresh();
    this.triggetEditingElementsStageChanged();
    this._shouldRedraw = true;
  }

  /**
   * 拖动组件移动
   */
  private _dragElements(): void {
    const { selectedElements } = this.store;
    this.store.updateElementsTranslate(selectedElements, this.movingOffset);
    this._refreshAncesorsByDetachedElements(selectedElements);
    selectedElements.forEach(element => {
      element.isDragging = true;
      element.onTranslating();
    });
    this.selection.refresh();
    this._shouldRedraw = true;
  }

  /**
   * 组件半径
   */
  private _movingElementsCorner(): void {
    const { selectedElements } = this.store;
    this.store.updateElementsCorner(selectedElements, this.movingOffset);
    selectedElements.forEach(element => {
      element.isCornerMoving = true;
      element.onCornerChanging();
    });
    this._shouldRedraw = true;
  }

  /**
   * 组件形变
   */
  private _transformElements(): void {
    const { selectedElements } = this.store;
    if (this.store.isMultiSelected) {
      this.selection.rangeElement.isTransforming = true;
      this.store.updateElementsTransform([this.selection.rangeElement], this.movingOffset);
    } else {
      this.store.updateElementsTransform(selectedElements, this.movingOffset);
    }
    this._refreshAncesorsByDetachedElements(selectedElements);
    selectedElements.forEach(element => {
      element.isTransforming = true;
      element.onTransforming();
    });
    this.selection.refresh();
    this._shouldRedraw = true;
  }

  /**
   * 旋转组件
   */
  private _rotateElements(): void {
    const { selectedElements, nonHomologousElements } = this.store;
    if (this.store.isMultiSelected) {
      this.selection.rangeElement.isRotating = true;
      this.store.updateElementsRotation([this.selection.rangeElement], this._pressMovePosition);
    } else {
      this.store.updateElementsRotation(nonHomologousElements, this._pressMovePosition);
    }
    this._refreshAncesorsByDetachedElements(selectedElements);
    selectedElements.forEach(element => {
      element.isRotating = true;
      element.onRotating();
    });
    this.selection.refresh();
    this._shouldRedraw = true;
  }

  /**
   * 创建选区
   */
  private _createRange(): void {
    // 计算选区
    const rangeCoords = CommonUtils.getBoxByPoints([this._pressDownStageWorldCoord, this._pressMoveStageWorldCoord]);
    // 更新选区，命中组件
    this.selection.setRange(rangeCoords);
  }

  /**
   * 鼠标离开画布事件
   */
  async _handleCursorLeave(): Promise<void> {
    this.cursor.clear();
    this.cursor.setStyle("default");
  }

  /**
   * 预处理旋转状态
   *
   * @param controller
   */
  private _preProcessRotationStates(controller: IController): void {
    this.store.updateElementById(controller.host.id, {
      isRotatingTarget: true,
    });
    // 如果是选区旋转，则只处理选区组件
    if (this.store.isMultiSelected) {
      // 计算选区旋转的中心点等数据信息
      this.store.refreshElementsRotationStates([this.selection.rangeElement], this._pressDownPosition);
    } else {
      this.store.refreshRotatingStates(this._pressDownPosition);
    }
  }

  /**
   * 处理当鼠标按下时的组件是否应该选中
   *
   * @param e
   */
  private _processSelectWhilePressDown(e: MouseEvent): void {
    // 获取鼠标点击的组件
    const targetElement = this.selection.getElementOnCoord(this.cursor.worldValue);
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
          // 准备拖动
          this.elementsStatus = StageShieldElementsStatus.MOVE_READY;
        }
      }
    }
  }

  /**
   * 鼠标按下事件
   *
   * @param e
   */
  async _handlePressDown(e: MouseEvent): Promise<void> {
    this._latestMousedownTimestamp = window.performance.now();
    this._isPressDown = true;
    this.calcPressDown(e);

    if (this.isTextEditing) {
      if (this._isCursorOnEditingElement()) {
        this._tryRetrieveTextCursor(TextEditorPressTypes.PRESS_DOWN, false);
      } else {
        await this._commitEidting();
        this._shouldSelectTopAWhilePressUp = false;
      }
    } else if (this.isTextCreating) {
      this.html.createTextInput(this.cursor.value);
    } else if (this.isDrawerActive && !this.store.isSelectedEqCreating()) {
      // 如果当前是绘制模式或则是开始绘制自由多边形，则清空选区
      this._clearStageSelects();
    } else if (this.isMoveableActive) {
      // 尝试激活控制器
      const controller = this._tryActiveController();
      if (controller) {
        this._refreshElementsOriginals([...this.store.selectedElements, this.selection.rangeElement], {
          deepSubs: true,
        });
      }
      if (controller instanceof ElementRotation) {
        this._preProcessRotationStates(controller);
        this.elementsStatus = StageShieldElementsStatus.ROTATING;
      } else if (controller instanceof VerticesTransformer || controller instanceof BorderTransformer) {
        this.elementsStatus = StageShieldElementsStatus.TRANSFORMING;
      } else if (controller instanceof CornerController) {
        this.elementsStatus = StageShieldElementsStatus.CORNER_MOVING;
      } else {
        this._processSelectWhilePressDown(e);
      }
      // 对于子组件的形变、旋转、位移，需要刷新祖先组件的原始数据
      if ([StageShieldElementsStatus.MOVING, StageShieldElementsStatus.ROTATING, StageShieldElementsStatus.TRANSFORMING].includes(this.elementsStatus)) {
        this._refreshAncesorGroupsOriginals(this.store.detachedSelectedElements);
      }
    } else if (this.isHandActive) {
      this._originalStageWorldCoord = LodashUtils.jsonClone(this.stageWorldCoord);
    }
  }

  /**
   * 判断光标是否在选中的组件上
   */
  private _isCursorOnEditingElement(): boolean {
    const targetElement = this.selection.getElementOnCoord(this.cursor.worldValue);
    return this.store.editingElements.includes(targetElement);
  }

  /**
   * 尝试命中文本组件的光标
   *
   * @param pressType - 按压类型
   */
  private _tryRetrieveTextCursor(pressType: TextEditorPressTypes, isSelectionMove?: boolean): void {
    const { selectedElements } = this.store;
    const targetElement = this.selection.getElementOnCoord(this.cursor.worldValue);
    if (targetElement && targetElement instanceof ElementText && selectedElements[0] === targetElement) {
      if (pressType !== TextEditorPressTypes.PRESS_UP) {
        (targetElement as ElementText).refreshTextCursorAtPosition(this.cursor.worldValue, isSelectionMove);
        this._retreiveTextCursorInput(targetElement as unknown as IElementText);
      }
      (targetElement as ElementText).onEditorPressChange(pressType);
    }
  }

  /**
   * 刷新组件原始数据
   *
   * @param elements
   * @param options
   */
  private _refreshElementsOriginals(elements: IElement[], options?: RefreshSubOptions): void {
    this.store.refreshElementsOriginalAngles(elements, options);
    this.store.refreshElementsOriginals(elements, options);
  }

  /**
   * 处理自由折线下的鼠标按下事件
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
   * 结束组件操作
   */
  private async _endElementsOperation(): Promise<void> {
    // 判断是否是拖动组件操作，并且判断拖动位移是否有效
    switch (this.elementsStatus) {
      case StageShieldElementsStatus.MOVING: {
        await this._endElementsDrag();
        break;
      }
      case StageShieldElementsStatus.ROTATING: {
        await this._endElementsRotate();
        break;
      }
      case StageShieldElementsStatus.TRANSFORMING: {
        await this._endElementsTransform();
        break;
      }
      case StageShieldElementsStatus.CORNER_MOVING: {
        await this._endMovingElementsCorner();
        break;
      }
    }
  }

  /**
   * 当结束组件操作时更新组件状态
   */
  private _updateStatusWhileEndElementsOperation(): void {
    if (
      [StageShieldElementsStatus.ROTATING, StageShieldElementsStatus.TRANSFORMING, StageShieldElementsStatus.CORNER_MOVING, StageShieldElementsStatus.MOVING].includes(this.elementsStatus) &&
      this.store.isEditingEmpty
    ) {
      this.elementsStatus = StageShieldElementsStatus.NONE;
    }
  }

  /**
   * 判断鼠标抬起时是否需要选中顶层组件
   */
  private _selectTopAElementIfy(): void {
    if (this._shouldSelectTopAWhilePressUp) {
      this._selectTopAElement(this.store.selectedElements);
    }
    this._shouldSelectTopAWhilePressUp = true;
  }

  /**
   * 鼠标抬起事件
   *
   * @param e
   */
  async _handlePressUp(e: MouseEvent): Promise<void> {
    this._isPressDown = false;
    this.calcPressUp(e);
    if (this.isTextEditing) {
      this._tryRetrieveTextCursor(TextEditorPressTypes.PRESS_UP, false);
    } else if (this.isArbitraryDrawing) {
      // 如果是绘制模式，则完成组件的绘制
      this._isPressDown = true;
      this._handleArbitraryPressUp();
    } else if (this.isDrawerActive) {
      this.store.finishCreatingElement();
    } else if (this.isMoveableActive) {
      // 先判断是否选中组件
      if (this.store.isSelectedEmpty) {
        this.selection.selectRange();
        this.selection.setRange(null);
      } else if (this.checkCursorPressUpALittle(e)) {
        await this._endElementsOperation();
        this._updateStatusWhileEndElementsOperation();
      } else if (!e.ctrlKey && !e.shiftKey) {
        this._selectTopAElementIfy();
      }
    } else if (this.isHandActive) {
      this._processHandCreatorMove(e);
    }
    // 非自由折线模式，绘制完成之后重绘
    if (!this.isArbitraryDrawing) {
      await this._tryCreatedRedraw();
    }
  }

  /**
   * 创建文本光标输入框并聚焦
   * @param textElement - 文本组件
   */
  private _retreiveTextCursorInput(textElement: IElementText): void {
    if (!textElement || !(textElement instanceof ElementText)) {
      return;
    }
    this.html.createTextCursorInput();
    requestAnimationFrame(() => {
      this.html.focusTextCursorInput();
    });
  }

  /**
   * 处理鼠标双击事件
   *
   * @param e
   */
  async _handleDblClick(e: MouseEvent): Promise<void> {
    if (this.isMoveableActive) {
      const { stageElements, selectedElements } = this.store;
      this._selectTopAElement(stageElements);
      this.store.beginEditingElements(selectedElements);
      this.selection.refresh();
      this._originalEditingDataList = await Promise.all(selectedElements.map(async element => ({ model: await element.toOriginalTransformJson(), type: ElementActionTypes.Updated })));
      // 如果是文本编辑模式，则创建文本光标输入框并聚焦
      if (this.isTextEditing) {
        this._retreiveTextCursorInput(selectedElements[0] as IElementText);
      }
    }
  }

  /**
   * 绘制完成之后的重绘
   */
  private async _tryCreatedRedraw(): Promise<void> {
    await Promise.all([this.selection.refresh(), this._addRedrawTask(true), this.tryEmitElementCreated()]);
  }

  /**
   * 扁平化组件和其祖先组件,返回的结果链表有序
   *
   * @param elements - 组件列表
   * @returns 扁平化后的组件列表
   */
  private _flatWithAncestors(elements: IElement[]): IElement[] {
    const ancestorIds = ElementUtils.getAncestorIdsByDetachedElements(elements);
    const ids = new Set(ancestorIds);
    elements.forEach(element => {
      ids.add(element.id);
    });
    return this.store.getOrderedElementsByIds(Array.from(ids));
  }

  /**
   * 刷新组件祖先组件的变换状态
   * @param element - 组件
   */
  private _refreshAncestorsTransformed(element: IElement): void {
    if (element.isGroupSubject && element.isDetachedSelected) {
      element.ancestorGroups.forEach(group => {
        group.onTransformAfter();
      });
    }
  }

  /**
   * 创建组件原始平移命令
   *
   * @param elements
   */
  private async _createOriginalTranslateCommand(elements: IElement[]): Promise<void> {
    elements = this._flatWithAncestors(elements);
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toOriginalTranslateJson(), type: ElementActionTypes.Updated })));
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toTranslateJson(), type: ElementActionTypes.Updated })));
    this._addUpdatedCommandByDataList(uDataList, rDataList);
  }

  /**
   * 结束组件拖拽操作
   */
  private async _endElementsDrag(): Promise<void> {
    const { selectedElements } = this.store;
    await this._createOriginalTranslateCommand(selectedElements);
    // 取消组件拖动状态
    selectedElements.forEach(element => {
      element.isDragging = false;
      element.onTranslateAfter();
      this._refreshAncestorsTransformed(element);
    });
    if (this.store.isMultiSelected) {
      this.selection.rangeElement.isDragging = false;
    }
  }

  /**
   * 创建组件原始旋转命令
   *
   * @param elements
   */
  private async _createOrignalRotateCommand(elements: IElement[]): Promise<void> {
    elements = this._flatWithAncestors(elements);
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toOriginalRotateJson(), type: ElementActionTypes.Updated })));
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toRotateJson(), type: ElementActionTypes.Updated })));
    this._addUpdatedCommandByDataList(uDataList, rDataList);
  }

  /**
   * 结束组件旋转操作
   */
  private async _endElementsRotate() {
    const { selectedElements } = this.store;
    await this._createOrignalRotateCommand(selectedElements);
    // 更新组件状态
    selectedElements.forEach(element => {
      element.isRotatingTarget = false;
      element.isRotating = false;
      element.onRotateAfter();
      this._refreshAncestorsTransformed(element);
    });
    if (this.store.isMultiSelected) {
      this.selection.rangeElement.isRotating = false;
    }
    this.store.clearRotatingStates();
  }

  /**
   * 创建组件原始变换命令
   *
   * @param elements
   */
  private async _createOriginalTransformCommand(elements: IElement[]): Promise<void> {
    elements = this._flatWithAncestors(elements);
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toOriginalTransformJson(), type: ElementActionTypes.Updated })));
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toTransformJson(), type: ElementActionTypes.Updated })));
    this._addUpdatedCommandByDataList(uDataList, rDataList);
  }

  /**
   * 结束组件变换操作
   */
  private async _endElementsTransform() {
    const { selectedElements, isEditingEmpty } = this.store;
    if (!isEditingEmpty) return;
    await this._createOriginalTransformCommand(selectedElements);
    // 更新组件状态
    selectedElements.forEach(element => {
      element.isTransforming = false;
      element.onTransformAfter();
      this._refreshAncestorsTransformed(element);
    });
    if (this.store.isMultiSelected) {
      this.selection.rangeElement.isTransforming = false;
    }
  }

  /**
   * 结束组件圆角半径操作
   */
  private async _endMovingElementsCorner(): Promise<void> {
    const { selectedElements } = this.store;
    const command = await CommandHelper.createOriginalCornerCommand(selectedElements, this.store);
    this.undoRedo.add(command);
    // 更新组件状态
    selectedElements.forEach(element => {
      element.isCornerMoving = false;
      element.refreshOriginals();
      element.onCornerChanged();
    });
  }

  /**
   * 将除当前鼠标位置的组件设置为被选中，其他组件取消选中状态
   */
  private _selectTopAElement(elements: IElement[]): void {
    const detachedSelectedElements = elements.filter(element => element.isDetachedSelected);
    const topAElement = ElementUtils.getTopAElementByCoord(detachedSelectedElements.length ? detachedSelectedElements : elements, this.cursor.worldValue);
    this.store.deSelectElements(
      this.store.selectedElements.filter(element => {
        if (topAElement && topAElement.isGroup) {
          return element.ancestorGroup !== topAElement;
        }
        return element !== topAElement;
      }),
    );
    if (topAElement) {
      this.store.selectElement(topAElement);
    }
  }

  /**
   * 处理手型工具移动事件
   *
   * @param e
   */
  private _processHandCreatorMove(e: MouseEvent): void {
    this._refreshStageWorldCoord(e);
    this.store.refreshStageElements();
    this.selection.refresh();
    this._isStageMoving = false;
  }

  /**
   * 创建添加组件命令
   *
   * @param elements - 组件列表
   * @param selectedAppend - 是否添加到选中组件的后面
   */
  private async _createAddedCommand(elements: IElement[], selectedAppend?: boolean): Promise<void> {
    const actionParams: ElementsActionParam[] = [
      {
        type: ElementActionTypes.Added,
        data: elements,
      },
    ];
    const command = await CommandHelper.createCommandByActionParams(actionParams, ElementCommandTypes.ElementsAdded, this.store);
    this.undoRedo.add(command);
  }

  /**
   * 发送组件创建事件
   *
   * @param elements - 组件列表
   */
  private _emitElementsCreated(elements: IElement[]): void {
    this.setCreator(MoveableCreator);
    this.emit(ShieldDispatcherNames.elementCreated, elements);
  }

  /**
   * 提交绘制
   */
  async tryEmitElementCreated(): Promise<void> {
    const provisionalElements = this.store.provisionalElements;
    if (provisionalElements.length) {
      this.store.updateElements(provisionalElements, {
        isProvisional: false,
        isOnStage: true,
      });
      this._emitElementsCreated(provisionalElements);
      await this._createAddedCommand(provisionalElements);
    }
  }

  /**
   * 鼠标按下时计算位置
   *
   * @param e
   */
  calcPressDown(e: MouseEvent): void {
    this._pressDownPosition = this.cursor.transform(e);
    this._pressDownStageWorldCoord = ElementUtils.calcWorldCoord(this._pressDownPosition);
  }

  /**
   * 鼠标抬起时计算位置
   *
   * @param e
   */
  calcPressUp(e: MouseEvent): void {
    this._pressUpPosition = this.cursor.transform(e);
    this._pressUpStageWorldCoord = ElementUtils.calcWorldCoord(this._pressUpPosition);
  }

  /**
   * 鼠标按压并移动时候，计算偏移量
   *
   * @param e
   */
  calcPressMove(e: MouseEvent): void {
    this._pressMovePosition = this.cursor.transform(e);
    this._pressMoveStageWorldCoord = ElementUtils.calcWorldCoord(this._pressMovePosition);
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
   * 刷新画布尺寸
   */
  private async _refreshSize(): Promise<void> {
    const rect = this.renderEl.getBoundingClientRect();
    this.stageRect = rect;
    this._updateCanvasSize(rect);
    this.store.refreshStageElements();
    this.selection.refresh();
    this.triggetEditingElementsStageChanged();
    this._shouldRedraw = true;
  }

  /**
   * 更新所有画布尺寸
   *
   * @param size
   */
  private _updateCanvasSize(size: DOMRect): void {
    this.mask.updateSize(size);
    this.provisional.updateSize(size);
    this.html.updateSize(size);
    this.updateSize(size);
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
   * 更新自由折线组件
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
    if (!this._originalStageWorldCoord) return;
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
    let value = clamp(this.stageScale + deltaScale, 0.02, 5);
    // 2位小数精度
    value = MathUtils.precise(value, 2);
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
    this.html.updateSize(this.renderEl.getBoundingClientRect());
    this.emit(ShieldDispatcherNames.scaleChanged, value);
    this.store.refreshStageElements();
    this.selection.refresh();
    this.triggetEditingElementsStageChanged();
    this._shouldRedraw = true;
  }

  /**
   * 滚轮缩放
   *
   * @param deltaScale
   * @param e
   */
  private _handleWheelScale(deltaScale: number, e: MouseEvent): void {
    const prevCursorPosition = CommonUtils.getEventPosition(e, this.stageRect, this.stageScale);
    const cursorCoord = ElementUtils.calcWorldCoord(prevCursorPosition);
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
    this.selection.refresh();
    this.store.editingElements.forEach(element => element.onStageChanged());
    this._shouldRedraw = true;
  }

  /**
   * 给定矩形计算自动适应缩放值
   *
   * @param box
   * @returns
   */
  calcScaleAutoFitValueByBox(box: IPoint[]): number {
    const { width, height } = CommonUtils.calcRectangleSize(box);
    let scale = MathUtils.precise(CommonUtils.calcScale(this.stageRect, { width, height }, AutoFitPadding * this.stageScale), 2);
    scale = clamp(scale, 0.02, 1);
    return scale;
  }

  /**
   * 计算自动适应缩放值
   *
   * @returns
   */
  calcScaleAutoFitValue(): number {
    const elementsBox = CommonUtils.getBoxByPoints(this.store.visibleElements.map(element => element.maxOutlineBoxCoords).flat());
    return this.calcScaleAutoFitValueByBox(elementsBox);
  }

  /**
   * 计算某个组件的自动适应缩放值
   *
   * @param element
   * @returns
   */
  calcElementAutoFitValue(element: IElement): number {
    return this.calcScaleAutoFitValueByBox(element.maxOutlineBoxCoords);
  }

  /**
   * 舞台自适应
   */
  setScaleAutoFit(): void {
    if (!this.store.isVisibleEmpty) {
      const center = MathUtils.calcCenter(this.store.visibleElements.map(element => element.rotateOutlineCoords.flat()).flat());
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
    }
    await this._createAddedCommand([element], true);
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
   * 处理选中组件删除
   */
  async _handleSelectsDelete(): Promise<void> {
    if (this.store.isSelectedEmpty) {
      return;
    }
    let command: ICommand<IElementCommandPayload> | null = null;
    const { list, ancestors } = this.store.findRemovedElemements(this.store.selectedElements);
    const actionParams: ElementsActionParam[] = [];
    list.forEach(element => {
      actionParams.push({
        type: ElementActionTypes.Removed,
        data: [element],
      });
    });
    // 如果存在子组件被删除，但是父组件没有被删除，则需要解除绑定关系并更新父组件的一些属性数据
    ancestors.forEach(ancestor => {
      actionParams.push({
        type: ElementActionTypes.GroupUpdated,
        data: [ancestor],
      });
    });
    const uDataList = await CommandHelper.createDataListByActionParams(actionParams);
    const elementIds = new Set(list.map(element => element.id));
    ancestors.forEach(ancestor => {
      this.store.updateElementModel(ancestor.id, {
        subIds: (ancestor as IElementGroup).model.subIds.filter(subId => !elementIds.has(subId)),
      });
      (ancestor as IElementGroup).refreshBySubsWithout(Array.from(elementIds));
      ancestor.refreshOriginals();
    });
    const rDataList = await CommandHelper.createDataListByActionParams(actionParams);
    command = await CommandHelper.createElementsChangedCommand(uDataList, rDataList, ElementCommandTypes.ElementsRemoved, this.store);
    this.undoRedo.add(command);
    this.store.removeElements(list);
  }

  /**
   * 选中所有组件
   */
  selectAll(): void {
    this.store.selectAll();
  }

  /**
   * 处理全选
   */
  _handleSelectAll(): void {
    this.selectAll();
  }

  /**
   * 处理选中组件复制
   */
  async _handleSelectCopy(): Promise<void> {
    const elementsJson = await this.store.copySelectElements();
    const data = JSON.stringify(elementsJson);
    DOMUtils.copyValueToClipboard(data);
  }

  /**
   * 处理粘贴组件
   * @param elementsJson
   */
  async _handlePasteElements(elementsJson: Array<ElementObject>): Promise<void> {
    let uDataList: ICommandElementObject[] = [];
    let rDataList: ICommandElementObject[] = [];
    const elements = await this.store.pasteElements(
      elementsJson,
      async actionParams => {
        uDataList.push(...(await CommandHelper.createDataListByActionParams(actionParams)));
      },
      async actionParams => {
        rDataList.push(...(await CommandHelper.createDataListByActionParams(actionParams)));
      },
    );
    const command = await CommandHelper.createElementsChangedCommand(uDataList.reverse(), rDataList, ElementCommandTypes.ElementsAdded, this.store);
    this.undoRedo.add(command);
    this.store.setElementsDetachedSelected(
      elements.map(element => element.id),
      true,
    );
    this.selection.refresh();
  }

  /**
   * 操作取消的处理
   */
  _handleCancel(): void {
    if (this.isArbitraryDrawing) {
      this.commitArbitraryDrawing();
    } else if (this.isArbitraryEditing) {
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
  async _handleGroupAdd(): Promise<void> {
    if (this.isElementsBusy) return;
    if (this.store.isSelectedEmpty) return;
    let uDataList: ICommandElementObject[] = [];
    let rDataList: ICommandElementObject[] = [];
    let group: IElementGroup | null = null;
    await this.store.createElementGroup(
      this.store.selectedElements,
      async (params: ElementsActionParam[]) => {
        uDataList.push(...(await CommandHelper.createDataListByActionParams(params)));
      },
      async (params: ElementsActionParam[]) => {
        rDataList.push(...(await CommandHelper.createDataListByActionParams(params)));
        const tailParam: ElementsActionParam = params[params.length - 1];
        if (tailParam?.data?.length) {
          group = tailParam.data[0] as IElementGroup;
        }
      },
    );
    if (group) {
      this._clearStageSelects();
      this.store.setElementsDetachedSelected([group.id], true);
    }
    const command = await CommandHelper.createElementsChangedCommand(uDataList, rDataList, ElementCommandTypes.GroupAdded, this.store);
    this.undoRedo.add(command);
  }

  /**
   * 处理组件组合取消操作
   */
  async _handleGroupCancel(): Promise<void> {
    if (this.isElementsBusy) return;
    const groups = this.store.getSelectedAncestorElementGroups();
    if (groups.length === 0) return;
    const actionParams: ElementsActionParam[] = [];
    groups.forEach(group => {
      actionParams.push({
        type: ElementActionTypes.Removed,
        data: [group],
      });
      group.subs.forEach(sub => {
        actionParams.push({
          type: ElementActionTypes.Moved,
          data: [sub],
        });
      });
    });
    const uDataList = await CommandHelper.createDataListByActionParams(actionParams);
    this.store.cancelGroups(groups);
    const rDataList = await CommandHelper.createDataListByActionParams(actionParams);
    const command = await CommandHelper.createElementsChangedCommand(uDataList, rDataList, ElementCommandTypes.GroupRemoved, this.store);
    this.undoRedo.add(command);
    groups.forEach(group => {
      this.store.selectElements(group.subs);
    });
  }

  /**
   * 处理撤销操作
   */
  async _handleUndo(): Promise<void> {
    await this._doUndo();
  }

  /**
   * 处理重做操作
   */
  async _handleRedo(): Promise<void> {
    await this._doRedo();
  }

  /**
   * 处理撤销重做操作
   *
   * @param tailCommand
   */
  private async _processAfterUndoRedo(tailCommand: ICommand<IElementCommandPayload>): Promise<void> {
    this.selection.refresh();
    await this._addRedrawTask(true);
    this.emit(ShieldDispatcherNames.primarySelectedChanged, this.store.primarySelectedElement);
    if (
      tailCommand &&
      [
        ElementCommandTypes.ElementsRearranged,
        ElementCommandTypes.ElementsRemoved,
        ElementCommandTypes.ElementsAdded,
        ElementCommandTypes.GroupAdded,
        ElementCommandTypes.GroupRemoved,
        ElementCommandTypes.DetachedElementsRemoved,
        ElementCommandTypes.ElementsMoved,
      ].includes(tailCommand.payload.type)
    ) {
      this.store.refreshStageElements();
      this.store.throttleRefreshTreeNodes();
    }
  }

  /**
   * 执行撤销
   */
  async _doUndo(): Promise<void> {
    const tailUndoCommand = this.undoRedo.tailUndoCommand;
    if (!tailUndoCommand) return;
    if (!(tailUndoCommand.payload.type === ElementCommandTypes.ElementsUpdated)) {
      this.store.deSelectAll();
    }
    await this.undoRedo.undo();
    await this._processAfterUndoRedo(tailUndoCommand);
  }

  /**
   * 执行重做
   */
  async _doRedo(): Promise<void> {
    const tailRedoCommand = this.undoRedo.tailRedoCommand;
    if (!tailRedoCommand) return;
    if (!(tailRedoCommand.payload.type === ElementCommandTypes.ElementsUpdated)) {
      this.store.deSelectAll();
    }
    await this.undoRedo.redo();
    await this._processAfterUndoRedo(tailRedoCommand);
  }

  /**
   * 执行撤销
   */
  async execUndo(): Promise<void> {
    await this._doUndo();
  }

  /**
   * 执行重做
   */
  async execRedo(): Promise<void> {
    await this._doRedo();
  }

  /**
   * 处理输入
   *
   * @param value
   * @param fontStyle
   * @param size
   * @param position
   */
  async _handleTextInput(value: string, fontStyle: FontStyle, size: ISize, position: IPoint): Promise<void> {
    this._clearStageSelects();
    const coord = ElementUtils.calcWorldCoord(position);
    const element = (await this.store.insertTextElement(value, fontStyle, CommonUtils.getBoxByLeftTop(coord, size))) as IElementText;
    // 如果差值小于50ms，则可以判定是鼠标点击舞台时触发的blur事件
    if (window.performance.now() - this._latestMousedownTimestamp <= 50) {
      this._shouldSelectTopAWhilePressUp = false;
    }
    await this._addRedrawTask(true);
    // 因为文本录入时使用的是textarea，但是渲染时是canvas，导致宽度和高度计算不正确（目前没有其他好方法），所以此处需要使用渲染后的文本节点重新计算尺寸
    element.refreshTextSizeCoords();
    element.refresh();
    await this._createAddedCommand([element]);
    this.selection.refresh();
    this._emitElementsCreated([element]);
  }

  /**
   * 处理文本更新
   *
   * @param value
   * @param states
   */
  async _handleTextUpdate(value: string, states: TextEditingStates): Promise<void> {
    if (this.isTextEditing) {
      const textElement = this.store.selectedElements[0] as IElementText;
      const result = await textElement.updateText(value, states);
      if (!result) return;
      const { changed, reflow } = result;
      await this._addRedrawTask(true);
      if (reflow) {
        await this._reflowTextIfy([textElement], true, changed);
      }
    }
  }

  /**
   * 刷新组件位置
   *
   * @param elements
   */
  private _processOnAlignChanged(elements: IElement[]): void {
    elements.forEach(element => {
      element.onPositionChanged();
      this._refreshAncestorsTransformed(element);
    });
    this.selection.refresh();
    this._shouldRedraw = true;
  }

  /**
   * 左对齐
   *
   * @param elements
   */
  async setElementsAlignLeft(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAlignLeft(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 右对齐
   *
   * @param elements
   */
  async setElementsAlignRight(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAlignRight(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 顶部对齐
   *
   * @param elements
   */
  async setElementsAlignTop(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAlignTop(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 底部对齐
   *
   * @param elements
   */
  async setElementsAlignBottom(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAlignBottom(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 水平居中
   *
   * @param elements
   */
  async setElementsAlignCenter(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAlignCenter(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 垂直居中
   *
   * @param elements
   */
  async setElementsAlignMiddle(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAlignMiddle(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 水平平均分布
   *
   * @param elements
   */
  async setElementsAverageVertical(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAverageVertical(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 垂直平均分布
   *
   * @param elements
   */
  async setElementsAverageHorizontal(elements: IElement[]): Promise<void> {
    await this._createTranslateCommand(elements, async () => {
      await this.align.setElementsAverageHorizontal(elements);
      this._refreshAncesorsByDetachedElements(elements);
    });
    this._processOnAlignChanged(elements);
  }

  /**
   * 提交自由折线
   */
  async commitArbitraryDrawing(): Promise<void> {
    if (this.isArbitraryDrawing) {
      this._isPressDown = false;
      this.store.finishCreatingElement();
      await this._tryCreatedRedraw();
    }
  }

  /**
   * 提交编辑
   */
  private async _commitEidting(): Promise<void> {
    const { editingElements } = this.store;
    const rDataList = await Promise.all(editingElements.map(async element => ({ model: await element.toJson(), type: ElementActionTypes.Updated })));
    await this._addUpdatedCommandByDataList(this._originalEditingDataList, rDataList);
    this.store.endEditingElements(editingElements);
    this.selection.refresh();
    this.elementsStatus = StageShieldElementsStatus.NONE;
    this._originalEditingDataList = null;
  }

  /**
   * 提交编辑绘制
   */
  async commitEditingDrawing(): Promise<void> {
    if (this.isArbitraryEditing) {
      await this._commitEidting();
    }
  }

  /**
   * 生成组件层级变更命令
   *
   * @param elements
   * @param uDataList
   * @param rDataList
   */
  private async _createElementsRearrangeCommand(elements: IElement[], uDataList: Array<ICommandElementObject>, rDataList: Array<ICommandElementObject>): Promise<void> {
    const command = await CommandHelper.createElementsChangedCommand(uDataList, rDataList, ElementCommandTypes.ElementsRearranged, this.store);
    this.undoRedo.add(command);
    elements.forEach(element => element.onLayerChanged());
    this._shouldRedraw = true;
  }

  /**
   * 组件下移
   *
   * @param elements 要修改的元件集合
   */
  async setElementsGoDown(elements: IElement[]): Promise<void> {
    const uDataList: Array<ICommandElementObject> = [];
    const rDataList: Array<ICommandElementObject> = [];
    await this.store.setElementsGoDown(
      elements,
      async (params: ElementsActionParam[]) => {
        uDataList.push(...(await CommandHelper.createRearrangeDataList(params)));
      },
      async (params: ElementsActionParam[]) => {
        rDataList.push(...(await CommandHelper.createRearrangeDataList(params)));
      },
    );
    await this._createElementsRearrangeCommand(elements, uDataList, rDataList);
  }

  /**
   * 组件上移
   *
   * @param elements 要修改的元件集合
   */
  async setElementsShiftMove(elements: IElement[]): Promise<void> {
    const uDataList: Array<ICommandElementObject> = [];
    const rDataList: Array<ICommandElementObject> = [];
    await this.store.setElementsShiftMove(
      elements,
      async (params: ElementsActionParam[]) => {
        uDataList.push(...(await CommandHelper.createRearrangeDataList(params)));
      },
      async (params: ElementsActionParam[]) => {
        rDataList.push(...(await CommandHelper.createRearrangeDataList(params)));
      },
    );
    await this._createElementsRearrangeCommand(elements, uDataList, rDataList);
  }
  /**
   * 切换目标
   *
   * @param ids 目标id集合
   * @param isTarget 是否目标
   */
  toggleElementsTarget(ids: string[], isTarget: boolean): void {
    this.store.toggleElementsTarget(ids, isTarget);
  }

  /**
   * 切换组件选中状态(组件脱离组合的独立选中状态切换)
   *
   * @param ids 组件id集合
   */
  toggleElementsDetachedSelected(ids: string[]): void {
    this.store.toggleElementsDetachedSelected(ids);
  }

  /**
   * 设置组件选中状态(组件脱离组合的独立选中状态切换)
   *
   * @param ids
   * @param isDetachedSelected
   */
  setElementsDetachedSelected(ids: string[], isDetachedSelected: boolean): void {
    this.store.setElementsDetachedSelected(ids, isDetachedSelected);
  }

  /**
   * 移动组件到指定位置
   *
   * @param ids
   * @param target
   * @param dropType
   */
  async moveElementsTo(ids: string[], target: string, dropType: TreeNodeDropType): Promise<void> {
    const uDataList: Array<ICommandElementObject> = [];
    const rDataList: Array<ICommandElementObject> = [];
    await this.store.moveElementsTo(
      ids,
      target,
      dropType,
      async (actionParams: ElementsActionParam[]) => {
        uDataList.push(...(await CommandHelper.createDataListByActionParams(actionParams)));
      },
      async (actionParams: ElementsActionParam[]) => {
        rDataList.push(...(await CommandHelper.createDataListByActionParams(actionParams)));
      },
    );
    const command = await CommandHelper.createElementsChangedCommand(uDataList, rDataList, ElementCommandTypes.ElementsMoved, this.store);
    this.undoRedo.add(command);
    this.selection.refresh();
  }
}
