import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import { DefaultLineElementClosestDistance } from "@/types/Constants";
import { IElementLine } from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";

export default class ElementLine extends Element implements IElementLine {

  get rotationEnable(): boolean {
    return false;
  }

  get verticesTransformEnable(): boolean {
    return false;
  }

  get borderTransformEnable(): boolean {
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
}