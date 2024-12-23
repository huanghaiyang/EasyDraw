import { IPoint } from "@/types";
import { nanoid } from "nanoid";

export default class CommonUtils {

  /**
   * 给定点计算边界坐标
   * 
   * @param points 
   * @returns 
   */
  static getBoxPoints(points: IPoint[]): IPoint[] {
    let minX = Number.MAX_SAFE_INTEGER,
      minY = Number.MAX_SAFE_INTEGER,
      maxX = Number.MIN_SAFE_INTEGER,
      maxY = Number.MIN_SAFE_INTEGER;

    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    return [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
  }

  /**
   * 获取随机id, 以时间戳加随机字符串组合
   * 
   * @returns 
   */
  static getRandomDateId() {
    return `${+ new Date()}_${nanoid(8)}`
  }
}