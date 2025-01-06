import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import { DefaultLineElementClosestDistance } from "@/types/Constants";
import { IElementLine } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class ElementLine extends Element implements IElementLine {

  get heightModifyEnable(): boolean {
    return false;
  }

  get rotationEnable(): boolean {
    return false;
  }

  get borderTransformEnable(): boolean {
    return false;
  }

  get fillEnabled(): boolean {
    return false;
  }

  get startRotatePathPoint(): IPoint {
    return this.rotatePathPoints[0];
  }

  get endRotatePathPoint(): IPoint {
    return this.rotatePathPoints[1];
  }

  get startCoord(): IPoint {
    return this.model.coords[0];
  }

  get endCoord(): IPoint {
    return this.model.coords[1];
  }

  /**
   * 获取显示角度
   * 
   * @returns 
   */
  protected getAngle(): number {
    return ElementUtils.fixAngle(MathUtils.calculateAngle(this.startCoord, this.endCoord) + 90);
  }

  /**
   * 判断点是否靠近组件
   * 
   * @param point 
   * @returns 
   */
  isContainsPoint(point: IPoint): boolean {
    return MathUtils.isPointClosestSegment(point, this.startRotatePathPoint, this.endRotatePathPoint, DefaultLineElementClosestDistance);
  }

  /**
   * 按顶点变换
   * 
   * @param offset 
   */
  protected doVerticesTransform(offset: IPoint): void {
    const index = this._transformers.findIndex(transformer => transformer.isActive);
    if (index !== -1) {
      const lockPoint = this._originalTransformerPoints[CommonUtils.getNextIndexOfArray(2, index, 1)];
      // 当前拖动的点的原始位置
      const currentPointOriginal = this._originalTransformerPoints[index];
      // 根据不动点进行形变
      this.transformByLockPoint(lockPoint, currentPointOriginal, offset);
    }
  }

  /**
   * 获取设置尺寸变换的变换点
   * 
   * @returns 
   */
  protected getTransformPointForSizeChange(): IPoint {
    return this._originalTransformerPoints[1];
  }

  /**
   * 设置宽度
   * 
   * @param value 
   */
  setWidth(value: number): void {
    const newCoord = MathUtils.calculateTargetPoint(this.startCoord, value, this.angle - 90);
    this.model.coords[1] = newCoord;
    this.model.width = value;
    this.refreshInternalProps();
  }

  /**
   * 设置角度，注意直线的角度始终为0，属性菜单显示的角度是通过开始坐标和结束坐标计算出来的
   * 
   * @param value 
   */
  setAngle(value: number): void {
    const centroid = MathUtils.calcPolygonCentroid(this.model.coords);
    const startCoord = MathUtils.calculateTargetPoint(centroid, this.width / 2, value + 90);
    const endCoord = MathUtils.calculateTargetPoint(centroid, this.width / 2, value - 90);
    this.model.coords = [startCoord, endCoord];
    this.refreshInternalProps();
  }
}