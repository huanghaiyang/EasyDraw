import { CreatorTypes, IPoint, IStageSelection, IStageShield, SelectionRenderTypes } from "@/types";
import { first, flatten } from "lodash";

export default class StageSelection implements IStageSelection {
  shield: IStageShield;

  get selects() {
    return this.shield.store.findElements(element => element.isSelected);
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 获取选区渲染类型
   * 
   * @returns 
   */
  getRenderType(): SelectionRenderTypes {
    if (!this.isEmpty()) {
      const type = first(this.selects).obj.type;
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
    return flatten(this.selects.map(element => {
      return element.edgePoints;
    }));
  }

  /**
   * 判断是否为空
   * 
   * @returns 
   */
  isEmpty(): boolean {
    return this.selects.length === 0;
  }

  /**
   * 清空选区
   */
  clearSelects(): void {
    this.selects.forEach(element => {
      this.shield.store.updateElement(element.id, { isSelected: false, isEditing: false })
    });
  }
}