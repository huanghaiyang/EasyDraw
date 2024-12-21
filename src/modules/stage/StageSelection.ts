import { CreatorTypes, IPoint, IStageElement, IStageSelection, IStageShield, SelectionRenderTypes, StageStoreRefreshCacheTypes } from "@/types";
import MathUtils from "@/utils/MathUtils";
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
  getgetBoxPoints(): IPoint[] {
    return flatten(this.shield.store.selectedElements.map(element => {
      return element.boxPoints;
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
      this.shield.store.updateElement(element.id, { isSelected: false })
    });
  }

  /**
   * 根据坐标获取命中的组件
   * 
   * @param point 
   */
  hitElements(point: IPoint): void {
    let element: IStageElement;
    for (let i = this.shield.store.renderedElements.length - 1; i >= 0; i--) {
      element = this.shield.store.renderedElements[i];
      if (MathUtils.isPointInPolygonByRayCasting(point, element.pathPoints)) {
        this.shield.store.updateElement(element.id, { isHitting: true }, false);
      } else {
        this.shield.store.updateElement(element.id, { isHitting: false }, false);
      }
    }
  }
}