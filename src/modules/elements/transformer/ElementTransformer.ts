import { Directions, IPoint } from "@/types";
import IElementTransformer from "@/types/IElementTransformer";
import MathUtils from "@/utils/MathUtils";

export default class ElementTransformer implements IElementTransformer {
  x: number;
  y: number;
  direction?: Directions;
  points: IPoint[];
  isActive: boolean;

  constructor(x: number, y: number, points: IPoint[], direction?: Directions) {
    this.x = x;
    this.y = y;
    this.points = points;
    this.direction = direction;
    this.isActive = false;
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