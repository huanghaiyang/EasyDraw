import { Directions, IDirectionPoint, IPoint, ISize } from "@/types";
import MathUtils from "@/utils/MathUtils";

export default class DirectionUtils {
  static get4DirectionPoints(center: IPoint, size: ISize, { angle: number } = { angle: 0 }): IDirectionPoint[] {
    const points = [
      {
        x: center.x - size.width / 2,
        y: center.y - size.height / 2,
        direction: Directions.topLeft,
      },
      {
        x: center.x + size.width / 2,
        y: center.y - size.height / 2,
        direction: Directions.topRight,
      },
      {
        x: center.x + size.width / 2,
        y: center.y + size.height / 2,
        direction: Directions.bottomRight,
      },
      {
        x: center.x - size.width / 2,
        y: center.y + size.height / 2,
        direction: Directions.bottomLeft,
      },
    ];
    points.forEach((point) => {
      Object.assign(point, MathUtils.rotateRelativeCentroid(point, number, center));
    });
    return points;
  }
}