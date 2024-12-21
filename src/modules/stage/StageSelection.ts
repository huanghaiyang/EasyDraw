import { IPoint, IStageDrawerMaskTaskSelectionObj, IStageElement, IStageSelection, IStageShield, StageDrawerMaskObjTypes } from "@/types";
import MathUtils from "@/utils/MathUtils";

export default class StageSelection implements IStageSelection {
  shield: IStageShield;

  get isEmpty(): boolean {
    return this.shield.store.selectedElements.length === 0 && this.shield.store.hittingElements.length === 0;
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 获取选区对象
   * 
   * @returns 
   */
  getSelectionObjs(): IStageDrawerMaskTaskSelectionObj[] {
    const result: IStageDrawerMaskTaskSelectionObj[] = [];

    this.shield.store.hittingElements.forEach(element => {
      result.push({
        points: element.boxPoints,
        type: StageDrawerMaskObjTypes.highlight
      });
    });

    this.shield.store.selectedElements.forEach(element => {
      result.push({
        points: element.boxPoints,
        type: StageDrawerMaskObjTypes.selection
      });
    });
    return result;
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
    let hitting = false;
    for (let i = this.shield.store.renderedElements.length - 1; i >= 0; i--) {
      element = this.shield.store.renderedElements[i];
      this.shield.store.updateElement(element.id, { isHitting: hitting ? false : MathUtils.isPointInPolygonByRayCasting(point, element.pathPoints) });
      if (element.isHitting) {
        hitting = true;
      }
    }
  }
}