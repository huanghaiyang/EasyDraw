import { Directions, IPoint } from "@/types";
import IElement from "@/types/IElement";
import IElementTransformer from "@/types/IElementTransformer";
import MathUtils from "@/utils/MathUtils";
import BaseTransformer from "@/modules/elements/transformer/BaseTransformer";

export default class ElementTransformer extends BaseTransformer implements IElementTransformer {
  x: number;
  y: number;
  direction?: Directions;
  points: IPoint[];

  get angle(): number {
    const angle =  MathUtils.calcAngle(this.element.centroid, { x: this.x, y: this.y });
    return angle + 90;
  }

  constructor(element: IElement, x: number, y: number, points: IPoint[], direction?: Directions) {
    super(element);
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