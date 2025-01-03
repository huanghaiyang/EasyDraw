import { IPoint } from "@/types";
import { DefaultBorderTransformerDistance } from "@/types/Constants";
import { IElementBorderTransformer } from "@/types/IElementTransformer";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";

export default class ElementBorderTransformer implements IElementBorderTransformer {
  id: string;
  start: IPoint;
  end: IPoint;
  isActive: boolean;

  constructor(start: IPoint, end: IPoint) {
    this.id = CommonUtils.getRandomId();
    this.start = start;
    this.end = end;
    this.isActive = false;
  }

  /**
   * 判断点是否在多边形内
   * 
   * @param point 
   * @returns 
   */
  isClosest(point: IPoint): boolean {
    const result = MathUtils.isPointClosestSegment(point, this.start, this.end, DefaultBorderTransformerDistance);
    return result;
  }
}