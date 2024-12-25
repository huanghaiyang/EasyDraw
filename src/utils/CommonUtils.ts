import { IPoint, ISize } from "@/types";
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

  /**
   * 获取事件触发时相对于给定盒模型的坐标
   * 
   * @param e 
   * @param rect 
   * @returns 
   */
  static getEventPosition(e: MouseEvent, rect: DOMRect): IPoint {
    return {
      x: e.clientX - rect.x,
      y: e.clientY - rect.y
    }
  }

  /**
   * 给定中心点及所属的和模型，返回盒模型四个顶点
   * 
   * @param point 
   * @param rect 
   * @returns 
   */
  static getBoxVertices(point: IPoint, rect: ISize | DOMRect): IPoint[] {
    return [{
      x: point.x - rect.width / 2,
      y: point.y - rect.height / 2
    }, {
      x: point.x + rect.width / 2,
      y: point.y - rect.height / 2
    }, {
      x: point.x + rect.width / 2,
      y: point.y + rect.height / 2
    }, {
      x: point.x - rect.width / 2,
      y: point.y + rect.height / 2
    }]
  }

  /**
   * 返回rect的四个顶点
   * 
   * @param rect 
   * @returns 
   */
  static getRectVertices(rect: DOMRect): IPoint[] {
    return [{
      x: 0, y: 0
    }, {
      x: rect.width,
      y: 0
    }, {
      x: rect.width,
      y: rect.height
    }, {
      x: 0, y: rect.height
    }]
  }
}