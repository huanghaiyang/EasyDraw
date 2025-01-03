import { IPoint, DrawerMaskModelTypes } from "@/types";
import IElement from "@/types/IElement";
import IElementTransformer, { IElementBorderTransformer } from "@/types/IElementTransformer";
import { IMaskSelectionModel } from "@/types/IModel";
import IStageSelection from "@/types/IStageSelection";
import IStageShield from "@/types/IStageShield";
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
  getSelectionModels(): IMaskSelectionModel[] {
    const result: IMaskSelectionModel[] = [];

    if (this.isRange) {
      this.shield.store.rangeElements.forEach(element => {
        result.push({
          points: element.rotatePathPoints,
          type: DrawerMaskModelTypes.selection,
        });
      });
    }

    this.shield.store.targetElements.forEach(element => {
      result.push({
        points: element.rotatePathPoints,
        type: DrawerMaskModelTypes.highlight,
        angle: element.model.angle,
      });
    });

    this.shield.store.selectedElements.forEach(element => {
      result.push({
        points: element.rotatePathPoints,
        type: DrawerMaskModelTypes.selection,
        angle: element.model.angle,
      });
    });

    if (this.isRange) {
      result.push({
        points: this._rangePoints,
        type: DrawerMaskModelTypes.highlight,
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
  hitTargetElements(point: IPoint): void {
    for (let i = this.shield.store.Elements.length - 1; i >= 0; i--) {
      const element = this.shield.store.Elements[i];
      const isTarget = element.isContainsPoint(point);
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
   * 检查当前鼠标是否命中组件的旋转句柄区域
   * 
   * @param point 
   */
  checkTargetRotateElement(point: IPoint): IElement {
    if (this.shield.configure.rotationIconEnable) {
      const element = this.shield.store.uniqSelectedElement;
      if (element && element.isRotationContainsPoint(point)) {
        return element;
      }
    }
  }

  /**
   * 检测鼠标当前位置是否在组件的尺寸变换句柄区域
   * 
   * @param point 
   */
  tryActiveElementTransformer(point: IPoint): IElementTransformer {
    const element = this.shield.store.uniqSelectedElement;
    if (element) {
      const transformer = element.getTransformerByPoint(point);
      if (transformer) {
        element.activeTransformer(transformer);
        return transformer;
      } else {
        element.deActiveAllTransformers();
      }
    }
  }

  /**
   * 检测鼠标是否在组件的边框上，如果是，可以拖动边框改变宽高
   * 
   * @param point 
   * @returns 
   */
  tryActiveElementBorderTransformer(point: IPoint): IElementBorderTransformer {
    const element = this.shield.store.uniqSelectedElement;
    if (element) {
      if (element.borderTransformEnable) {
        const borderTransformer = element.getBorderTransformerByPoint(point);
        if (borderTransformer) {
          element.activeBorderTransformer(borderTransformer);
          return borderTransformer;
        } else {
          element.deActiveAllBorderTransformers();
        }
      }
    }
  }

  /**
   * 获取处于激活状态的变形器
   * 
   * @returns 
   */
  getActiveElementTransformer(): IElementTransformer {
    const element = this.shield.store.uniqSelectedElement;
    if (element) {
      return element.getActiveElementTransformer();
    }
  }

  /**
   * 获取处于激活状态的边框变形器
   * 
   * @returns 
   */
  getActiveElementBorderTransformer(): IElementBorderTransformer {
    const element = this.shield.store.uniqSelectedElement;
    if (element) {
      return element.getActiveElementBorderTransformer();
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
      this.shield.store.Elements.forEach(element => {
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
  getElementOnPoint(point: IPoint): IElement {
    return this.shield.store.Elements.find(item => item.isContainsPoint(point));
  }

  /**
   * 检查当前鼠标命中的组件是否都已经被选中
   * 
   * @returns 
   */
  checkSelectContainsTarget(): boolean {
    const targetIds = this.shield.store.targetElements.map(item => item.id);
    if (targetIds.length === 0) return false;
    const selectedIds = this.shield.store.selectedElements.map(item => item.id);
    return every(targetIds, item => includes(selectedIds, item))
  }
}