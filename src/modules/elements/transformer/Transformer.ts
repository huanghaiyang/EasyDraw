import { Directions, IPoint, ITransformer } from "@/types";
import MathUtils from "@/utils/MathUtils";

export default class Transformer implements ITransformer {
  x: number;
  y: number;
  direction?: Directions;
  points: IPoint[];

  constructor(x: number, y: number, points: IPoint[], direction?: Directions) {
    this.x = x;
    this.y = y;
    this.points = points;
    this.direction = direction;
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