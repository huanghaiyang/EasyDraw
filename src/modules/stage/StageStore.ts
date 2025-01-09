import {
  ElementStatus,
  IPoint,
  ISize,
  ShieldDispatcherNames,
} from "@/types";
import LinkedNode, { ILinkedNode } from "@/modules/struct/LinkedNode";
import ElementUtils, { ElementListEventNames, ElementReactionPropNames } from "@/modules/elements/utils/ElementUtils";
import { flatten } from "lodash";
import ElementList from "@/modules/elements/helpers/ElementList";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import ElementSortedMap, { ElementSortedMapEventNames } from "@/modules/elements/helpers/ElementSortedMap";
import CreatorHelper from "@/types/CreatorHelper";
import IStageStore from "@/types/IStageStore";
import IStageShield from "@/types/IStageShield";
import IElement, { ElementObject, ImageElementObject } from "@/types/IElement";
import { CreatorCategories, CreatorTypes } from "@/types/Creator";
import { getDefaultElementStyle, StrokeTypes } from "@/types/ElementStyles";
import LodashUtils from "@/utils/LodashUtils";
import { DefaultImageStagePadding } from "@/types/Stage";
import ImageUtils from "@/utils/ImageUtils";

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
  // 选区元素映射关系，加快查询
  private _rangeElementsMap = new ElementSortedMap<string, IElement>();
  // 旋转目标元素映射关系，加快查询
  private _rotatingTargetElementsMap = new ElementSortedMap<string, IElement>();
  // 旋转组件中心点
  private _rotatingTargetElementsCentroid: IPoint;

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

  get selectedElements(): IElement[] {
    return this._selectedElementsMap.valuesArray();
  }

  get targetElements(): IElement[] {
    return this._targetElementsMap.valuesArray();
  }

  get stageElements(): IElement[] {
    return this._stageElementsMap.valuesArray();
  }

  get noneStageElements(): IElement[] {
    return this._noneStageElementsMap.valuesArray();
  }

  get rangeElements(): IElement[] {
    return this._rangeElementsMap.valuesArray();
  }

  get visibleElements(): IElement[] {
    return this._visibleElementsMap.valuesArray();
  }

  get uniqSelectedElement(): IElement {
    if (this.selectedElements.length === 1 && !this.selectedElements[0].isProvisional) return this.selectedElements[0];
  }

  get rotatingTargetElements(): IElement[] {
    return this._rotatingTargetElementsMap.valuesArray();
  }

  get isSelectedEmpty(): boolean {
    return this.selectedElements.length === 0;
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
      this._stageElementsMap.delete(element.id);
      this._selectedElementsMap.delete(element.id);
      this._noneStageElementsMap.delete(element.id);
      this._provisionalElementsMap.delete(element.id);
      this._targetElementsMap.delete(element.id);
      this._rangeElementsMap.delete(element.id);
      this._visibleElementsMap.delete(element.id);
      this._rotatingTargetElementsMap.delete(element.id);
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
      case ElementReactionPropNames.isSelected: {
        if (value) {
          this._selectedElementsMap.set(element.id, element);
        } else {
          this._selectedElementsMap.delete(element.id);
        }
        break;
      }
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
      case ElementReactionPropNames.isProvisional: {
        if (value) {
          this._provisionalElementsMap.set(element.id, element);
        } else {
          this._provisionalElementsMap.delete(element.id);
        }
        break;
      }
      case ElementReactionPropNames.isTarget: {
        if (value) {
          this._targetElementsMap.set(element.id, element);
        } else {
          this._targetElementsMap.delete(element.id);
        }
        break;
      }
      case ElementReactionPropNames.isInRange: {
        if (value) {
          this._rangeElementsMap.set(element.id, element);
        } else {
          this._rangeElementsMap.delete(element.id);
        }
        break;
      }
      case ElementReactionPropNames.isVisible: {
        if (value) {
          this._visibleElementsMap.set(element.id, element);
        } else {
          this._visibleElementsMap.delete(element.id);
        }
        break;
      }
      case ElementReactionPropNames.status: {
        if (this._currentCreatingElementId && value === ElementStatus.creating) {
          this._selectedElementsMap.set(element.id, element);
        }
        break;
      }
      case ElementReactionPropNames.isRotatingTarget: {
        if (value) {
          this._rotatingTargetElementsMap.set(element.id, element);
        } else {
          this._rotatingTargetElementsMap.delete(element.id);
        }
        break;
      }
      case ElementReactionPropNames.position: {
        this.shield.emit(ShieldDispatcherNames.positionChanged, element, value)
        break;
      }
      case ElementReactionPropNames.angle: {
        this.shield.emit(ShieldDispatcherNames.angleChanged, element, value)
        break;
      }
      case ElementReactionPropNames.width: {
        this.shield.emit(ShieldDispatcherNames.widthChanged, element, value)
        break;
      }
      case ElementReactionPropNames.height: {
        this.shield.emit(ShieldDispatcherNames.heightChanged, element, value)
        break;
      }
      case ElementReactionPropNames.strokeType: {
        this.shield.emit(ShieldDispatcherNames.strokeTypeChanged, element, value)
        break;
      }
      case ElementReactionPropNames.strokeColor: {
        this.shield.emit(ShieldDispatcherNames.strokeColorChanged, element, value)
        break;
      }
      case ElementReactionPropNames.strokeColorOpacity: {
        this.shield.emit(ShieldDispatcherNames.strokeColorOpacityChanged, element, value)
        break;
      }
      case ElementReactionPropNames.strokeWidth: {
        this.shield.emit(ShieldDispatcherNames.strokeWidthChanged, element, value)
        break;
      }
      case ElementReactionPropNames.fillColor: {
        this.shield.emit(ShieldDispatcherNames.fillColorChanged, element, value)
        break;
      }
      case ElementReactionPropNames.fillColorOpacity: {
        this.shield.emit(ShieldDispatcherNames.fillColorOpacityChanged, element, value)
        break;
      }
      case ElementReactionPropNames.textAlign: {
        this.shield.emit(ShieldDispatcherNames.textAlignChanged, element, value)
        break;
      }
      case ElementReactionPropNames.textBaseline: {
        this.shield.emit(ShieldDispatcherNames.textBaselineChanged, element, value)
        break;
      }
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
        const { coords, left: prevLeft, top: prevTop } = element.model;
        const { x, y } = value;
        element.setPosition(x, y, coords.map(coord => ({ x: coord.x + x - prevLeft, y: coord.y + y - prevTop })));
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
      const element = this._elementsMap.get(id);
      this._elementList.removeBy(node => node.value.id === id);
      this._elementsMap.delete(id);
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
          this.updateElementById(element.id, {
            status: ElementStatus.creating,
            isOnStage: true,
            isProvisional: true,
          })
        } else {
          element = ElementUtils.createElement(model);
          this.updateElementById(element.id, {
            status: ElementStatus.startCreating,
          })
          this.addElement(element);
          this._currentCreatingElementId = element.id;
        }
      }
      default:
        break;
    }
    if (element) {
      this.selectElement(element);
      this.refreshElementStagePoints(element);
    }
    return element;
  }

  /**
   * 完成创建元素
   */
  finishCreatingElement(): IElement {
    if (this._currentCreatingElementId) {
      const element = this.getElementById(this._currentCreatingElementId);
      if (element) {
        this._currentCreatingElementId = null;
        this.updateElementById(element.id, {
          status: ElementStatus.finished,
        })
        element.refreshOriginalProps();
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
      const { x, y } = ElementUtils.calcPosition({ type: element.model.type, coords });
      this.updateElementModel(element.id, { coords, left: x, top: y })
      this.refreshElementStagePoints(element);
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
   */
  restoreElementsOriginalProps(elements: IElement[]): void {
    elements.forEach(element => {
      element.refreshOriginalProps();
    })
  }

  /**
   * 舞台位置移动时，实时更新组件坐标
   * 
   * @param elements 
   */
  refreshElementsPosition(elements: IElement[]): void {
    elements.forEach(element => {
      this.refreshElementStagePoints(element);
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
      this.refreshElementStagePoints(element);
      element.refreshOriginalProps();
    })
  }

  /**
   * 计算旋转组件的中心点
   */
  calcRotatingElementsCentroid(): IPoint {
    const point = MathUtils.calcPolygonCentroid(flatten(this.selectedElements.map(element => element.pathPoints)))
    this._rotatingTargetElementsCentroid = point;
    return point;
  }

  /**
   * 根据当前鼠标位置，计算旋转角度
   * 
   * @param point 
   */
  updateSelectedElementsRotation(point: IPoint): void {
    let angle = MathUtils.preciseToFixed(MathUtils.calculateAngle(this._rotatingTargetElementsCentroid, point) + 90);
    if (angle > 180) {
      angle = angle - 360;
    }
    this.rotatingTargetElements.forEach(element => {
      element.setAngle(angle);
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
    const coords = ElementUtils.calcRectangleCoordsInStage(width, height, this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale, DefaultImageStagePadding);
    const centroid = MathUtils.calcPolygonCentroid(coords);
    const object: ImageElementObject = {
      id: CommonUtils.getRandomDateId(),
      coords,
      type: CreatorTypes.image,
      data: image,
      angle: 0,
      name: 'image',
      left: centroid.x,
      top: centroid.y,
      width: width,
      height: height,
      length: 0,
      styles: getDefaultElementStyle(CreatorTypes.image),
      colorSpace,
      naturalWidth: width,
      naturalHeight: height,
      isRatioLocked: false,
    }
    const element = ElementUtils.createElement(object);
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
    this.refreshElementStagePoints(element);
    return element;
  }

  /**
   * 刷新组件坐标
   * 
   * @param element 
   */
  private refreshElementStagePoints(element: IElement): void {
    element.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale);
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
}