import { ElementStatus, IPoint, ISize, ShieldDispatcherNames } from "@/types";
import LinkedNode, { ILinkedNode } from "@/modules/struct/LinkedNode";
import ElementUtils, { ElementListEventNames, ElementReactionPropNames } from "@/modules/elements/utils/ElementUtils";
import { every, includes, isEqual } from "lodash";
import ElementList from "@/modules/elements/helpers/ElementList";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import ElementSortedMap, { ElementSortedMapEventNames } from "@/modules/elements/helpers/ElementSortedMap";
import CreatorHelper from "@/types/CreatorHelper";
import IStageStore from "@/types/IStageStore";
import IStageShield from "@/types/IStageShield";
import IElement, { DefaultAngleModel, ElementObject, IElementArbitrary, RefreshSubOptions, DefaultRefreshSubOptions, DefaultCornerModel, IElementRect } from "@/types/IElement";
import { CreatorCategories, CreatorTypes } from "@/types/Creator";
import { getDefaultElementStyle, StrokeTypes } from "@/styles/ElementStyles";
import LodashUtils from "@/utils/LodashUtils";
import ImageUtils from "@/utils/ImageUtils";
import ElementArbitrary from "@/modules/elements/ElementArbitrary";
import { ArbitraryPointClosestMargin } from "@/types/constants";
import { IElementGroup } from "@/types/IElementGroup";
import ElementGroup from "@/modules/elements/ElementGroup";

export default class StageStore implements IStageStore {
  shield: IStageShield;

  // 画板上绘制的组件列表（形状、文字、图片等）
  private _elementList: ElementList;
  // 当前正在创建的组件
  private _currentCreatingElementId;
  // 组件对象映射关系，加快查询
  private _elementsMap = new ElementSortedMap<string, IElement>();
  // 已渲染的组件映射关系
  private _provisionalElementsMap = new ElementSortedMap<string, IElement>();
  // 被选中的组件映射关系，加快查询
  private _selectedElementsMap = new ElementSortedMap<string, IElement>();
  // 命中的组件映射关系，加快查询
  private _targetElementsMap = new ElementSortedMap<string, IElement>();
  // 舞台组件映射关系，加快查询
  private _stageElementsMap = new ElementSortedMap<string, IElement>();
  // 未在舞台的组件映射关系，加快查询
  private _noneStageElementsMap = new ElementSortedMap<string, IElement>();
  // 可见组件映射关系，加快查询
  private _visibleElementsMap = new ElementSortedMap<string, IElement>();
  // 编辑中的组件映射关系，加快查询
  private _editingElementsMap = new ElementSortedMap<string, IElement>();
  // 选区组件映射关系，加快查询
  private _rangeElementsMap = new ElementSortedMap<string, IElement>();
  // 旋转目标组件映射关系，加快查询
  private _rotatingTargetElementsMap = new ElementSortedMap<string, IElement>();
  // 旋转组件中心点
  private _rotatingCenter: IPoint;
  // 旋转组件中心点-世界坐标
  private _rotatingCenterCoord: IPoint;
  // 旋转组件原始角度
  private _rotatingOriginalAngle: number;

  constructor(shield: IStageShield) {
    this.shield = shield;
    this._elementList = new ElementList();
    this._reactionElementAdded();
    this._reactionElementRemoved();
    this._reactionElementsPropsChanged();

    // 监听选中组件变更事件通知外部监听者
    this._selectedElementsMap.on(ElementSortedMapEventNames.changed, () => {
      this.shield.emit(ShieldDispatcherNames.selectedChanged, this.selectedElements);
      this.shield.selection.refresh();
    });
    // 监听目标组件变更事件通知外部监听者
    this._targetElementsMap.on(ElementSortedMapEventNames.changed, () => {
      this.shield.emit(ShieldDispatcherNames.targetChanged, this.targetElements);
    });
  }

  // 当前创建并更新中的组件
  get creatingElements(): IElement[] {
    const element = this._elementsMap.get(this._currentCreatingElementId);
    if (element) {
      return [element];
    }
    return [];
  }

  // 已经渲染到舞台的组件
  get provisionalElements(): IElement[] {
    return this._provisionalElementsMap.valuesArray();
  }

  // 选中的组件
  get selectedElements(): IElement[] {
    return this._selectedElementsMap.valuesArray();
  }

  // 命中的组件
  get targetElements(): IElement[] {
    return this._targetElementsMap.valuesArray();
  }

  // 舞台上的组件
  get stageElements(): IElement[] {
    return this._stageElementsMap.valuesArray();
  }

  // 未在舞台的组件
  get noneStageElements(): IElement[] {
    return this._noneStageElementsMap.valuesArray();
  }

  // 选区范围内的组件
  get rangeElements(): IElement[] {
    return this._rangeElementsMap.valuesArray();
  }

  // 可见的组件
  get visibleElements(): IElement[] {
    return this._visibleElementsMap.valuesArray();
  }

  // 选中的根组件
  get selectedAncestorElement(): IElement {
    return ElementUtils.getAncestorGroup(this.selectedElements);
  }

  /**
   * 获取选中的主要组件
   */
  get primarySelectedElement(): IElement {
    // 选中的根节点，根组件不可以是子组件
    const ancestorElement = this.selectedAncestorElement;
    // 选中的组件不能是创建中的临时组件
    if (ancestorElement && !ancestorElement.isProvisional) return ancestorElement;
  }

  // 旋转目标组件
  get rotatingTargetElements(): IElement[] {
    return this._rotatingTargetElementsMap.valuesArray();
  }

  // 编辑中的组件
  get editingElements(): IElement[] {
    return this._editingElementsMap.valuesArray();
  }

  // 是否选中组件为空
  get isSelectedEmpty(): boolean {
    return this.selectedElements.length === 0;
  }

