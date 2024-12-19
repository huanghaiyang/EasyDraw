import { CreatorCategories, CreatorTypes, ElementStatus, ElementObject, IPoint, IStageElement, IStageShield, IStageStore } from "@/types";
import { nanoid } from "nanoid";
import StageElement from "@/modules/elements/StageElement";
import StageElementRect from "@/modules/elements/StageElementRect";

export default class StageStore implements IStageStore {

  // 画板上绘制的元素列表（形状、文字、图片等）
  elementList: IStageElement[] = [];
  shield: IStageShield;

  // 当前正在创建的元素
  private currentCreatingElementId;
  private elementMap = new Map();

  get creatingElements() {
    return this.elementList.filter(item => item.status === ElementStatus.creating);
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
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
      return this.elementList.findIndex(item => item.id === id);
    }
    return -1;
  }

  /**
   * 添加元素
   * 
   * @param element 
   */
  addElement(element: IStageElement): IStageElement {
    this.elementList.push(element);
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
      const index = this.getIndexById(id);
      this.elementList.splice(index, 1);
      this.elementMap.delete(id);
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
      element.points = points;
      element.pathPoints = element.calcPathPoints();
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
          element.status = ElementStatus.creating;
        } else {
          element = this.createElement(obj);
          element.status = ElementStatus.creating;
          this.addElement(element);
          this.currentCreatingElementId = element.id;
        }
      }
      default:
        break;
    }
    if (element) {
      this.calcPathPoints(element, canvasRect, worldCenterOffset);
    }
    return element;
  }

  /**
   * 完成创建元素
   */
  finishCreatingElement(): IStageElement {
    if(this.currentCreatingElementId) {
      const element = this.getElementById(this.currentCreatingElementId);
      if (element) {
        element.status = ElementStatus.finished;
        return element;
      }
    }
  }

}