import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import { DefaultLineElementClosestDistance } from "@/types/Constants";
import { IElementLine } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";

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
}