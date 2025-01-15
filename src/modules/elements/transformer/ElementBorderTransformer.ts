import { IPoint } from "@/types";
import { BorderTransformerMargin } from "@/types/Constants";
import IElement from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import BaseTransformer from "@/modules/elements/transformer/BaseTransformer";
import { IElementBorderTransformer } from "@/types/IElementTransformer";

export default class ElementBorderTransformer extends BaseTransformer implements IElementBorderTransformer {
  start: IPoint;
  end: IPoint;

  get angle(): number {
    const result = MathUtils.calcAngleBetweenPointAndSegment(this.element.center, this.start, this.end);
    return result + 90;
  }

  constructor(element: IElement, start: IPoint, end: IPoint) {
    super(element);
    this.start = start;
    this.end = end;
  }

  /**
   * 判断点是否在多边形内
   * 
   * @param point 
   * @returns 
   */
  isClosest(point: IPoint): boolean {
    const result = MathUtils.isPointClosestSegment(point, this.start, this.end, BorderTransformerMargin / this.element.shield.stageScale);
    return result;
  }
}