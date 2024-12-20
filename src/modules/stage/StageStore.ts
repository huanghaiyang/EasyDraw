import { CreatorCategories, CreatorTypes, ElementStatus, ElementObject, IPoint, IStageElement, IStageShield, IStageStore } from "@/types";
import { nanoid } from "nanoid";
import StageElement from "@/modules/elements/StageElement";
import StageElementRect from "@/modules/elements/StageElementRect";
import LinkedList, { ILinkedList } from "@/modules/struct/LinkedList";
import LinkedNode, { ILinkedNode } from "@/modules/struct/LinkedNode";

export default class StageStore implements IStageStore {
  shield: IStageShield;

  // 画板上绘制的元素列表（形状、文字、图片等）
  private elementList: ILinkedList<ILinkedNode<IStageElement>>;
  // 当前正在创建的元素
  private currentCreatingElementId;
  // 元素对象映射关系，加快查询
  private elementMap = new Map<string, IStageElement>();

  // 当前创建中的组件
  get creatingElements(): IStageElement[] {
    const result = [];
    this.elementList.forEach(item => {
      if (item.data.status === ElementStatus.creating) {
        result.push(item.data);
      }
    });
    return result;
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.elementList = new LinkedList<IStageElement>();
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
      return element;
    }
  }

  /**
   * 更新元素属性
   * 
   * @param id 
   * @param data 
   * @returns 
   */
  updateElement(id: string, data: Partial<IStageElement>): IStageElement {
    if (this.hasElement(id)) {
      const element = this.elementMap.get(id);
      Object.assign(element, data);
      return element;
    }
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
  createObject(type: CreatorTypes, points: IPoint[], data?: any): ElementObject {
    const obj = {
      id: nanoid(),
      type,
      points,
      data
    }
    return obj;
  }

  /**
   * 创建组件元素
   * 
   * @param obj 
   * @returns 
   */
  createElement(obj: ElementObject): IStageElement {
    const { type } = obj;
    switch (type) {
      case CreatorTypes.rectangle: {
        return new StageElementRect(obj);
      }
      default:
        return new StageElement(obj);
    }
  }

  /**
   * 将世界坐标转换为画板相对坐标
   * 
   * @param element 
   * @param canvasRect 
   * @param worldCenterOffset 
   */
  private calcPathPoints(element: IStageElement, canvasRect: DOMRect, worldCenterOffset: IPoint) {
    if (element) {
      // 计算element坐标相对于画布的坐标
      const points = element.obj.points.map(p => {
        return {
          x: p.x + canvasRect.width / 2 - worldCenterOffset.x,
          y: p.y + canvasRect.height / 2 - worldCenterOffset.y
        }
      })
      this.updateElement(element.id, { points })
      this.updateElement(element.id, { pathPoints: element.calcPathPoints() });
    }
  }

  /**
   * 在当前鼠标位置创建临时元素
   * 
   * @param points
   * @param canvasRect
   * @param worldOffset
   */
  creatingElement(points: IPoint[], canvasRect: DOMRect, worldCenterOffset: IPoint): IStageElement {
    let element: IStageElement;
    const { category, type } = this.shield.currentCreator;
    switch (category) {
      case CreatorCategories.shapes: {
        const obj = this.createObject(type, points)
        if (this.currentCreatingElementId) {
          element = this.updateElementObj(this.currentCreatingElementId, obj);
          this.updateElement(element.id, {
            status: ElementStatus.creating,
          })
        } else {
          element = this.createElement(obj);
          this.updateElement(element.id, {
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
      element.isSelected = true;
      this.calcPathPoints(element, canvasRect, worldCenterOffset);
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
        element.status = ElementStatus.finished;
        element.isEditing = true;
        this.currentCreatingElementId = null;
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

}