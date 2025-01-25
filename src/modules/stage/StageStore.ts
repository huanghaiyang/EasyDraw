import {
  ElementStatus,
  IPoint,
  ISize,
  ShieldDispatcherNames,
} from "@/types";
import LinkedNode, { ILinkedNode } from "@/modules/struct/LinkedNode";
import ElementUtils, { ElementListEventNames, ElementReactionPropNames } from "@/modules/elements/utils/ElementUtils";
import { every, flatten, includes, isEqual } from "lodash";
import ElementList from "@/modules/elements/helpers/ElementList";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import ElementSortedMap, { ElementSortedMapEventNames } from "@/modules/elements/helpers/ElementSortedMap";
import CreatorHelper from "@/types/CreatorHelper";
import IStageStore from "@/types/IStageStore";
import IStageShield from "@/types/IStageShield";
import IElement, { ElementObject, IElementArbitrary } from "@/types/IElement";
import { CreatorCategories, CreatorTypes } from "@/types/Creator";
import { getDefaultElementStyle, StrokeTypes } from "@/styles/ElementStyles";
import LodashUtils from "@/utils/LodashUtils";
import ImageUtils from "@/utils/ImageUtils";
import ElementArbitrary from "@/modules/elements/ElementArbitrary";
import { ArbitraryPointClosestMargin } from "@/types/Constants";
import { IElementGroup } from "@/types/IElementGroup";
import ElementGroup from "@/modules/elements/ElementGroup";

export default class StageStore implements IStageStore {
  shield: IStageShield;

  // 画板上绘制的元素列表（形状、文字、图片等）
  private _elementList: ElementList;
  // 当前正在创建的元素
  private _currentCreatingElementId;
  // 元素对象映射关系，加快查询
  private _elementsMap = new ElementSortedMap<string, IElement>();
  // 已渲染的组件映射关系
  private _provisionalElementsMap = new ElementSortedMap<string, IElement>();
  // 被选中的组件映射关系，加快查询
  private _selectedElementsMap = new ElementSortedMap<string, IElement>();
  // 命中的组件映射关系，加快查询
  private _targetElementsMap = new ElementSortedMap<string, IElement>();
  // 舞台元素映射关系，加快查询
  private _stageElementsMap = new ElementSortedMap<string, IElement>();
  // 未在舞台的元素映射关系，加快查询
  private _noneStageElementsMap = new ElementSortedMap<string, IElement>();
  // 可见元素映射关系，加快查询
  private _visibleElementsMap = new ElementSortedMap<string, IElement>();
  // 编辑中的元素映射关系，加快查询
  private _editingElementsMap = new ElementSortedMap<string, IElement>();
  // 选区元素映射关系，加快查询
  private _rangeElementsMap = new ElementSortedMap<string, IElement>();
  // 旋转目标元素映射关系，加快查询
  private _rotatingTargetElementsMap = new ElementSortedMap<string, IElement>();
  // 旋转组件中心点
  private _rotatingTargetElementsCenter: IPoint;
  // 旋转组件中心点-世界坐标
  private _rotatingTargetElementsCenterCoord: IPoint;

