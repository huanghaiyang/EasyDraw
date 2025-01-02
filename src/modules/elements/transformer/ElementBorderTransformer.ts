import { IPoint } from "@/types";
import { IElementBorderTransformer } from "@/types/IElementTransformer";
import CommonUtils from "@/utils/CommonUtils";

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
    return false;
  }
}