import { CreatorTypes, IPoint, IStageSelection, IStageShield, SelectionRenderTypes } from "@/types";
import { first, flatten } from "lodash";

export default class StageSelection implements IStageSelection {
  shield: IStageShield;

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
      const type = first(this.shield.store.selectedElements).obj.type;
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
    return flatten(this.shield.store.selectedElements.map(element => {
      return element.edgePoints;
    }));
  }

  /**
   * 判断是否为空
   * 
   * @returns 
   */
  isEmpty(): boolean {
    return this.shield.store.selectedElements.length === 0;
  }

  /**
   * 清空选区
   */
  clearSelects(): void {
    this.shield.store.selectedElements.forEach(element => {
      this.shield.store.updateElement(element.id, { isSelected: false, isEditing: false })
    });
  }
}