  constructor(shield: IStageShield) {
    this.shield = shield;
    this._elementList = new ElementList();
    this._reactionElementAdded();
    this._reactionElementRemoved();
    this._reactionElementsPropsChanged();

    this._selectedElementsMap.on(ElementSortedMapEventNames.changed, () => {
      this.shield.emit(ShieldDispatcherNames.selectedChanged, this.selectedElements)
    })
    this._targetElementsMap.on(ElementSortedMapEventNames.changed, () => {
      this.shield.emit(ShieldDispatcherNames.targetChanged, this.targetElements)
    })
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

  // 选中的根元素
  get selectedAncestorElement(): IElement {
    return this.getAncestorGroup(this.selectedElements);
  }

  // 选中的唯一组件
  get uniqSelectedElement(): IElement {
    const ancestorElement = this.selectedAncestorElement;
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

  // 是否元素列表为空
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

  /**
   * 组件新增
   */
  private _reactionElementAdded(): void {
    this._elementList.on(ElementListEventNames.added, (node: ILinkedNode<IElement>) => {
      const element = node.value;
      Object.keys(ElementReactionPropNames).forEach(propName => {
        this._reactionElementPropsChanged(ElementReactionPropNames[propName], element, element[propName]);
      })
    })
  }

  /**
   * 组件删除
   */
  private _reactionElementRemoved(): void {
    this._elementList.on(ElementListEventNames.removed, (node: ILinkedNode<IElement>) => {
      const element = node.value;
      // 删除元素在舞台上的映射关系
      this._stageElementsMap.delete(element.id);
      // 删除元素在选中的映射关系
      this._selectedElementsMap.delete(element.id);
      // 删除元素在未在舞台上的映射关系
      this._noneStageElementsMap.delete(element.id);
      // 删除元素在临时元素的映射关系
      this._provisionalElementsMap.delete(element.id);
      // 删除元素在命中的映射关系
      this._targetElementsMap.delete(element.id);
      // 删除元素在选区范围内的映射关系
      this._rangeElementsMap.delete(element.id);
      // 删除元素在可见的映射关系
      this._visibleElementsMap.delete(element.id);
      // 删除元素在旋转目标的映射关系
      this._rotatingTargetElementsMap.delete(element.id);
      // 删除元素在编辑中的映射关系
      this._editingElementsMap.delete(element.id);
    })
  }

  /**
   * 元素属性变化时，更新元素映射关系
   */
  private _reactionElementsPropsChanged(): void {
    Object.keys(ElementReactionPropNames).forEach(propName => {
      this._elementList.on(propName, (element, value) => {
        this._reactionElementPropsChanged(propName, element, value);
      })
    })
  }

  /**
   * 元素属性发生变化时，更新元素映射关系
   * 
   * @param propName 
   * @param element 
   * @param value 
   */
  private _reactionElementPropsChanged(propName: string, element: IElement, value: boolean | ElementStatus | IPoint): void {
    switch (propName) {
      // 选中元素
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
      // 是否临时元素
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
      // 元素状态
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
      // 元素位置
      case ElementReactionPropNames.position: {
        this.shield.emit(ShieldDispatcherNames.positionChanged, element, value)
        break;
      }
      // 元素角度
      case ElementReactionPropNames.angle: {
        this.shield.emit(ShieldDispatcherNames.angleChanged, element, value)
        break;
      }
      // 元素宽度
      case ElementReactionPropNames.width: {
        this.shield.emit(ShieldDispatcherNames.widthChanged, element, value)
        break;
      }
      // 元素高度
      case ElementReactionPropNames.height: {
        this.shield.emit(ShieldDispatcherNames.heightChanged, element, value)
        break;
      }
      // 元素边框类型
      case ElementReactionPropNames.strokeType: {
        this.shield.emit(ShieldDispatcherNames.strokeTypeChanged, element, value)
        break;
      }
      // 元素边框颜色
      case ElementReactionPropNames.strokeColor: {
        this.shield.emit(ShieldDispatcherNames.strokeColorChanged, element, value)
        break;
      }
      // 元素边框颜色透明度
      case ElementReactionPropNames.strokeColorOpacity: {
        this.shield.emit(ShieldDispatcherNames.strokeColorOpacityChanged, element, value)
        break;
      }
      // 元素边框宽度
      case ElementReactionPropNames.strokeWidth: {
        this.shield.emit(ShieldDispatcherNames.strokeWidthChanged, element, value)
        break;
      }
      // 元素填充颜色
      case ElementReactionPropNames.fillColor: {
        this.shield.emit(ShieldDispatcherNames.fillColorChanged, element, value)
        break;
      }
      // 元素填充颜色透明度
      case ElementReactionPropNames.fillColorOpacity: {
        this.shield.emit(ShieldDispatcherNames.fillColorOpacityChanged, element, value)
        break;
      }
      // 元素文本对齐方式
      case ElementReactionPropNames.textAlign: {
        this.shield.emit(ShieldDispatcherNames.textAlignChanged, element, value)
        break;
      }
      // 元素文本基线
      case ElementReactionPropNames.textBaseline: {
        this.shield.emit(ShieldDispatcherNames.textBaselineChanged, element, value)
        break;
      }
      // 是否锁定比例
      case ElementReactionPropNames.isRatioLocked: {
        this.shield.emit(ShieldDispatcherNames.ratioLockedChanged, element, value)
        break;
      }
      default: {
        break;
      }
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
      if (this.hasElement(element.id)) {
        const { left: prevLeft, top: prevTop } = element.model;
        const { x, y } = value;
        element.setPosition(x, y, { x: x - prevLeft, y: y - prevTop });
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
      if (this.hasElement(element.id)) {
        element.setWidth(value);
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
      if (this.hasElement(element.id)) {
        element.setHeight(value);
      }
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
      if (this.hasElement(element.id)) {
        element.setAngle(value);
      }
    });
  }

  /**
   * 设置组件边框类型
   * 
   * @param elements 
   * @param value 
   */
  async setElementsStrokeType(elements: IElement[], value: StrokeTypes): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setStrokeType(value);
      }
    });
  }

  /**
   * 设置组件边框宽度
   * 
   * @param elements 
   * @param value 
   */
  async setElementsStrokeWidth(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setStrokeWidth(value);
      }
    });
  }

  /**
   * 设置组件边框颜色
   * 
   * @param elements 
   * @param value 
   */
  async setElementsStrokeColor(elements: IElement[], value: string): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setStrokeColor(value);
      }
    });
  }

  /**
   * 设置组件边框颜色透明度
   * 
   * @param elements 
   * @param value 
   */
  async setElementsStrokeColorOpacity(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setStrokeColorOpacity(value);
      }
    });
  }

  /**
   * 设置组件填充颜色
   * 
   * @param elements 
   * @param value 
   */
  async setElementsFillColor(elements: IElement[], value: string): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFillColor(value);
      }
    });
  }

  /**
   * 设置组件填充颜色透明度
   * 
   * @param elements 
   * @param value 
   */
  async setElementsFillColorOpacity(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFillColorOpacity(value);
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
        element.setRatioLocked(value);
      }
    })
  }

  /**
   * 判断元素是否存在
   * 
   * @param id 
   * @returns 
   */
  hasElement(id: string): boolean {
    return this._elementsMap.has(id);
  }

  /**
   * 通过id获取元素
   * 
   * @param id 
   * @returns 
   */
  getElementById(id: string): IElement {
    return this._elementsMap.get(id);
  }

  /**
   * 通过id获取元素
   * 
   * @param ids 
   * @returns 
   */
  getElementsByIds(ids: string[]): IElement[] {
    return ids.map(id => this.getElementById(id)).filter(element => element !== undefined);
  }

  /**
   * 获取元素在列表中的索引
   * 
   * @param id 
   * @returns 
   */
  getIndexById(id: string): number {
    if (this.hasElement(id)) {
      this._elementList.forEachBreak((node, index) => {
        if (node.value.id === id) {
          return index;
        }
      }, (node) => {
        if (node.value.id === id) {
          return true;
        }
      })
    }
    return -1;
  }

  /**
   * 添加元素
   * 
   * @param element 
   */
  addElement(element: IElement): IElement {
    this._elementList.insert(new LinkedNode(element))
    this._elementsMap.set(element.id, element);
    return element;
  }

  /**
   * 删除元素
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
   * 更新元素属性
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
   * 批量更新元素属性
   * 
   * @param elements 
   * @param props 
   * @returns 
   */
  updateElements(elements: IElement[], props: Partial<IElement>): IElement[] {
    elements.forEach(element => {
      return this.updateElementById(element.id, props);
    })
    return elements;
  }

  /**
   * 更新元素数据
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
   * 更新元素数据
   * 
   * @param elements 
   * @param props 
   */
  updateElementsModel(elements: IElement[], props: Partial<ElementObject>): void {
    elements.forEach(element => {
      this.updateElementModel(element.id, props);
    })
  }

  /**
   * 创建元素的数据对象
   * 
   * @param type 
   * @param points 
   * @param data 
   * @returns 
   */
  createElementModel(type: CreatorTypes, coords: IPoint[], data?: any): ElementObject {
    const size: ISize = ElementUtils.calcSize({ coords, type });
    const position: IPoint = ElementUtils.calcPosition({ type, coords });
    const model: ElementObject = {
      id: CommonUtils.getRandomDateId(),
      type,
      coords,
      boxCoords: CommonUtils.getBoxPoints(coords),
      data,
      angle: 0,
      width: size.width,
      height: size.height,
      left: position.x,
      top: position.y,
      name: `${CreatorHelper.getCreatorByType(type).name} ${+new Date()}`,
      styles: getDefaultElementStyle(type),
      isRatioLocked: false,
    }
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
    })
  }

  /**
   * 创建一个临时组件
   * 
   * @param model 
   */
  private _createProvisionalElement(model: ElementObject): IElement {
    const element = ElementUtils.createElement(model, this.shield);
    this.updateElementById(element.id, {
      status: ElementStatus.startCreating,
    })
    this.addElement(element);
    this._currentCreatingElementId = element.id;
    return element;
  }

  /**
   * 选中并刷新元素
   * 
   * @param element 
   */
  private _selectAndRefreshProvisionalElement(element: IElement): void {
    if (element) {
      this.selectElement(element);
      element.refreshStagePoints();
    }
  }

  /**
   * 在当前鼠标位置创建临时元素
   * 
   * @param coords
   */
  creatingElement(coords: IPoint[]): IElement {
    let element: IElement;
    const { category, type } = this.shield.currentCreator;
    switch (category) {
      case CreatorCategories.shapes: {
        const model = this.createElementModel(type, ElementUtils.calcCreatorPoints(coords, type))
        if (this._currentCreatingElementId) {
          element = this.updateElementModel(this._currentCreatingElementId, model);
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
    // 如果当前创建的元素id存在，则获取该元素
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
            // 最后一个点与第一个点重合，无法形图案
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
      element.refreshBoxCoords();
      this._setElementProvisionalCreating(element);
    } else {
      // 如果当前创建的元素id不存在，则创建一个新的元素
      model = this.createElementModel(CreatorTypes.arbitrary, [coord]);
      model.isFold = false;
      element = this._createProvisionalElement(model) as ElementArbitrary;
      element.tailCoordIndex = 0;
    }
    this._selectAndRefreshProvisionalElement(element);
    return element;
  }

  /**
   * 完成创建自由绘制元素
   * 
   * @param element 
   */
  private _finishArbitraryElement(element: ElementArbitrary): void {
    const tailCoordIndex = element.tailCoordIndex;
    element.tailCoordIndex = -1;
    if (tailCoordIndex < element.model.coords.length - 1) {
      element.model.coords = element.model.coords.slice(0, tailCoordIndex + 1);
      element.refreshBoxCoords();
    }
  }

  /**
   * 完成创建元素
   */
  finishCreatingElement(): IElement {
    if (this._currentCreatingElementId) {
      let element = this.getElementById(this._currentCreatingElementId);
      if (element) {
        this._currentCreatingElementId = null;
        const { model: { type } } = element;
        switch (type) {
          case CreatorTypes.arbitrary: {
            this._finishArbitraryElement(element as ElementArbitrary);
            break;
          }
        }
        this.updateElementById(element.id, { status: ElementStatus.finished })
        element.refresh();
        return element;
      }
    }
  }

  /**
   * 查找元素
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
    })
    return result;
  }

  /**
   * 组件移动
   * 
   * @param offset 
   */
  updateSelectedElementsMovement(offset: IPoint): void {
    this.selectedElements.forEach(element => {
      const coords = ElementUtils.translateCoords(element.originalModelCoords, offset);
      const boxCoords = ElementUtils.translateCoords(element.originalModelBoxCoords, offset);
      const { x, y } = ElementUtils.calcPosition({ type: element.model.type, coords });
      this.updateElementModel(element.id, { coords, boxCoords, left: x, top: y })
      element.refreshStagePoints();
      element.refreshPosition();
    })
  }

  /**
   * 形变
   * 
   * @param offset 
   */
  updateSelectedElementsTransform(offset: IPoint): void {
    this.selectedElements.forEach(element => {
      element.transform(offset);
    })
  }

  /**
   * 遍历所有节点
   * 
   * @param callback 
   */
  forEach(callback: (element: IElement, index: number) => void): void {
    this._elementList.forEach((node, index) => {
      callback(node.value, index);
    })
  }

  /**
   * 刷新model坐标
   * 
   * @param elements 
   * @param options 
   */
  refreshElementsOriginals(elements: IElement[], options: { subs: boolean, deepSubs: boolean } = { subs: false, deepSubs: false }): void {
    elements.forEach(element => {
      element.refreshOriginalProps();
      if (element.isGroup) {
        if (options.subs) {
          (element as IElementGroup).subs.forEach(sub => {
            sub.refreshOriginalProps();
          })
        }
        if (options.deepSubs) {
          (element as IElementGroup).deepSubs.forEach(sub => {
            sub.refreshOriginalProps();
          })
        }
      }
    })
  }

  /**
   * 舞台位置移动时，实时更新组件坐标
   * 
   * @param elements 
   */
  refreshElementsPosition(elements: IElement[]): void {
    elements.forEach(element => {
      element.refreshStagePoints();
      element.refreshPosition();
    })
  }

  /**
   * 刷新舞台上的所有组件，超出舞台范围的组件不予展示
   */
  refreshStageElements(): void {
    const stageWordRectCoords = this.shield.stageWordRectCoords;
    this._elementList.forEach(node => {
      const element = node.value;
      const isOnStage = element.isModelPolygonOverlap(stageWordRectCoords);
      this.updateElementById(element.id, { isOnStage })
      element.refreshStagePoints();
      element.refreshOriginalProps();
    })
  }

  /**
   * 刷新组件
   * 
   * @param elements 
   */
  refreshElements(elements: IElement[]): void {
    elements.forEach(element => {
      element.refresh();
    })
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
    return every(targetIds, item => includes(selectedIds, item))
  }

  /**
   * 计算旋转组件的中心点
   */
  calcRotatingElementsCenter(): IPoint {
    const point = MathUtils.calcCenter(flatten(this.rotatingTargetElements.map(element => element.pathPoints)))
    this._rotatingTargetElementsCenter = point;
    this._rotatingTargetElementsCenterCoord = ElementUtils.calcWorldPoint(
      this._rotatingTargetElementsCenter, this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale
    );
    this.rotatingTargetElements.forEach(element => {
      element.originalAngle = element.model.angle;
      if (element.isGroup) {
        (element as IElementGroup).deepSubs.forEach(sub => {
          sub.originalAngle = sub.model.angle;
        })
      }
    })
    return point;
  }

  /**
   * 根据当前鼠标位置，计算旋转角度
   * 
   * @param point 
   */
  updateSelectedElementsRotation(point: IPoint): void {
    let angle = MathUtils.preciseToFixed(MathUtils.calcAngle(this._rotatingTargetElementsCenter, point) + 90);
    angle = ElementUtils.mirrorAngle(angle);
    this.rotatingTargetElements.forEach(element => {
      element.setAngle(angle);
      if (element.isGroup) {
        (element as IElementGroup).deepSubs.forEach(sub => {
          sub.rotateBy(angle - element.originalAngle, this._rotatingTargetElementsCenterCoord);
        })
      }
    })
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
    const coords = CommonUtils.get4BoxPoints(this.shield.stageWorldCoord, { width, height });
    const center = MathUtils.calcCenter(coords);
    const object: ElementObject = {
      id: CommonUtils.getRandomDateId(),
      coords,
      boxCoords: CommonUtils.getBoxPoints(coords),
      type: CreatorTypes.image,
      data: image,
      angle: 0,
      name: 'image',
      left: center.x,
      top: center.y,
      width: width,
      height: height,
      length: 0,
      styles: getDefaultElementStyle(CreatorTypes.image),
      colorSpace,
      naturalWidth: width,
      naturalHeight: height,
      isRatioLocked: true,
    }
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
    element.refreshStagePoints();
    element.refreshOriginalProps();
    return element;
  }

  /**
   * 判断元素是否被选中
   * 
   * @param element 
   * @returns 
   */
  isElementSelected(element: IElement): boolean {
    return this._selectedElementsMap.has(element.id);
  }

  /**
   * 删除选中元素
   */
  deleteSelects(): void {
    this._selectedElementsMap.keysArray().forEach((id) => {
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
    elements.forEach((element) => {
      this.selectElement(element);
    });
  }

  /**
   * 批量取消选中组件
   * 
   * @param elements 
   */
  deSelectElements(elements: IElement[]): void {
    elements.forEach((element) => {
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
    })
  }

  /**
   * 全选
   */
  selectAll(): void {
    this._elementList.forEach((node) => {
      this.selectElement(node.value);
    });
  }

  /**
   * 取消全选
   */
  deSelectAll(): void {
    this._elementList.forEach((node) => {
      this.deSelectElement(node.value);
    });
  }
  /**
   * 取消高亮目标元素
   */
  cancelTargetElements(): void {
    this.targetElements.forEach(element => {
      this.updateElementById(element.id, { isTarget: false });
    })
  }
  /**
   * 开始编辑元素
   * 
   * @param elements 
   */
  beginEditingElements(elements: IElement[]): void {
    this._setElementsEditing(elements, true);
  }

  /**
   * 结束编辑元素
   * 
   * @param elements 
   */
  endEditingElements(elements: IElement[]): void {
    this._setElementsEditing(elements, false);
  }

  /**
   * 获取已完成的选中元素
   * 
   * @returns 
   */
  getFinishedSelectedElements(isExcludeGroupSubs: boolean): IElement[] {
    return this.selectedElements.filter(element => element.status === ElementStatus.finished && (isExcludeGroupSubs ? !element.isGroupSubject : true));
  }

  /**
   * 设置元素编辑状态
   * 
   * @param elements 
   * @param value 
   */
  private _setElementsEditing(elements: IElement[], value: boolean): void {
    elements.forEach(element => {
      if (element.editingEnable) {
        this.updateElementById(element.id, { isEditing: value, status: value ? ElementStatus.editing : ElementStatus.finished });
        if (element.tfRefreshAfterEdChanged) {
          element.refreshTransformers();
          element.refreshOriginalTransformerPoints();
        }
      }
    })
  }

  /**
   * 判断选中的元素是否等于正在绘制的元素
   * 
   * @returns 
   */
  isSelectedEqCreating(): boolean {
    const selectedIds = new Set(this.selectedElements.map(element => element.id));
    const creatingIds = new Set(this.creatingElements.map(element => element.id));
    return isEqual(selectedIds, creatingIds);
  }

  /**
   * 绑定元素组合
   * 
   * @param group 
   */
  private _bindElementsGroup(group: IElementGroup): void {
    group.subs.forEach(element => {
      this.updateElementModel(element.id, { groupId: group.id });
    });
  }

  /**
   * 取消元素组合
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
    // 过滤掉组合元素
    elements = elements.filter(element => !element.isGroupSubject);
    // 获取组合元素的子元素id
    const subIds = new Set(elements.map(element => element.id));
    // 获取组合元素的坐标
    const coords = CommonUtils.getBoxPoints(flatten(elements.map(element => element.rotateBoxCoords)));
    // 获取组合元素的宽高
    const { width, height, x: left, y: top } = CommonUtils.getRect(coords);
    // 返回组合元素的数据对象
    return {
      id: CommonUtils.getRandomDateId(),
      subIds,
      coords,
      boxCoords: CommonUtils.getBoxPoints(coords),
      width,
      height,
      angle: 0,
      styles: {},
      left: left + width / 2,
      top: top + height / 2,
      type: CreatorTypes.group,
    };
  }

  /**
   * 创建组合
   * 
   * @param elements 
   */
  createElementGroup(elements: (IElement | IElementGroup)[]): IElementGroup {
    // 创建组合元素
    const group = new ElementGroup(this._createElementGroupObject(elements), this.shield);
    // 绑定组合元素的子元素
    this._bindElementsGroup(group);
    // 添加组合元素
    this.addElement(group);
    // 设置组合元素状态
    this.updateElementById(group.id, { status: ElementStatus.finished, isOnStage: true });
    // 刷新组合元素
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
      // 取消绑定组合元素的子元素
      this._unbindElementsGroup(group);
      // 取消选中组合
      this.deSelectGroup(group);
      // 删除组合元素
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
   * 将选中的元素转换为组合
   */
  selectToGroup(): IElementGroup {
    const elements = this.selectedElements;
    if (elements.length < 2) {
      return null;
    }
    const isSameGroup = this.isSameAncestorGroup(elements);
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
    })
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
    return this.getNoParentElements(this.getSelectedElementGroups()) as IElementGroup[];
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
    })
  }

  /**
   * 判定给定的元素是否属于同一个组合
   * 
   * @param elements 
   */
  isSameAncestorGroup(elements: IElement[]): boolean {
    if (elements.length <= 1) return true;
    const ancestorGroup = this.getAncestorGroup(elements);
    return ancestorGroup !== null;
  }

  /**
   * 获取选中的根元素
   * 
   * @param elements 
   */
  getAncestorGroup(elements: IElement[]): IElement {
    if (elements.length === 0) return null;
    const noParentElements = this.getNoParentElements(elements);
    if (noParentElements.length > 1) return null;
    return noParentElements[0];
  }

  /**
   * 获取非组合元素
   * 
   * @param elements 
   */
  getNoParentElements(elements: IElement[]): IElement[] {
    return elements.filter(element => !element.isGroupSubject);
  }
}