  // 是否可见组件为空
  get isVisibleEmpty(): boolean {
    return this.visibleElements.length === 0;
  }

  // 是否组件列表为空
  get isEmpty(): boolean {
    return this._elementList.length === 0;
  }

  // 是否处于编辑状态
  get isEditingEmpty(): boolean {
    return this.editingElements.length === 0;
  }

  // 是否命中组件为空
  get isTargetEmpty(): boolean {
    return this.targetElements.length === 0;
  }

  // 是否选区范围组件为空
  get isRangeEmpty(): boolean {
    return this.rangeElements.length === 0;
  }

  // 是否舞台组件为空
  get isStageEmpty(): boolean {
    return this.stageElements.length === 0;
  }

  // 是否未在舞台的组件为空
  get isNoneStageEmpty(): boolean {
    return this.noneStageElements.length === 0;
  }

  // 选中的组合
  get selectedElementGroups(): IElementGroup[] {
    return this.getSelectedElementGroups();
  }

  // 选中的根组合
  get selectedAncestorElementGroups(): IElementGroup[] {
    return this.getSelectedAncestorElementGroups();
  }

  // 不属于任何组合的组件
  get noParentElements(): IElement[] {
    return ElementUtils.getNoParentElements(this.selectedElements) as IElement[];
  }

  // 是否多选
  get isMultiSelection(): boolean {
    return this.noParentElements.length > 1;
  }

  /**
   * 组件新增
   */
  private _reactionElementAdded(): void {
    this._elementList.on(ElementListEventNames.added, (node: ILinkedNode<IElement>) => {
      const element = node.value;
      Object.keys(ElementReactionPropNames).forEach(propName => {
        this._reactionElementPropsChanged(ElementReactionPropNames[propName], element, element[propName]);
      });
    });
  }

  /**
   * 组件删除
   */
  private _reactionElementRemoved(): void {
    this._elementList.on(ElementListEventNames.removed, (node: ILinkedNode<IElement>) => {
      const element = node.value;
      // 删除组件在舞台上的映射关系
      this._stageElementsMap.delete(element.id);
      // 删除组件在选中的映射关系
      this._selectedElementsMap.delete(element.id);
      // 删除组件在未在舞台上的映射关系
      this._noneStageElementsMap.delete(element.id);
      // 删除组件在临时组件的映射关系
      this._provisionalElementsMap.delete(element.id);
      // 删除组件在命中的映射关系
      this._targetElementsMap.delete(element.id);
      // 删除组件在选区范围内的映射关系
      this._rangeElementsMap.delete(element.id);
      // 删除组件在可见的映射关系
      this._visibleElementsMap.delete(element.id);
      // 删除组件在旋转目标的映射关系
      this._rotatingTargetElementsMap.delete(element.id);
      // 删除组件在编辑中的映射关系
      this._editingElementsMap.delete(element.id);
    });
  }

  /**
   * 组件属性变化时，更新组件映射关系
   */
  private _reactionElementsPropsChanged(): void {
    Object.keys(ElementReactionPropNames).forEach(propName => {
      this._elementList.on(propName, (element, value) => {
        this._reactionElementPropsChanged(propName, element, value);
      });
    });
  }

  /**
   * 组件属性发生变化时，更新组件映射关系
   *
   * @param propName
   * @param element
   * @param value
   */
  private _reactionElementPropsChanged(propName: string, element: IElement, value: boolean | ElementStatus | IPoint): void {
    switch (propName) {
      // 选中组件
      case ElementReactionPropNames.isSelected: {
        if (value) {
          this._selectedElementsMap.set(element.id, element);
        } else {
          this._selectedElementsMap.delete(element.id);
        }
        break;
      }
      // 是否在舞台上
      case ElementReactionPropNames.isOnStage: {
        if (value) {
          this._stageElementsMap.set(element.id, element);
          this._noneStageElementsMap.delete(element.id);
        } else {
          this._stageElementsMap.delete(element.id);
          this._noneStageElementsMap.set(element.id, element);
        }
        break;
      }
      // 是否临时组件
      case ElementReactionPropNames.isProvisional: {
        if (value) {
          this._provisionalElementsMap.set(element.id, element);
        } else {
          this._provisionalElementsMap.delete(element.id);
        }
        break;
      }
      // 是否命中
      case ElementReactionPropNames.isTarget: {
        if (value) {
          this._targetElementsMap.set(element.id, element);
        } else {
          this._targetElementsMap.delete(element.id);
        }
        break;
      }
      // 是否在选区范围内
      case ElementReactionPropNames.isInRange: {
        if (value) {
          this._rangeElementsMap.set(element.id, element);
        } else {
          this._rangeElementsMap.delete(element.id);
        }
        break;
      }
      // 是否可见
      case ElementReactionPropNames.isVisible: {
        if (value) {
          this._visibleElementsMap.set(element.id, element);
        } else {
          this._visibleElementsMap.delete(element.id);
        }
        break;
      }
      // 是否编辑中
      case ElementReactionPropNames.isEditing: {
        if (value) {
          this._editingElementsMap.set(element.id, element);
        } else {
          this._editingElementsMap.delete(element.id);
        }
        break;
      }
      // 组件状态
      case ElementReactionPropNames.status: {
        if (this._currentCreatingElementId && value === ElementStatus.creating) {
          this._selectedElementsMap.set(element.id, element);
        }
        break;
      }
      // 是否旋转目标
      case ElementReactionPropNames.isRotatingTarget: {
        if (value) {
          this._rotatingTargetElementsMap.set(element.id, element);
        } else {
          this._rotatingTargetElementsMap.delete(element.id);
        }
        break;
      }
      default: {
        const names: ShieldDispatcherNames[] = [
          ShieldDispatcherNames.positionChanged,
          ShieldDispatcherNames.angleChanged,
          ShieldDispatcherNames.cornersChanged,
          ShieldDispatcherNames.flipXChanged,
          ShieldDispatcherNames.leanYAngleChanged,
          ShieldDispatcherNames.widthChanged,
          ShieldDispatcherNames.heightChanged,
          ShieldDispatcherNames.scaleChanged,
          ShieldDispatcherNames.strokesChanged,
          ShieldDispatcherNames.fillsChanged,
          ShieldDispatcherNames.textAlignChanged,
          ShieldDispatcherNames.textBaselineChanged,
          ShieldDispatcherNames.ratioLockedChanged,
        ];
        for (const name of names) {
          if (name.toString() === `${propName}Changed`) {
            this.filterEmit(name, element, value);
            break;
          }
        }
        break;
      }
    }
  }

