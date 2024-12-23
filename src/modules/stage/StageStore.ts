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
import LinkedNode from "@/modules/struct/LinkedNode";
import ElementUtils, { ElementReactionPropNames, ElementsSizeChangedName } from "@/modules/elements/ElementUtils";
import { cloneDeep } from "lodash";
import ElementList from "@/modules/elements/ElementList";
import SortedMap from "../struct/SortedMap";
import CommonUtils from "@/utils/CommonUtils";

export default class StageStore implements IStageStore {
  shield: IStageShield;

  // 画板上绘制的元素列表（形状、文字、图片等）
  private _elementList: ElementList;
  // 当前正在创建的元素
  private _currentCreatingElementId;
  // 元素对象映射关系，加快查询
  private _elementMap = new SortedMap<string, IStageElement>();
  // 已渲染的组件映射关系
  private _renderedElementsMap = new SortedMap<string, IStageElement>();
  // 未渲染的组件映射关系
  private _noneRenderedElementsMap = new SortedMap<string, IStageElement>();
  // 被选中的组件映射关系，加快查询
  private _selectedElementsMap = new SortedMap<string, IStageElement>();
  // 命中的组件映射关系，加快查询
  private _hittingElementsMap = new SortedMap<string, IStageElement>();
  // 舞台元素映射关系，加快查询
  private _stageElementsMap = new SortedMap<string, IStageElement>();
  // 未在舞台的元素映射关系，加快查询
  private _noneStageElementsMap = new SortedMap<string, IStageElement>();

  constructor(shield: IStageShield) {
    this.shield = shield;
    this._elementList = new ElementList();
    this._reactionElementsSizeChanged();
    this._reactionElementsPropsChanged();
  }

  // 当前创建并更新中的组件
  get creatingElements(): IStageElement[] {
    const element = this._elementMap.get(this._currentCreatingElementId);
    if (element) {
      return [element];
    }
    return [];
  }

  // 已经渲染到舞台的组件
  get renderedElements(): IStageElement[] {
    return this._renderedElementsMap.valuesArray();
  }

  // 没有渲染到舞台的组件
  get noneRenderedElements(): IStageElement[] {
    return this._noneRenderedElementsMap.valuesArray();
  }

  get selectedElements(): IStageElement[] {
    return this._selectedElementsMap.valuesArray();
  }

  get hittingElements(): IStageElement[] {
    return this._hittingElementsMap.valuesArray();
  }

  get stageElements(): IStageElement[] {
    return this._stageElementsMap.valuesArray();
  }

  get noneStageElements(): IStageElement[] {
    return this._noneStageElementsMap.valuesArray();
  }

  /**
   * 元素数量变化时，更新元素映射关系
   */
  private _reactionElementsSizeChanged(): void {
    this._elementList.on(ElementsSizeChangedName, () => {
      this._elementList.forEach(node => {
        const element = node.value;
        this._reactionElementPropsChanged(ElementReactionPropNames.isSelected, element, element.isSelected);
        this._reactionElementPropsChanged(ElementReactionPropNames.isOnStage, element, element.isOnStage);
        this._reactionElementPropsChanged(ElementReactionPropNames.isRendered, element, element.isRendered);
        this._reactionElementPropsChanged(ElementReactionPropNames.isHitting, element, element.isHitting);
        this._reactionElementPropsChanged(ElementReactionPropNames.status, element, element.status);
      })
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
  private _reactionElementPropsChanged(propName: string, element: IStageElement, value: boolean | ElementStatus): void {
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
      case ElementReactionPropNames.isRendered: {
        if (value) {
          this._renderedElementsMap.set(element.id, element);
          this._noneRenderedElementsMap.delete(element.id);
        } else {
          this._renderedElementsMap.delete(element.id);
          this._noneRenderedElementsMap.set(element.id, element);
        }
      }
      case ElementReactionPropNames.isHitting: {
        if (value) {
          this._hittingElementsMap.set(element.id, element);
        } else {
          this._hittingElementsMap.delete(element.id);
        }
      }
      case ElementReactionPropNames.status: {
        if (this._currentCreatingElementId && value === ElementStatus.creating) {
          this._selectedElementsMap.set(element.id, element);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * 判断元素是否存在
   * 
   * @param id 
   * @returns 
   */
  hasElement(id: string): boolean {
    return this._elementMap.has(id);
  }

  /**
   * 通过id获取元素
   * 
   * @param id 
   * @returns 
   */
  getElementById(id: string): IStageElement {
    return this._elementMap.get(id);
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
  addElement(element: IStageElement): IStageElement {
    this._elementList.insert(new LinkedNode(element))
    this._elementMap.set(element.id, element);
    return element;
  }

  /**
   * 删除元素
   * 
   * @param id 
   */
  removeElement(id: string): IStageElement {
    if (this.hasElement(id)) {
      const element = this._elementMap.get(id);
      this._elementList.removeBy(node => node.value.id === id);
      this._elementMap.delete(id);
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
  updateElementById(id: string, props: Partial<IStageElement>): IStageElement {
    if (this.hasElement(id)) {
      const element = this._elementMap.get(id);
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
  updateElementModel(id: string, data: Partial<ElementObject>): IStageElement {
    if (this.hasElement(id)) {
      const element = this._elementMap.get(id);
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
      id: CommonUtils.getRandomDateId(),
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
        if (this._currentCreatingElementId) {
          element = this.updateElementModel(this._currentCreatingElementId, model);
          this.updateElementById(element.id, {
            status: ElementStatus.creating,
          })
        } else {
          element = ElementUtils.createElement(model);
          this.updateElementById(element.id, {
            isRendered: false,
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
      this.updateElementById(element.id, {
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
    if (this._currentCreatingElementId) {
      const element = this.getElementById(this._currentCreatingElementId);
      if (element) {
        this._currentCreatingElementId = null;
        this.updateElementById(element.id, {
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
    this._elementList.forEach(node => {
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
    this._elementList.forEach(node => {
      node.value.refreshStagePoints(this.shield.stageRect, this.shield.stageWorldCoord);
    })
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
    this._elementList.forEach((node, index) => {
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