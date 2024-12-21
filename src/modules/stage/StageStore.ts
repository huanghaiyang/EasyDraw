import { CreatorCategories, CreatorTypes, ElementStatus, ElementObject, IPoint, IStageElement, IStageShield, IStageStore, StageStoreRefreshCacheTypes } from "@/types";
import { nanoid } from "nanoid";
import LinkedList, { ILinkedList } from "@/modules/struct/LinkedList";
import LinkedNode, { ILinkedNode } from "@/modules/struct/LinkedNode";
import ElementUtils from "@/modules/elements/ElementUtils";
import { isArray } from "lodash";

export default class StageStore implements IStageStore {
  shield: IStageShield;

  // 画板上绘制的元素列表（形状、文字、图片等）
  private elementList: ILinkedList<ILinkedNode<IStageElement>>;
  // 当前正在创建的元素
  private currentCreatingElementId;
  // 元素对象映射关系，加快查询
  private elementMap = new Map<string, IStageElement>();

  private _startCreatingElements: IStageElement[] = [];
  private _creatingElements: IStageElement[] = [];
  private _renderedElements: IStageElement[] = [];
  private _noneRenderedElements: IStageElement[] = [];
  private _selectedElements: IStageElement[] = [];
  private _hittingElements: IStageElement[] = [];

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.elementList = new LinkedList<IStageElement>();
  }

  // 正在创建的元素列表
  get startCreatingElements(): IStageElement[] {
    return this._startCreatingElements;
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

  private _refreshStartCreatingElements(): void {
    this._startCreatingElements = [];
    this.elementList.forEach(item => {
      if (item.data.status === ElementStatus.startCreating) {
        this._startCreatingElements.push(item.data);
      }
    })
  }

  private _refreshCreatingElements(): void {
    this._creatingElements = [];
    this.elementList.forEach(item => {
      if (item.data.status === ElementStatus.creating) {
        this._creatingElements.push(item.data);
      }
    })
  }

  private _refreshRenderedElements(): void {
    this._renderedElements = [];
    this.elementList.forEach(item => {
      if (item.data.isRendered) {
        this._renderedElements.push(item.data);
      }
    })
  }

  private _refreshNoneRenderedElements(): void {
    this._noneRenderedElements = [];
    this.elementList.forEach(item => {
      if (!item.data.isRendered) {
        this._noneRenderedElements.push(item.data);
      }
    })
  }

  private _refreshSelectedElements(): void {
    this._selectedElements = [];
    this.elementList.forEach(item => {
      if (item.data.isSelected) {
        this._selectedElements.push(item.data);
      }
    })
  }

  private _refreshHittingElements(): void {
    this._hittingElements = [];
    this.elementList.forEach(item => {
      if (item.data.isHitting) {
        this._hittingElements.push(item.data);
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
  updateElement(id: string, props: Partial<IStageElement>, isRefresh: boolean = true): IStageElement {
    if (this.hasElement(id)) {
      const element = this.elementMap.get(id);
      Object.assign(element, props);
      if (isRefresh) {
        this.refreshElementCaches(this._getRefreshCacheTypes(props));
      }
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
  updateElements(elements: IStageElement[], props: Partial<IStageElement>, isRefresh: boolean = true): IStageElement[] {
    elements.forEach(element => {
      return this.updateElement(element.id, props, isRefresh);
    })
    if (isRefresh) {
      this.refreshElementCaches();
    }
    return elements;
  }

  /**
   * 更新元素数据
   * 
   * @param id 
   * @param data 
   */
  updateElementObj(id: string, data: ElementObject): IStageElement {
    if (this.hasElement(id)) {
      const element = this.elementMap.get(id);
      const objId = element.obj.id;
      Object.assign(element.obj, data, { id: objId });
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
  createObject(type: CreatorTypes, coords: IPoint[], data?: any): ElementObject {
    const obj = {
      id: nanoid(),
      type,
      coords,
      data,
      angle: 0
    }
    return obj;
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
        const obj = this.createObject(type, ElementUtils.calcCreatorPoints(points, type))
        if (this.currentCreatingElementId) {
          element = this.updateElementObj(this.currentCreatingElementId, obj);
          this.updateElement(element.id, {
            status: ElementStatus.creating,
          })
        } else {
          element = ElementUtils.createElement(obj);
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
    this.refreshElementCaches(this._getRefreshCacheTypes(['status', 'isSelected', 'isRendered']));
    return element;
  }

  /**
   * 完成创建元素
   */
  finishCreatingElement(): IStageElement {
    if (this.currentCreatingElementId) {
      const element = this.getElementById(this.currentCreatingElementId);
      if (element) {
        element.status = ElementStatus.finished;
        this.currentCreatingElementId = null;
        this.refreshElementCaches(this._getRefreshCacheTypes(['status']));
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
      this._refreshStartCreatingElements();
      this._refreshCreatingElements();
      this._refreshRenderedElements();
      this._refreshNoneRenderedElements();
      this._refreshSelectedElements();
      this._refreshHittingElements();
    } else {
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.startCreating)) {
        this._refreshCreatingElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.creating)) {
        this._refreshCreatingElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.rendered)) {
        this._refreshRenderedElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.noneRendered)) {
        this._refreshNoneRenderedElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.selected)) {
        this._refreshSelectedElements();
      }
      if (cacheTypes.includes(StageStoreRefreshCacheTypes.hitting)) {
        this._refreshHittingElements();
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
        result.push(StageStoreRefreshCacheTypes.creating);
        result.push(StageStoreRefreshCacheTypes.startCreating);
      }
      if (element.includes('isSelected')) {
        result.push(StageStoreRefreshCacheTypes.selected);
      }
      if (element.includes('isRendered')) {
        result.push(StageStoreRefreshCacheTypes.rendered);
        result.push(StageStoreRefreshCacheTypes.noneRendered);
      }
      if (element.includes('isHitting')) {
        result.push(StageStoreRefreshCacheTypes.hitting);
      }
    } else {
      if (element.hasOwnProperty('status')) {
        result.push(StageStoreRefreshCacheTypes.creating);
        result.push(StageStoreRefreshCacheTypes.startCreating);
      }
      if (element.hasOwnProperty('isSelected')) {
        result.push(StageStoreRefreshCacheTypes.selected);
      }
      if (element.hasOwnProperty('isRendered')) {
        result.push(StageStoreRefreshCacheTypes.rendered);
        result.push(StageStoreRefreshCacheTypes.noneRendered);
      }
      if (element.hasOwnProperty('isHitting')) {
        result.push(StageStoreRefreshCacheTypes.hitting);
      }
    }
    return result;
  }


}