  /**
   * 过滤事件并发送
   *
   * @param name
   * @param element
   * @param args
   */
  filterEmit(name: ShieldDispatcherNames, element: IElement, ...args: any[]): void {
    if (!element) return;
    // 如果组件是创建中的组件或者选中的组件且组件没有组合，则发送事件
    if (element.id === this.primarySelectedElement?.id || element.id === this._currentCreatingElementId) {
      this.shield.emit(name, element, ...args);
    }
  }

  /**
   * 设置组件位置
   *
   * @param elements
   * @param value
   */
  async setElementsPosition(elements: IElement[], value: IPoint): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && !element.isGroupSubject) {
        const { x: prevLeft, y: prevTop } = element.model;
        const { x, y } = value;
        if (prevLeft === x && prevTop === y) return;
        const offset = { x: x - prevLeft, y: y - prevTop };
        element.setPosition(x, y, offset);
        if (element.isGroup) {
          (element as IElementGroup).deepSubs.forEach(sub => {
            sub.setPosition(sub.model.x + offset.x, sub.model.y + offset.y, offset);
          });
        }
      }
    });
  }

  /**
   * 设置组件宽度
   *
   * @param elements
   * @param value
   */
  async setElementsWidth(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && !element.isGroupSubject) {
        if (element.width === value) return;
        const matrix = element.setWidth(value);
        if (element.isGroup) {
          this.scaleSubs(element, matrix);
        }
      }
    });
  }

  /**
   * 设置组件高度
   *
   * @param elements
   * @param value
   */
  async setElementsHeight(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && !element.isGroupSubject) {
        if (element.height === value) return;
        const matrix = element.setHeight(value);
        if (element.isGroup) {
          this.scaleSubs(element, matrix);
        }
      }
    });
  }

  /**
   * 缩放子组件
   *
   * @param element
   * @param matrix
   */
  private scaleSubs(element: IElement, matrix: number[][]): void {
    const { center, angle, leanYAngle } = element;
    const { scaleX, scaleY } = MathUtils.getScaleFromMatrix(matrix);
    (element as IElementGroup).deepSubs.forEach(sub => {
      sub.scaleBy(center, scaleX, scaleY, {
        angle,
        leanYAngle,
      });
    });
  }

  /**
   * 设置组件角度
   *
   * @param elements
   * @param value
   */
  async setElementsAngle(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && !element.isGroupSubject) {
        if (element.angle === value) return;
        this.rotateElements([element], value, element.angle, element.centerCoord);
      }
    });
  }

  /**
   * 设置组件圆角
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsCorners(elements: IElement[], value: number, index?: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && !element.isGroupSubject) {
        if (isEqual(element.corners, [value, value, value, value])) return;
        element.setCorners(value, index);
      }
    });
  }

  /**
   * 设置组件Y倾斜角度
   *
   * @param elements
   * @param value
   */
  async setElementsLeanYAngle(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && !element.isGroupSubject) {
        if (element.leanYAngle === value) return;
        const prevValue = element.leanYAngle;
        value = MathUtils.precise(value, 1);
        element.setLeanYAngle(value);
        if (element.isGroup) {
          const center = element.center;
          (element as IElementGroup).deepSubs.forEach(sub => {
            sub.leanYBy(value, prevValue, element.angle, center);
          });
        }
      }
    });
  }

  /**
   * 设置组件边框类型
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeType(elements: IElement[], value: StrokeTypes, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].type === value) return;
        element.setStrokeType(value, index);
      }
    });
  }

  /**
   * 设置组件边框宽度
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeWidth(elements: IElement[], value: number, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].width === value) return;
        element.setStrokeWidth(value, index);
      }
    });
  }

  /**
   * 设置组件边框颜色
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeColor(elements: IElement[], value: string, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].color === value) return;
        element.setStrokeColor(value, index);
      }
    });
  }

  /**
   * 设置组件边框颜色透明度
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeColorOpacity(elements: IElement[], value: number, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].colorOpacity === value) return;
        element.setStrokeColorOpacity(value, index);
      }
    });
  }

  /**
   * 添加组件描边
   *
   * @param elements
   * @param prevIndex
   */
  async addElementsStroke(elements: IElement[], prevIndex: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.addStroke(prevIndex);
      }
    });
  }

  /**
   * 删除组件描边
   *
   * @param elements
   * @param index
   */
  async removeElementsStroke(elements: IElement[], index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.removeStroke(index);
      }
    });
  }

  /**
   * 设置组件填充颜色
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsFillColor(elements: IElement[], value: string, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.fills[index].color === value) return;
        element.setFillColor(value, index);
      }
    });
  }

  /**
   * 设置组件填充颜色透明度
   *
   * @param elements
   * @param value
   */
  async setElementsFillColorOpacity(elements: IElement[], value: number, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.fills[index].colorOpacity === value) return;
        element.setFillColorOpacity(value, index);
      }
    });
  }

  /**
   * 添加组件填充
   *
   * @param elements
   * @param prevIndex
   */
  async addElementsFill(elements: IElement[], prevIndex: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.addFill(prevIndex);
      }
    });
  }

  /**
   * 删除组件填充
   *
   * @param elements
   * @param index
   */
  async removeElementsFill(elements: IElement[], index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.removeFill(index);
      }
    });
  }

  /**
   * 设置组件文本对齐方式
   *
   * @param elements
   * @param value
   */
  async setElementsTextAlign(elements: IElement[], value: CanvasTextAlign): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.textAlign === value) return;
        element.setTextAlign(value);
      }
    });
  }

  /**
   * 设置组件文本基线
   *
   * @param elements
   * @param value
   */
  async setElementsTextBaseline(elements: IElement[], value: CanvasTextBaseline): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.textBaseline === value) return;
        element.setTextBaseline(value);
      }
    });
  }

  /**
   * 设置组件字体大小
   *
   * @param elements
   * @param value
   */
  async setElementsFontSize(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.fontSize === value) return;
        element.setFontSize(value);
      }
    });
  }

  /**
   * 设置组件字体
   *
   * @param elements
   * @param value
   */
  async setElementsFontFamily(elements: IElement[], value: string): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.fontFamily === value) return;
        element.setFontFamily(value);
      }
    });
  }

  /**
   * 锁定比例
   *
   * @param elements
   * @param value
   */
  async setElementsRatioLocked(elements: IElement[], value: boolean): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.isRatioLocked === value) return;
        element.setRatioLocked(value);
      }
    });
  }

  /**
   * 判断组件是否存在
   *
   * @param id
   * @returns
   */
  hasElement(id: string): boolean {
    return this._elementsMap.has(id);
  }

  /**
   * 通过id获取组件
   *
   * @param id
   * @returns
   */
  getElementById(id: string): IElement {
    return this._elementsMap.get(id);
  }

  /**
   * 通过id获取组件
   *
   * @param ids
   * @returns
   */
  getElementsByIds(ids: string[]): IElement[] {
    return ids.map(id => this.getElementById(id)).filter(element => element !== undefined);
  }

  /**
   * 获取组件在列表中的索引
   *
   * @param id
   * @returns
   */
  getIndexById(id: string): number {
    if (this.hasElement(id)) {
      this._elementList.forEachBreak(
        (node, index) => {
          if (node.value.id === id) {
            return index;
          }
        },
        node => {
          if (node.value.id === id) {
            return true;
          }
        },
      );
    }
    return -1;
  }

  /**
   * 添加组件
   *
   * @param element
   */
  addElement(element: IElement): IElement {
    this._elementList.insert(new LinkedNode(element));
    this._elementsMap.set(element.id, element);
    return element;
  }

  /**
   * 删除组件
   *
   * @param id
   */
  removeElement(id: string): IElement {
    if (this.hasElement(id)) {
      let element = this._elementsMap.get(id);
      this._elementList.removeBy(node => node.value.id === id);
      this._elementsMap.delete(id);
      element = null;
      return element;
    }
  }

  /**
   * 更新组件属性
   *
   * @param id
   * @param data
   * @param isRefresh
   * @returns
   */
  updateElementById(id: string, props: Partial<IElement>): IElement {
    if (this.hasElement(id)) {
      const element = this._elementsMap.get(id);
      Object.assign(element, props);
      return element;
    }
  }

  /**
   * 批量更新组件属性
   *
   * @param elements
   * @param props
   * @returns
   */
  updateElements(elements: IElement[], props: Partial<IElement>): IElement[] {
    elements.forEach(element => {
      return this.updateElementById(element.id, props);
    });
    return elements;
  }

  /**
   * 更新组件数据
   *
   * @param id
   * @param data
   */
  updateElementModel(id: string, data: Partial<ElementObject>): IElement {
    if (this.hasElement(id)) {
      const element = this._elementsMap.get(id);
      const modelId = element.model.id;
      LodashUtils.deepPlanObjectAssign(element.model, data, { id: modelId });
      return element;
    }
  }

  /**
   * 更新组件数据
   *
   * @param elements
   * @param props
   */
  updateElementsModel(elements: IElement[], props: Partial<ElementObject>): void {
    elements.forEach(element => {
      this.updateElementModel(element.id, props);
    });
  }

  /**
   * 创建组件的数据对象
   *
   * @param type
   * @param points
   * @param data
   * @returns
   */
  createElementModel(type: CreatorTypes, coords: IPoint[], data?: any): ElementObject {
    const size: ISize = ElementUtils.calcSize({
      coords,
      boxCoords: CommonUtils.getBoxPoints(coords),
      type,
    });
    const position: IPoint = ElementUtils.calcPosition({ type, coords });
    const model: ElementObject = {
      id: CommonUtils.getRandomDateId(),
      type,
      coords,
      boxCoords: CommonUtils.getBoxPoints(coords),
      data,
      width: size.width,
      height: size.height,
      name: `${CreatorHelper.getCreatorByType(type).name} ${+new Date()}`,
      styles: getDefaultElementStyle(type),
      isRatioLocked: false,
      ...position,
      ...DefaultAngleModel,
      ...DefaultCornerModel,
    };
    return model;
  }

  /**
   * 设置组件状态为创建中
   *
   * @param element
   */
  private _setElementProvisionalCreating(element: IElement): void {
    this.updateElementById(element.id, {
      status: ElementStatus.creating,
      isOnStage: true,
      isProvisional: true,
    });
  }

  /**
   * 创建一个临时组件
   *
   * @param model
   */
  private _createProvisionalElement(model: ElementObject): IElement {
    const element = ElementUtils.createElement(model, this.shield);
    this._currentCreatingElementId = element.id;
    this.updateElementById(element.id, {
      status: ElementStatus.startCreating,
    });
    this.addElement(element);
    return element;
  }

  /**
   * 选中并刷新组件
   *
   * @param element
   */
  private _selectAndRefreshProvisionalElement(element: IElement): void {
    if (element) {
      this.selectElement(element);
      element.refresh({ points: true, rotation: true });
    }
  }

  /**
   * 在当前鼠标位置创建临时组件
   *
   * @param coords
   */
  creatingElement(coords: IPoint[]): IElement {
    let element: IElement;
    const { category, type } = this.shield.currentCreator;
    switch (category) {
      case CreatorCategories.shapes: {
        const model = this.createElementModel(type, ElementUtils.calcCreatorPoints(coords, type));
        if (this._currentCreatingElementId) {
          element = this.updateElementModel(this._currentCreatingElementId, model);
          element.model.boxCoords = CommonUtils.getBoxPoints(element.model.coords);
          this._setElementProvisionalCreating(element);
        } else {
          element = this._createProvisionalElement(model);
        }
      }
      default:
        break;
    }
    this._selectAndRefreshProvisionalElement(element);
    return element;
  }

  /**
   * 创建一个自由绘制的组件
   *
   * @param coord
   * @param tailAppend true表示追加节点，false表示更新尾部节点
   * @returns
   */
  creatingArbitraryElement(coord: IPoint, tailAppend: boolean): IElement {
    let element: IElementArbitrary;
    let model: ElementObject;
    // 如果当前创建的组件id存在，则获取该组件
    if (this._currentCreatingElementId) {
      element = this.getElementById(this._currentCreatingElementId) as ElementArbitrary;
      model = element.model;
      // 如果tailAppend为true，则追加节点
      if (tailAppend) {
        // 判断点是否在第一个点附近
        const isClosestFirst = MathUtils.isPointClosest(coord, model.coords[0], ArbitraryPointClosestMargin / this.shield.stageScale);
        if (isClosestFirst) {
          if (element.tailCoordIndex > 0) {
            model.isFold = true;
          } else {
            // 最后一个点与第一个点重合，无法形成闭合图案
          }
        } else {
          model.coords.splice(model.coords.length - 1, 1, coord);
          element.tailCoordIndex = model.coords.length - 1;
        }
      } else {
        // 如果tailAppend为false，则更新尾部节点
        if (element.tailCoordIndex + 1 === model.coords.length) {
          model.coords.push(coord);
        } else {
          model.coords.splice(element.tailCoordIndex + 1, 1, coord);
        }
      }
      element.model.boxCoords = CommonUtils.getBoxPoints(element.model.coords);
      this._setElementProvisionalCreating(element);
    } else {
      // 如果当前创建的组件id不存在，则创建一个新的组件
      model = this.createElementModel(CreatorTypes.arbitrary, [coord]);
      model.isFold = false;
      element = this._createProvisionalElement(model) as ElementArbitrary;
      element.tailCoordIndex = 0;
    }
    element.refresh({ size: true });
    this._selectAndRefreshProvisionalElement(element);
    return element;
  }

  /**
   * 完成创建自由绘制组件
   *
   * @param element
   */
  private _finishArbitraryElement(element: ElementArbitrary): void {
    const tailCoordIndex = element.tailCoordIndex;
    element.tailCoordIndex = -1;
    if (tailCoordIndex < element.model.coords.length - 1) {
      element.model.coords = element.model.coords.slice(0, tailCoordIndex + 1);
    }
  }

  /**
   * 完成创建组件
   */
  finishCreatingElement(): IElement {
    if (this._currentCreatingElementId) {
      let element = this.getElementById(this._currentCreatingElementId);
      if (element) {
        this._currentCreatingElementId = null;
        const {
          model: { type },
        } = element;
        switch (type) {
          case CreatorTypes.arbitrary: {
            this._finishArbitraryElement(element as ElementArbitrary);
            break;
          }
        }
        this.updateElementById(element.id, { status: ElementStatus.finished });
        element.model.boxCoords = CommonUtils.getBoxPoints(element.model.coords);
        element.refresh();
        return element;
      }
    }
  }

  /**
   * 查找组件
   *
   * @param predicate
   * @returns
   */
  findElements(predicate: (node: IElement) => boolean): IElement[] {
    const result = [];
    this._elementList.forEach(node => {
      if (predicate(node.value)) {
        result.push(node.value);
      }
    });
    return result;
  }

  /**
   * 组件移动
   *
   * @param offset
   */
  updateSelectedElementsMovement(offset: IPoint): void {
    this.selectedElements.forEach(element => {
      this._moveElement(element, offset);
    });
  }

  /**
   * 移动组件
   *
   * @param element
   * @param offset
   */
  private _moveElement(element: IElement, offset: IPoint): void {
    const coords = ElementUtils.translateCoords(element.originalCoords, offset);
    const boxCoords = ElementUtils.translateCoords(element.originalBoxCoords, offset);
    const { x, y } = ElementUtils.calcPosition({
      type: element.model.type,
      coords,
    });
    this.updateElementModel(element.id, {
      coords,
      boxCoords,
      x,
      y,
    });
    element.refresh({ points: true, rotation: true, position: true });
  }

  /**
   * 形变
   *
   * @param offset
   */
  updateSelectedElementsTransform(offset: IPoint): void {
    this.updateElementsTransform(this.selectedElements, offset);
  }

  /**
   * 形变
   *
   * @param elements
   * @param offset
   */
  updateElementsTransform(elements: IElement[], offset: IPoint): void {
    elements.forEach(element => {
      element.transform(offset);
      if (element.isGroup && !element.isGroupSubject) {
        (element as IElementGroup).deepSubs.forEach(sub => {
          const {
            transformLockPoint,
            transformLockIndex,
            originalTransformMovePoint,
            transformType,
            model: { angle, leanYAngle },
          } = element;
          sub.transformBy({
            lockPoint: transformLockPoint,
            lockIndex: transformLockIndex,
            originalMovingPoint: originalTransformMovePoint,
            offset,
            groupAngle: angle,
            groupLeanYAngle: leanYAngle,
            transformType,
          });
        });
      }
    });
  }

  /**
   * 组件圆角半径
   *
   * @param offset
   */
  updateSelectedElementsCorner(offset: IPoint): void {
    this.updateElementsCorner(this.selectedElements, offset);
  }

  /**
   * 组件圆角半径
   *
   * @param elements
   * @param offset
   */
  updateElementsCorner(elements: IElement[], offset: IPoint): void {
    elements.forEach(element => {
      (element as IElementRect).updateCornerByOffset(offset);
    });
  }

  /**
   * 遍历所有节点
   *
   * @param callback
   */
  forEach(callback: (element: IElement, index: number) => void): void {
    this._elementList.forEach((node, index) => {
      callback(node.value, index);
    });
  }

  /**
   * 刷新model坐标
   *
   * @param elements
   * @param options
   */
  refreshElementsOriginals(elements: IElement[], options?: RefreshSubOptions): void {
    this._refreshElementsByFunc(elements, element => element.refresh({ originals: true }), options);
  }

  /**
   * 刷新组件角度
   *
   * @param elements
   * @param func
   * @param options
   */
  refreshElementsOriginalAngles(elements: IElement[], options?: RefreshSubOptions): void {
    this._refreshElementsByFunc(elements, element => element.refreshOriginalAngle(), options);
  }

  /**
   * 刷新组件属性
   *
   * @param elements
   * @param func
   * @param options
   */
  private _refreshElementsByFunc(elements: IElement[], func: (element: IElement) => void, options?: RefreshSubOptions): void {
    options = Object.assign({}, DefaultRefreshSubOptions, options || {});

    let ids = new Set<string>();
    /**
     * 刷新单个组件
     *
     * @param element
     */
    function refreshElement(element: IElement): void {
      if (ids.has(element.id)) return;
      ids.add(element.id);
      func(element);
    }

    elements.forEach(element => {
      refreshElement(element);
      if (element.isGroup) {
        if (options.deepSubs) {
          (element as IElementGroup).deepSubs.forEach(refreshElement);
        } else if (options.subs) {
          (element as IElementGroup).subs.forEach(refreshElement);
        }
      }
    });
    ids.clear();
    ids = null;
  }

  /**
   * 舞台位置移动时，实时更新组件坐标
   *
   * @param elements
   */
  refreshElementsPosition(elements: IElement[]): void {
    elements.forEach(element => {
      element.refresh({ points: true, rotation: true, position: true });
    });
  }

  /**
   * 刷新舞台上的所有组件，超出舞台范围的组件不予展示
   */
  refreshStageElements(): void {
    const stageWordRectCoords = this.shield.stageWordRectCoords;
    this._elementList.forEach(node => {
      const element = node.value;
      const isOnStage = element.isModelPolygonOverlap(stageWordRectCoords);
      this.updateElementById(element.id, { isOnStage });
      element.refresh({ points: true, rotation: true, originals: true });
    });
  }

  /**
   * 刷新组件
   *
   * @param elements
   */
  refreshElements(elements: IElement[]): void {
    elements.forEach(element => {
      element.refresh();
    });
  }

  /**
   * 检查当前鼠标命中的组件是否都已经被选中
   *
   * @returns
   */
  isSelectedContainsTarget(): boolean {
    const targetElements = this.shield.store.targetElements;
    if (targetElements.length === 0) return false;
    const targetIds = targetElements.map(item => item.id);
    const selectedIds = this.shield.store.selectedElements.map(item => item.id);
    return every(targetIds, item => includes(selectedIds, item));
  }

  /**
   * 计算旋转组件的中心点
   *
   * @param point
   */
  refreshRotatingStates(point: IPoint): void {
    this.refreshElementsRotationStates(this.rotatingTargetElements, point);
  }

  /**
   * 计算给定旋转组件的中心点
   *
   * @param point
   * @param elements
   *
   * @returns
   */
  refreshElementsRotationStates(elements: IElement[], point: IPoint): void {
    const { center, centerCoord, angle } = this.calcRotatingStatesByElements(point, elements);
    this._rotatingCenter = center;
    this._rotatingCenterCoord = centerCoord;
    this._rotatingOriginalAngle = angle;
  }

  /**
   * 计算给定旋转组件的中心点
   *
   * @param point
   * @param elements
   *
   * @returns
   */
  calcRotatingStatesByElements(point: IPoint, elements: IElement[]): { center: IPoint; centerCoord: IPoint; angle: number } {
    const center = MathUtils.calcCenter(elements.map(element => element.points).flat());
    const centerCoord = ElementUtils.calcWorldPoint(center, this.shield.stageCalcParams);
    const angle = MathUtils.precise(MathUtils.calcAngle(center, point));
    return { center, centerCoord, angle };
  }

  /**
   * 清除旋转属性
   */
  clearRotatingStates(): void {
    this._rotatingCenter = null;
    this._rotatingCenterCoord = null;
    this._rotatingOriginalAngle = null;
  }

  /**
   * 根据当前鼠标位置，计算旋转角度
   *
   * @param point
   */
  updateSelectedElementsRotation(point: IPoint): void {
    this.updateElementsRotation(this.rotatingTargetElements, point);
  }

  /**
   * 组件旋转操作
   *
   * @param elements
   * @param angle
   * @param originalAngle
   * @param centerCoord
   */
  updateElementsRotation(elements: IElement[], point: IPoint): void {
    const angle = MathUtils.precise(MathUtils.calcAngle(this._rotatingCenter, point));
    this.rotateElements(elements, angle, this._rotatingOriginalAngle, this._rotatingCenterCoord);
  }

  /**
   * 组件旋转操作
   *
   * @param elements
   * @param angle
   * @param originalAngle
   * @param centerCoord
   */
  rotateElements(elements: IElement[], angle: number, originalAngle: number, centerCoord: IPoint): void {
    elements.forEach(element => {
      angle = MathUtils.mirrorAngle(element.originalAngle + angle - originalAngle);
      angle = MathUtils.precise(angle, 1);
      element.setAngle(angle);
      if (element.isGroup) {
        (element as IElementGroup).deepSubs.forEach(sub => {
          sub.rotateBy(angle - element.originalAngle, centerCoord);
        });
      }
    });
  }

  /**
   * 创建图片组件
   *
   * @param image
   * @param options
   */
  async createImageElement(image: HTMLImageElement | ImageData, options: Partial<ImageData>): Promise<IElement> {
    const { colorSpace } = options;
    const { width, height } = image;
    const coords = CommonUtils.get4BoxPoints(this.shield.stageWorldCoord, {
      width,
      height,
    });
    const center = MathUtils.calcCenter(coords);
    const object: ElementObject = {
      id: CommonUtils.getRandomDateId(),
      coords,
      boxCoords: CommonUtils.getBoxPoints(coords),
      type: CreatorTypes.image,
      data: image,
      name: "image",
      width,
      height,
      length: 0,
      styles: getDefaultElementStyle(CreatorTypes.image),
      colorSpace,
      naturalWidth: width,
      naturalHeight: height,
      isRatioLocked: true,
      ...center,
      ...DefaultAngleModel,
      ...DefaultCornerModel,
    };
    const element = ElementUtils.createElement(object, this.shield);
    return element;
  }

  /**
   * 创建并插入图片组件
   *
   * @param image
   */
  async insertImageElement(image: HTMLImageElement | ImageData): Promise<IElement> {
    let colorSpace;
    if (image instanceof ImageData) {
      colorSpace = image.colorSpace;
      image = ImageUtils.createImageFromImageData(image);
      await ImageUtils.waitForImageLoad(image);
    }
    const element = await this.createImageElement(image, { colorSpace });
    this.addElement(element);
    this.updateElementById(element.id, {
      isOnStage: true,
      status: ElementStatus.finished,
      isSelected: true,
    });
    element.refresh({ points: true, rotation: true, originals: true });
    return element;
  }

  /**
   * 判断组件是否被选中
   *
   * @param element
   * @returns
   */
  isElementSelected(element: IElement): boolean {
    return this._selectedElementsMap.has(element.id);
  }

  /**
   * 删除选中组件
   */
  deleteSelects(): void {
    this._selectedElementsMap.keysArray().forEach(id => {
      this.removeElement(id);
    });
  }

  /**
   * 选中组件
   *
   * @param element
   */
  selectElement(element: IElement): void {
    this.updateElementById(element.id, { isSelected: true });
  }

  /**
   * 取消选中组件
   *
   * @param element
   */
  deSelectElement(element: IElement): void {
    this.updateElementById(element.id, { isSelected: false });
  }

  /**
   * 批量选中组件
   *
   * @param elements
   */
  selectElements(elements: IElement[]): void {
    elements.forEach(element => {
      this.selectElement(element);
    });
  }

  /**
   * 批量取消选中组件
   *
   * @param elements
   */
  deSelectElements(elements: IElement[]): void {
    elements.forEach(element => {
      this.deSelectElement(element);
    });
  }

  /**
   * 切换选中状态
   *
   * @param element
   */
  toggleSelectElement(element: IElement): void {
    if (this.isElementSelected(element)) {
      this.deSelectElement(element);
    } else {
      this.selectElement(element);
    }
  }

  /**
   * 批量切换选中状态
   *
   * @param elements
   */
  toggleSelectElements(elements: IElement[]): void {
    elements.forEach(element => {
      this.toggleSelectElement(element);
    });
  }

  /**
   * 全选
   */
  selectAll(): void {
    this._elementList.forEach(node => {
      this.selectElement(node.value);
    });
  }

  /**
   * 取消全选
   */
  deSelectAll(): void {
    this._elementList.forEach(node => {
      this.deSelectElement(node.value);
    });
  }
  /**
   * 取消高亮目标组件
   */
  cancelTargetElements(): void {
    this.targetElements.forEach(element => {
      this.updateElementById(element.id, { isTarget: false });
    });
  }
  /**
   * 开始编辑组件
   *
   * @param elements
   */
  beginEditingElements(elements: IElement[]): void {
    this._setElementsEditing(elements, true);
  }

  /**
   * 结束编辑组件
   *
   * @param elements
   */
  endEditingElements(elements: IElement[]): void {
    this._setElementsEditing(elements, false);
  }

  /**
   * 获取已完成的选中组件
   *
   * @returns
   */
  getFinishedSelectedElements(isExcludeGroupSubs: boolean): IElement[] {
    return this.selectedElements.filter(element => element.status === ElementStatus.finished && (isExcludeGroupSubs ? !element.isGroupSubject : true));
  }

  /**
   * 获取选中的组件
   *
   * @returns
   */
  getSelectedElements(isExcludeGroupSubs: boolean): IElement[] {
    return this.selectedElements.filter(element => (isExcludeGroupSubs ? !element.isGroupSubject : true));
  }

  /**
   * 设置组件编辑状态
   *
   * @param elements
   * @param value
   */
  private _setElementsEditing(elements: IElement[], value: boolean): void {
    elements.forEach(element => {
      if (element.editingEnable) {
        this.updateElementById(element.id, {
          isEditing: value,
          status: value ? ElementStatus.editing : ElementStatus.finished,
        });
        if (element.tfRefreshAfterEdChanged) {
          element.refreshTransformers();
          element.refreshOriginalTransformerPoints();
        }
      }
    });
  }

  /**
   * 判断选中的组件是否等于正在绘制的组件
   *
   * @returns
   */
  isSelectedEqCreating(): boolean {
    const selectedIds = new Set(this.selectedElements.map(element => element.id));
    const creatingIds = new Set(this.creatingElements.map(element => element.id));
    return isEqual(selectedIds, creatingIds);
  }

  /**
   * 绑定组件组合
   *
   * @param group
   */
  private _bindElementsGroup(group: IElementGroup): void {
    group.subs.forEach(element => {
      this.updateElementModel(element.id, { groupId: group.id });
    });
  }

  /**
   * 取消组件组合
   *
   * @param group
   */
  private _unbindElementsGroup(group: IElementGroup): void {
    this.updateElementsModel(group.getSubs(), { groupId: undefined });
    this.updateElementModel(group.id, { subIds: new Set() });
  }

  /**
   * 创建组合的数据对象
   *
   * @param elements
   */
  private _createElementGroupObject(elements: (IElement | IElementGroup)[]): ElementObject {
    // 过滤掉组合组件
    elements = elements.filter(element => !element.isGroupSubject);
    // 获取组合组件的子组件id
    const subIds = new Set(elements.map(element => element.id));
    // 获取组合组件的坐标
    const coords = CommonUtils.getBoxPoints(elements.map(element => element.rotateBoxCoords).flat());
    // 获取组合组件的宽高
    const { width, height, x, y } = CommonUtils.getRect(coords);
    // 返回组合组件的数据对象
    return {
      ...ElementUtils.createEmptyGroupObject(),
      subIds,
      coords,
      boxCoords: CommonUtils.getBoxPoints(coords),
      width,
      height,
      x: x + width / 2,
      y: y + height / 2,
    };
  }

  /**
   * 创建组合
   *
   * @param elements
   */
  createElementGroup(elements: (IElement | IElementGroup)[]): IElementGroup {
    // 创建组合组件
    const group = new ElementGroup(this._createElementGroupObject(elements), this.shield);
    // 绑定组合组件的子组件
    this._bindElementsGroup(group);
    // 添加组合组件
    this.addElement(group);
    // 设置组合组件状态
    this.updateElementById(group.id, {
      status: ElementStatus.finished,
      isOnStage: true,
    });
    // 刷新组合组件
    group.refresh();
    return group;
  }

  /**
   * 删除组合
   *
   * @param group
   */
  removeElementGroup(group: IElementGroup): void {
    if (this.hasElementGroup(group.id)) {
      // 取消绑定组合组件的子组件
      this._unbindElementsGroup(group);
      // 取消选中组合
      this.deSelectGroup(group);
      // 删除组合组件
      this.removeElement(group.id);
    }
  }

  /**
   * 判断组合是否存在
   *
   * @param id
   * @returns
   */
  hasElementGroup(id: string): boolean {
    return this.hasElement(id);
  }

  /**
   * 将选中的组件转换为组合
   */
  selectToGroup(): IElementGroup {
    const elements = this.selectedElements;
    if (elements.length < 2) {
      return null;
    }
    const isSameGroup = ElementUtils.isSameAncestorGroup(elements);
    if (isSameGroup) {
      return null;
    }
    const group = this.createElementGroup(elements);
    return group;
  }

  /**
   * 取消组合
   */
  cancelSelectedGroups(): IElementGroup[] {
    let groups = this.getSelectedAncestorElementGroups();
    if (groups.length === 0) {
      return null;
    }
    groups.forEach(group => {
      this.removeElementGroup(group);
    });
    return groups;
  }

  /**
   * 获取选中的组合
   */
  getSelectedElementGroups(): IElementGroup[] {
    return this.selectedElements.filter(element => element.model.type === CreatorTypes.group) as IElementGroup[];
  }

  /**
   * 获取选中的根组合
   */
  getSelectedAncestorElementGroups(): IElementGroup[] {
    return ElementUtils.getNoParentElements(this.getSelectedElementGroups()) as IElementGroup[];
  }

  /**
   * 选中组合
   *
   * @param group
   */
  selectGroup(group: IElementGroup): void {
    this.updateElementById(group.id, { isSelected: true });
  }

  /**
   * 取消选中组合
   *
   * @param group
   */
  deSelectGroup(group: IElementGroup): void {
    this.updateElementById(group.id, { isSelected: false });
  }

  /**
   * 取消选中组合
   *
   * @param groups
   */
  deSelectGroups(groups: IElementGroup[]): void {
    groups.forEach(group => {
      this.deSelectGroup(group);
    });
  }

  /**
   * 复制组件
   */
  async copySelectElements(): Promise<Array<ElementObject>> {
    return Promise.all(this.selectedElements.map(async element => await element.toJson()));
  }

  /**
   * 粘贴组件
   *
   * @param elementsJson
   */
  async pasteElements(elementsJson: Array<ElementObject>): Promise<IElement[]> {
    const result: IElement[] = [];
    const models = ElementUtils.convertElementsJson(elementsJson);
    for (const model of models) {
      await ElementUtils.convertElementModel(model);
      const element = ElementUtils.createElement(model, this.shield);
      Object.assign(element, { status: ElementStatus.finished, isOnStage: true, isSelected: true });
      this.addElement(element);
      element.refresh();
      result.push(element);
    }
    return result;
  }
}
