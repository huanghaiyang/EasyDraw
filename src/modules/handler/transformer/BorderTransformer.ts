import { IPoint } from "@/types";
import { BorderTransformerMargin } from "@/types/Constants";
import IElement from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import IStageSelection from "@/types/IStageSelection";
import BaseTransformer from "@/modules/handler/transformer/BaseTransformer";
import { IBorderTransformer } from "@/types/ITransformer";

export default class BorderTransformer extends BaseTransformer implements IBorderTransformer {
  // 起始点
  start: IPoint;
  // 结束点
  end: IPoint;
  // 索引
  index: number;

  get angle(): number {
    return MathUtils.calcAngle(this.start, this.end);
  }

  constructor(host: IElement | IStageSelection, start: IPoint, end: IPoint, index: number) {
    super(host);
    this.start = start;
    this.end = end;
    this.index = index;
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