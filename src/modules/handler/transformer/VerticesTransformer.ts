import { IPoint } from "@/types";
import IElement from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import { IVerticesTransformer } from "@/types/ITransformer";
import BaseTransformer from "@/modules/handler/transformer/BaseTransformer";
import IStageSelection from "@/types/IStageSelection";

export default class VerticesTransformer extends BaseTransformer implements IVerticesTransformer {
  x: number;
  y: number;
  points: IPoint[];

  get angle(): number {
    const angle = MathUtils.calcAngle(this.host.center, { x: this.x, y: this.y });
    return angle + 90;
  }

  constructor(host: IElement | IStageSelection, x: number, y: number, points: IPoint[]) {
    super(host);
    this.x = x;
    this.y = y;
    this.points = points;
  }

  /**
   * 判断点是否在多边形内
   *
   * @param point
   * @returns
   */
  isContainsPoint(point: IPoint): boolean {
    return MathUtils.isPointInPolygonByRayCasting(point, this.points);
  }
}
