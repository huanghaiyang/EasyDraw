import { CreatorTypes, IPoint, IStageElement, IStageSelection, IStageShield, SelectionRenderTypes } from "@/types";
import CommonUtils from "@/utils/CommonUtils";
import { first, flatten } from "lodash";

export default class StageSelection implements IStageSelection {
  shield: IStageShield;
  private elementList: IStageElement[] = [];

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 设置选区元素
   * 
   * @param elements 
   */
  setElements(elements: IStageElement[]): void {
    this.elementList = elements;
  }

  /**
   * 获取选区渲染类型
   * 
   * @returns 
   */
  getRenderType(): SelectionRenderTypes {
    if (!this.isEmpty()) {
      const type = first(this.elementList).obj.type;
      switch (type) {
        case CreatorTypes.rectangle: {
          return SelectionRenderTypes.rect;
        }
      }
    }
    return SelectionRenderTypes.none;
  }

  /**
   * 获取组件的边缘坐标
   * 
   * @returns IPoint[]
   */
  getEdge(): IPoint[] {
    const points = flatten(this.elementList.map(element => {
      return element.getEdgePoints();
    }));
    return CommonUtils.getBoxByPoints(points);
  }

  /**
   * 判断是否为空
   * 
   * @returns 
   */
  isEmpty(): boolean {
    return this.elementList.length === 0;
  }

}