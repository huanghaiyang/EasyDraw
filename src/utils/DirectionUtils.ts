import { IDirectionPoint, IPoint, ISize, Directions } from "@/types";

export default class DirectionUtils {
  static get4DirectionPoints(center: IPoint, size: ISize): IDirectionPoint[] {
    return [
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
  }
}