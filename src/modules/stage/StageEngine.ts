import { CreatorTypes, ElementObject, IPoint, IStageElement, IStageEngine, IStageShield } from "@/types";

export default class StageEngine implements IStageEngine {

  private shield: IStageShield;

  // 画板上绘制的元素列表（形状、文字、图片等）
  elementList:IStageElement;

  constructor(shield: IStageShield) {
    this.shield = shield;
  }
  addElement(element: IStageElement): void {
    throw new Error("Method not implemented.");
  }
  removeElement(id: string): void {
    throw new Error("Method not implemented.");
  }
  updateElement(id: string, data: ElementObject): void {
    throw new Error("Method not implemented.");
  }
  createObject(type: CreatorTypes, points: IPoint[], data?: any): ElementObject {
    throw new Error("Method not implemented.");
  }
  createElement(obj: ElementObject): IStageElement {
    throw new Error("Method not implemented.");
  }

}