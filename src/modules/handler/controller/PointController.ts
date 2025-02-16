import { IPoint } from "@/types";
import IElement from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import { IPointController } from "@/types/IController";
import BaseController from "@/modules/handler/controller/BaseController";

export default class PointController
  extends BaseController
  implements IPointController
{
  width: number;
  height: number;
  x: number;
  y: number;
  points: IPoint[];

  constructor(
    host: IElement,
    options?: {
      x: number;
      y: number;
      points: IPoint[];
      width?: number;
      height?: number;
    },
  ) {
    super(host);
    const { points = [], x = 0, y = 0, width = 0, height = 0 } = options || {};
    this.points = points;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  isContainsPoint(point: IPoint): boolean {
    return MathUtils.isPointInPolygonByRayCasting(point, this.points);
  }
}
