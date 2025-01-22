import { IPoint } from "@/types";
import { BorderTransformerMargin } from "@/types/Constants";
import IElement from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import IStageSelection from "@/types/IStageSelection";
import BaseTransformer from "@/modules/handler/transformer/BaseTransformer";
import { IBorderTransformer } from "@/types/ITransformer";

export default class BorderTransformer extends BaseTransformer implements IBorderTransformer {
  start: IPoint;
  end: IPoint;

  get angle(): number {
    const result = MathUtils.calcAngleBetweenPointAndSegment(this.host.center, this.start, this.end);
    return result + 90;
  }

  constructor(host: IElement | IStageSelection, start: IPoint, end: IPoint) {
    super(host);
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
    return MathUtils.isPointClosestSegment(point, this.start, this.end, BorderTransformerMargin / this.host.shield.stageScale);
  }
}