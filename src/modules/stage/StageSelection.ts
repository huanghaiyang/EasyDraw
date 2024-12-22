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
    this.shield.store.updateElements(this.shield.store.selectedElements, { isSelected: false });
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
      this.shield.store.updateElement(element.id, { isHitting: hitting ? false : MathUtils.isPointInPolygonByRayCasting(point, element.rotatePathPoints) });
      if (element.isHitting) {
        hitting = true;
      }
    }
  }

  /**
   * 刷新选区
   * 
   * 如果当前鼠标所在的元素是命中状态，则将命中元素设置为选中状态
   */
  refreshSelects(): void {
    this.shield.store.updateElements(this.shield.store.hittingElements, { isSelected: true, isHitting: false });
  }

  /**
   * 刷新给定区域的元素，将其设置为命中状态
   * 
   * @param rangePoints 
   */
  refreshRangeElements(rangePoints: IPoint[]): void {
    const result: IStageElement[] = [];
    this.shield.store.renderedElements.forEach(element => {
      if (element.isPolygonOverlap(rangePoints)) {
        result.push(element);
      }
    });
    this.shield.store.updateElements(result, { isHitting: true });
  }
}