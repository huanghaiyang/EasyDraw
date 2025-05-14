import { IPoint } from "@/types";
import { BorderTransformerMargin } from "@/types/constants";
import IElement from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import { ISegmentController } from "@/types/IController";
import BaseController from "@/modules/handler/controller/BaseController";
import { isNumber } from "lodash";
import GlobalConfig from "@/config";

export default class SegmentController extends BaseController implements ISegmentController {
  // 起始点
  start: IPoint;
  // 结束点
  end: IPoint;
  // 索引
  index: number;

  get angle(): number {
    return MathUtils.calcAngle(this.start, this.end);
  }

  constructor(
    host: IElement,
    options?: {
      start: IPoint;
      end: IPoint;
      index: number;
    },
  ) {
    super(host);
    const { start, end, index } = options || {};
    if (start) this.start = start;
    if (end) this.end = end;
    if (isNumber(index)) this.index = index;
  }

  /**
   * 判断点是否在多边形内
   *
   * @param coord
   * @returns
   */
  isClosest(coord: IPoint): boolean {
    return MathUtils.isPointClosestSegment(coord, this.start, this.end, BorderTransformerMargin / GlobalConfig.stageParams.scale);
  }

  /**
   * 是否命中点
   * @param coord 点坐标
   */
  isCoordHitting(coord: IPoint): boolean {
    return this.isClosest(coord);
  }
}
