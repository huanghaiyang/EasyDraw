import {
  CreatorCategories,
  CreatorTypes,
  ElementStatus,
  ElementObject,
  IPoint,
  IStageElement,
  IStageShield,
  IStageStore,
} from "@/types";
import { nanoid } from "nanoid";
import LinkedNode from "@/modules/struct/LinkedNode";
import ElementUtils, { ElementReactionPropNames, ElementsSizeChangedName } from "@/modules/elements/ElementUtils";
import { cloneDeep } from "lodash";
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
    this.elementList.on(ElementsSizeChangedName, () => {
      this.refreshElementCaches();
    })
    Object.keys(ElementReactionPropNames).forEach(propName => {
      this.elementList.on(propName, (element, value) => {
        switch (propName) {
          case ElementReactionPropNames.isSelected:
            this._refreshElementsCaches([ElementReactionPropNames.isSelected]);
            break;
          case ElementReactionPropNames.isOnStage:
            this._refreshElementsCaches([ElementReactionPropNames.isOnStage]);
            break;
          case ElementReactionPropNames.isRendered:
            this._refreshElementsCaches([ElementReactionPropNames.isRendered]);
            break;
          case ElementReactionPropNames.isHitting:
            this._refreshElementsCaches([ElementReactionPropNames.isHitting]);
            break;
          case ElementReactionPropNames.status:
            this._refreshElementsCaches([ElementReactionPropNames.status]);
            break;
          default:
            break;
        }
      })
    })
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

  private _refreshStatusElements(element: IStageElement): void {
    if (element.status === ElementStatus.creating) {
      this._creatingElements.push(element);
    }
  }

  private _refreshRenderedElements(element: IStageElement): void {
    if (element.isRendered) {
      this._renderedElements.push(element);
    } else {
      this._noneRenderedElements.push(element);
    }
  }

  private _refreshSelectedElements(element: IStageElement): void {
    if (element.isSelected) {
      this._selectedElements.push(element);
    }
    if (this._selectedElements.length === 0) {
      if (this.currentCreatingElementId) {
        this._selectedElements.push(this.getElementById(this.currentCreatingElementId));
      }
    }
  }

  private _refreshHittingElements(element: IStageElement): void {
    if (element.isHitting) {
      this._hittingElements.push(element);
    }
  }

  private _refreshStageElements(element: IStageElement): void {
    if (element.isOnStage) {
      this._stageElements.push(element);
    } else {
      this._noneStageElements.push(element);
    }
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
  addElement(element: IStageElement): IStageElement {
    this.elementList.insert(new LinkedNode(element))
    this.elementMap.set(element.id, element);
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
      this.elementList.removeBy(node => node.value.id === id);
      this.elementMap.delete(id);
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
      if (predicate(node.value)) {
        result.push(node.value);
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
      node.value.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord);
    })
  }

  private _refreshElementsCaches(props: ElementReactionPropNames[]): void {
    if (props.includes(ElementReactionPropNames.isOnStage)) {
      this._stageElements = [];
      this._noneStageElements = [];
    }
    if (props.includes(ElementReactionPropNames.isRendered)) {
      this._renderedElements = [];
      this._noneRenderedElements = [];
    }
    if (props.includes(ElementReactionPropNames.isSelected)) {
      this._selectedElements = [];
    }
    if (props.includes(ElementReactionPropNames.isHitting)) {
      this._hittingElements = [];
    }
    if (props.includes(ElementReactionPropNames.status)) {
      this._creatingElements = [];
    }

    this.elementList.forEach(node => {
      const element = node.value;
      if (props.includes(ElementReactionPropNames.isOnStage)) {
        this._refreshStageElements(element)
      }
      if (props.includes(ElementReactionPropNames.status)) {
        this._refreshStatusElements(element);
      }
      if (props.includes(ElementReactionPropNames.isRendered)) {
        this._refreshRenderedElements(element);
      }
      if (props.includes(ElementReactionPropNames.isHitting)) {
        this._refreshHittingElements(element);
      }
      if (props.includes(ElementReactionPropNames.isSelected)) {
        this._refreshSelectedElements(element);
      }
    })
  }

  /**
   * 刷新元素列表
   */
  refreshElementCaches(): void {
    this._refreshElementsCaches([
      ElementReactionPropNames.status,
      ElementReactionPropNames.isOnStage,
      ElementReactionPropNames.isRendered,
      ElementReactionPropNames.isSelected,
      ElementReactionPropNames.isHitting,
    ])
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
      callback(node.value, index);
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