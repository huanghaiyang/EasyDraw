import { IPoint, IStageDrawerMaskTaskSelectionModel, IStageElement, IStageSelection, IStageShield, StageDrawerMaskModelTypes } from "@/types";
import MathUtils from "@/utils/MathUtils";
import { every, includes } from "lodash";

export default class StageSelection implements IStageSelection {
  shield: IStageShield;

  private _rangePoints: IPoint[] = null;

  get isEmpty(): boolean {
    return this.shield.store.selectedElements.length === 0 && this.shield.store.hittingElements.length === 0;
  }

  get isRange(): boolean {
    return this._rangePoints !== null && this._rangePoints.length > 0;
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 设置选区
   * 
   * @param points 
   */
  setRange(points: IPoint[]): void {
    this._rangePoints = points;
    this.refreshRangeElements(this._rangePoints);
  }

  /**
   * 获取选区对象
   * 
   * @returns 
   */
  getSelectionModels(): IStageDrawerMaskTaskSelectionModel[] {
    const result: IStageDrawerMaskTaskSelectionModel[] = [];

    this.shield.store.hittingElements.forEach(element => {
      result.push({
        points: element.boxPoints,
        type: this.isRange ? StageDrawerMaskModelTypes.selection : StageDrawerMaskModelTypes.hitting
      });
    });

    this.shield.store.selectedElements.forEach(element => {
      result.push({
        points: element.boxPoints,
        type: StageDrawerMaskModelTypes.selection
      });
    });

    if (this.isRange) {
      result.push({
        points: this._rangePoints,
        type: StageDrawerMaskModelTypes.hitting
      });
    }
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
      this.shield.store.updateElementById(element.id, { isHitting: hitting ? false : MathUtils.isPointInPolygonByRayCasting(point, element.rotatePathPoints) });
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
  changeHittingElementsToSelect(): void {
    this.shield.store.updateElements(this.shield.store.hittingElements, { isSelected: true, isHitting: false });
  }

  /**
   * 刷新给定区域的元素，将其设置为命中状态
   * 
   * @param rangePoints 
   */
  refreshRangeElements(rangePoints: IPoint[]): void {
    if (rangePoints && rangePoints.length) {
      const result: IStageElement[] = [];
      this.shield.store.renderedElements.forEach(element => {
        if (element.isPolygonOverlap(rangePoints)) {
          result.push(element);
        }
      });
      this.shield.store.updateElements(result, { isHitting: true });
    }
  }

  /**
   * 确定选区组件选中
   */
  selectRange(): void {
    if (this.isRange) {
      this.shield.store.updateElements(this.shield.store.hittingElements, { isSelected: true, isHitting: false });
    }
  }

  /**
   * 给定坐标获取命中的组件
   * 
   * @param point 
   * @returns 
   */
  getElementOnPoint(point: IPoint): IStageElement {
    return this.shield.store.renderedElements.find(item => item.isContainsPoint(point));
  }

  /**
   * 检查当前鼠标命中的组件是否都已经被选中
   * 
   * @returns 
   */
  checkSelectContainsHitting(): boolean {
    const selectedIds = this.shield.store.selectedElements.map(item => item.id);
    const hittingIds = this.shield.store.hittingElements.map(item => item.id);
    return every(hittingIds, item => includes(selectedIds, item))
  }
}