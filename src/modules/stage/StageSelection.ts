import { IPoint, IStageDrawerMaskTaskSelectionModel, IStageElement, IStageSelection, IStageShield, StageDrawerMaskModelTypes } from "@/types";
import MathUtils from "@/utils/MathUtils";
import { every, includes } from "lodash";

export default class StageSelection implements IStageSelection {
  shield: IStageShield;

  private _rangePoints: IPoint[] = null;

  get isEmpty(): boolean {
    return this.shield.store.selectedElements.length === 0
      && this.shield.store.targetElements.length === 0
      && this.shield.store.rangeElements.length === 0;
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

    if (this.isRange) {
      this.shield.store.rangeElements.forEach(element => {
        result.push({
          points: element.boxPoints,
          type: StageDrawerMaskModelTypes.selection
        });
      });
    }

    this.shield.store.targetElements.forEach(element => {
      result.push({
        points: element.boxPoints,
        type: StageDrawerMaskModelTypes.highlight
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
        type: StageDrawerMaskModelTypes.highlight
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
  checkTargetElements(point: IPoint): void {
    for (let i = this.shield.store.stageElements.length - 1; i >= 0; i--) {
      const element = this.shield.store.stageElements[i];
      const isTarget = MathUtils.isPointInPolygonByRayCasting(point, element.rotatePathPoints);
      this.shield.store.updateElementById(element.id, { isTarget });
      if (isTarget) {
        this.shield.store.targetElements.forEach(target => {
          if (target.id !== element.id) {
            this.shield.store.updateElementById(target.id, { isTarget: false });
          }
        });
        break;
      }
    }
  }

  /**
   * 刷新选区
   * 
   * 如果当前鼠标所在的元素是命中状态，则将命中元素设置为选中状态
   */
  selectTarget(): void {
    this.shield.store.updateElements(this.shield.store.targetElements, { isSelected: true, isTarget: false });
  }

  /**
   * 刷新给定区域的元素，将其设置为命中状态
   * 
   * @param rangePoints 
   */
  refreshRangeElements(rangePoints: IPoint[]): void {
    if (rangePoints && rangePoints.length) {
      this.shield.store.stageElements.forEach(element => {
        this.shield.store.updateElementById(element.id, { isInRange: element.isPolygonOverlap(rangePoints) })
      });
    }
  }

  /**
   * 确定选区组件选中
   */
  selectRange(): void {
    if (this.isRange) {
      this.shield.store.updateElements(this.shield.store.rangeElements, { isSelected: true, isInRange: false });
    }
  }

  /**
   * 给定坐标获取命中的组件
   * 
   * @param point 
   * @returns 
   */
  getElementOnPoint(point: IPoint): IStageElement {
    return this.shield.store.stageElements.find(item => item.isContainsPoint(point));
  }

  /**
   * 检查当前鼠标命中的组件是否都已经被选中
   * 
   * @returns 
   */
  checkSelectContainsTarget(): boolean {
    const selectedIds = this.shield.store.selectedElements.map(item => item.id);
    const targetIds = this.shield.store.targetElements.map(item => item.id);
    return every(targetIds, item => includes(selectedIds, item))
  }
}