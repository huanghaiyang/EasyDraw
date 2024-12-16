import { CreatorTypes, ElementObject, IPoint, IStageElement, IStagePersister, IStageShield } from "@/types";
import { nanoid } from "nanoid";
import StageElement from "@/modules/elements/StageElement";

export default class StagePersister implements IStagePersister {

  // 画板上绘制的元素列表（形状、文字、图片等）
  elementList: IStageElement[];

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
  addElement(element: IStageElement): void {
    this.elementList.push(element);
  }

  /**
   * 删除元素
   * 
   * @param id 
   */
  removeElement(id: string): void {
    const index = this.elementList.findIndex(item => item.id === id);
    if (index !== -1) {
      this.elementList.splice(index, 1);
    }
  }

  /**
   * 更新元素数据
   * 
   * @param id 
   * @param data 
   */
  updateElementObj(id: string, data: ElementObject): void {
    const index = this.elementList.findIndex(item => item.id === id);
    if (index !== -1) {
      const element = this.elementList[index];
      const objId = element.obj.id;
      Object.assign(element.obj, data, { id: objId });
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
    const element = new StageElement(obj);
    return element;
  }

}