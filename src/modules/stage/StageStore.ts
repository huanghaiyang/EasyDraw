import {
  CreatorCategories,
  CreatorTypes,
  ElementStatus,
  ElementObject,
  IPoint,
  IStageElement,
  IStageShield,
  IStageStore,
  StageStoreRefreshCacheTypes
} from "@/types";
import { nanoid } from "nanoid";
import LinkedNode from "@/modules/struct/LinkedNode";
import ElementUtils from "@/modules/elements/ElementUtils";
import { cloneDeep, isArray } from "lodash";
import ElementList from "@/modules/elements/ElementList";

export default class StageStore implements IStageStore {
  shield: IStageShield;

  // 画板上绘制的元素列表（形状、文字、图片等）
  private elementList: ElementList;
  // 当前正在创建的元素
  private currentCreatingElementId;
  // 元素对象映射关系，加快查询
  private elementMap = new Map<string, IStageElement>();

  private _creatingElements: IStageElement[] = [];
  private _renderedElements: IStageElement[] = [];
  private _noneRenderedElements: IStageElement[] = [];
  private _selectedElements: IStageElement[] = [];
  private _hittingElements: IStageElement[] = [];
  private _stageElements: IStageElement[] = [];
  private _noneStageElements: IStageElement[] = [];

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.elementList = new ElementList();
  }

  // 当前创建并更新中的组件
  get creatingElements(): IStageElement[] {
    return this._creatingElements;
  }

  // 已经渲染到舞台的组件
  get renderedElements(): IStageElement[] {
    return this._renderedElements;
  }

  // 没有渲染到舞台的组件
  get noneRenderedElements(): IStageElement[] {
    return this._noneRenderedElements;
  }

  get selectedElements(): IStageElement[] {
    return this._selectedElements;
  }

  get hittingElements(): IStageElement[] {
    return this._hittingElements;
  }

  get stageElements(): IStageElement[] {
    return this._stageElements;
  }

  get noneStageElements(): IStageElement[] {
    return this._noneStageElements;
  }

  private _refreshStatusElements(): void {
    this._creatingElements = [];
    this.elementList.forEach(item => {
      if (item.data.status === ElementStatus.creating) {
        this._creatingElements.push(item.data);
      }
    })
  }

  private _refreshRenderedElements(): void {
    this._renderedElements = [];
    this._noneRenderedElements = [];

    this.elementList.forEach(item => {
      if (item.data.isRendered) {
        this._renderedElements.push(item.data);
      } else {
        this._noneRenderedElements.push(item.data);
      }
    })
  }

  private _refreshSelectedElements(): void {
    this._selectedElements = [];
    this.renderedElements.forEach(item => {
      if (item.isSelected) {
        this._selectedElements.push(item);
      }
    })
    if (this._selectedElements.length === 0) {
      if (this.currentCreatingElementId) {
        this._selectedElements.push(this.getElementById(this.currentCreatingElementId));
      }
    }
  }

  private _refreshHittingElements(): void {
    this._hittingElements = [];
    this.renderedElements.forEach(item => {
      if (item.isHitting) {
        this._hittingElements.push(item);
      }
    })
  }

  private _refreshStageElements(): void {
    this._stageElements = [];
    this._noneStageElements = [];

    this.elementList.forEach(item => {
      if (item.data.isOnStage) {
        this._stageElements.push(item.data);
      } else {
        this._noneStageElements.push(item.data);
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
    return this.elementMap.has(id);
  }

  /**
   * 通过id获取元素
   * 
   * @param id 
   * @returns 
   */
  getElementById(id: string): IStageElement {
    return this.elementMap.get(id);
  }

  /**
   * 获取元素在列表中的索引
   * 
   * @param id 
   * @returns 
   */
  getIndexById(id: string): number {
    if (this.hasElement(id)) {
      this.elementList.forEachBreak((node, index) => {
        if (node.data.id === id) {
          return index;
        }
      }, (node) => {
        if (node.data.id === id) {
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
  addElement(element: IStageElement): IStageElement {
    this.elementList.insert(new LinkedNode(element))
    this.elementMap.set(element.id, element);
    this.refreshElementCaches();
    return element;
  }

  /**
   * 删除元素
   * 
   * @param id 
   */
  removeElement(id: string): IStageElement {
    if (this.hasElement(id)) {
      const element = this.elementMap.get(id);
      this.elementList.removeBy(node => node.data.id === id);
      this.elementMap.delete(id);
      this.refreshElementCaches();
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
  updateElement(id: string, props: Partial<IStageElement>): IStageElement {
    if (this.hasElement(id)) {
      const element = this.elementMap.get(id);
      Object.assign(element, props);
      this.refreshElementCaches(this._getRefreshCacheTypes(props));
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
  updateElements(elements: IStageElement[], props: Partial<IStageElement>): IStageElement[] {
    elements.forEach(element => {
      return this.updateElement(element.id, props);
    })
    return elements;
  }

  /**
   * 更新元素数据
   * 
   * @param id 
   * @param data 
   */
  updateElementModel(id: string, data: Partial<ElementObject>): IStageElement {
    if (this.hasElement(id)) {
      const element = this.elementMap.get(id);
      const modelId = element.model.id;
      Object.assign(element.model, data, { id: modelId });
      return element;
    }
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
    const model = {
      id: nanoid(),
      type,
      coords,
      originalCoords: cloneDeep(coords),
      data,
      angle: 0
    }
    return model;
  }

  /**
   * 在当前鼠标位置创建临时元素
   * 
   * @param points
   */
  creatingElement(points: IPoint[]): IStageElement {
    let element: IStageElement;
    const { category, type } = this.shield.currentCreator;
    switch (category) {
      case CreatorCategories.shapes: {
        const model = this.createElementModel(type, ElementUtils.calcCreatorPoints(points, type))
        if (this.currentCreatingElementId) {
          element = this.updateElementModel(this.currentCreatingElementId, model);
          this.updateElement(element.id, {
            status: ElementStatus.creating,
          })
        } else {
          element = ElementUtils.createElement(model);
          this.updateElement(element.id, {
            isRendered: false,
            status: ElementStatus.startCreating,
          })
          this.addElement(element);
          this.currentCreatingElementId = element.id;
        }
      }
      default:
        break;
    }
    if (element) {
      this.updateElement(element.id, {
        isSelected: true,
      })
      element.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord);
    }
    return element;
  }

  /**
   * 完成创建元素
   */
  finishCreatingElement(): IStageElement {
    if (this.currentCreatingElementId) {
      const element = this.getElementById(this.currentCreatingElementId);
      if (element) {
        this.currentCreatingElementId = null;
        this.updateElement(element.id, {
          status: ElementStatus.finished,
        })
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
  findElements(predicate: (node: IStageElement) => boolean): IStageElement[] {
    const result = [];
    this.elementList.forEach(node => {
      if (predicate(node.data)) {
        result.push(node.data);
      }
    })
    return result;
  }

  /**
   * 刷新组件相对于舞台的坐标
   * 
   * @param element
   */
  refreshElementStagePoints(element: IStageElement[]): void {
    element.forEach(element => {
      element.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord);
    })
  }

  /**
   * 刷新所有组件相对于舞台的坐标
   */
  refreshAllElementStagePoints(): void {
    this.elementList.forEach(node => {
      node.data.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord);
    })
  }

  /**
   * 刷新元素列表
   * 
   * @param cacheTypes
   */
  refreshElementCaches(cacheTypes?: StageStoreRefreshCacheTypes[]): void {
    if (!cacheTypes) {
      this._refreshStatusElements();
      this._refreshRenderedElements();
      this._refreshSelectedElements();
      this._refreshHittingElements();
      this._refreshStageElements();
    } else {
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.status)) {
        this._refreshStatusElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.rendered)) {
        this._refreshRenderedElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.selected)) {
        this._refreshSelectedElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.hitting)) {
        this._refreshHittingElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.onStage)) {
        this._refreshStageElements();
      }
    }
  }

  /**
   * 获取刷新缓存类型
   * 
   * @param props 
   * @returns 
   */
  private _getRefreshCacheTypes(element: Partial<IStageElement> | string[]): StageStoreRefreshCacheTypes[] {
    const result: StageStoreRefreshCacheTypes[] = [];
    if (isArray(element)) {
      if (element.includes('status')) {
        result.push(StageStoreRefreshCacheTypes.status);
      }
      if (element.includes('isSelected')) {
        result.push(StageStoreRefreshCacheTypes.selected);
      }
      if (element.includes('isRendered')) {
        result.push(StageStoreRefreshCacheTypes.rendered);
      }
      if (element.includes('isHitting')) {
        result.push(StageStoreRefreshCacheTypes.hitting);
      }
      if (element.includes('isOnStage')) {
        result.push(StageStoreRefreshCacheTypes.onStage);
      }
    } else {
      if (element.hasOwnProperty('status')) {
        result.push(StageStoreRefreshCacheTypes.status);
      }
      if (element.hasOwnProperty('isSelected')) {
        result.push(StageStoreRefreshCacheTypes.selected);
      }
      if (element.hasOwnProperty('isRendered')) {
        result.push(StageStoreRefreshCacheTypes.rendered);
      }
      if (element.hasOwnProperty('isHitting')) {
        result.push(StageStoreRefreshCacheTypes.hitting);
      }
      if (element.hasOwnProperty('isOnStage')) {
        result.push(StageStoreRefreshCacheTypes.onStage);
      }
    }
    return result;
  }

  /**
   * 组件移动
   * 
   * @param offset 
   */
  updateSelectedElementsMovement(offset: IPoint): void {
    this.selectedElements.forEach(element => {
      this.updateElementModel(element.id, {
        coords: element.model.originalCoords.map(point => {
          return {
            x: point.x + offset.x,
            y: point.y + offset.y,
          }
        })
      })
      element.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord);
    })
  }

  /**
   * 遍历所有节点
   * 
   * @param callback 
   */
  forEach(callback: (element: IStageElement, index: number) => void): void {
    this.elementList.forEach((node, index) => {
      callback(node.data, index);
    })
  }

  /**
   * 组件坐标更新
   * @param elements 
   */
  refreshElementsCoords(elements: IStageElement[]): void {
    elements.forEach(element => {
      this.updateElementModel(element.id, {
        originalCoords: cloneDeep(element.model.coords),
      })
      element.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord);
    })
  }
}