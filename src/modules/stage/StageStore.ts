import { CreatorCategories, CreatorTypes, ElementObject, IPoint, IStageElement, IStageShield, IStageStore } from "@/types";
import { nanoid } from "nanoid";
import StageElement from "@/modules/elements/StageElement";
import StageElementRect from "@/modules/elements/StageElementRect";

export default class StageStore implements IStageStore {

  // 画板上绘制的元素列表（形状、文字、图片等）
  elementList: IStageElement[] = [];
  shield: IStageShield;

  // 当前正在创建的元素
  private currentCreatingElementId;

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
    return this.elementList.some(item => item.id === id);
  }

  /**
   * 添加元素
   * 
   * @param element 
   */
  addElement(element: IStageElement): IStageElement {
    this.elementList.push(element);
    return element;
  }

  /**
   * 删除元素
   * 
   * @param id 
   */
  removeElement(id: string): IStageElement {
    const index = this.elementList.findIndex(item => item.id === id);
    if (index !== -1) {
      const element = this.elementList[index];
      this.elementList.splice(index, 1);
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
    const index = this.elementList.findIndex(item => item.id === id);
    if (index !== -1) {
      const element = this.elementList[index];
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
  calcStagePoints(element: IStageElement, canvasRect: DOMRect, worldCenterOffset: IPoint) {
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
  createOrUpdateElement(points: IPoint[], canvasRect: DOMRect, worldCenterOffset: IPoint): IStageElement {
    let element: IStageElement;
    const { category, type } = this.shield.currentCreator;
    switch (category) {
      case CreatorCategories.shapes: {
        const obj = this.createObject(type, points)
        if (this.currentCreatingElementId) {
          element = this.updateElementObj(this.currentCreatingElementId, obj);
        } else {
          element = this.createElement(obj);
          this.addElement(element);
          this.currentCreatingElementId = element.id;
        }
      }
      default:
        break;
    }
    this.calcStagePoints(element, canvasRect, worldCenterOffset);
    return element;
  }

}