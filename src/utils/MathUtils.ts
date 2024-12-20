import { multiply } from "mathjs";
import { IPoint, ScaleValue, TranslationValue } from "@/types";

export default class MathUtils {
  /**
   * 平移
   * 
   * @param coord 
   * @param value 
   * @returns 
   */
  static translate(coord: IPoint, value: TranslationValue): IPoint {
    const point = [coord.x, coord.y];
    const translationMatrix = [[1, 0, value.dx], [0, 1, value.dy], [0, 0, 1]];
    const translatedPoint = multiply(translationMatrix, [point[0], point[1], 1]);
    return {
      x: translatedPoint[0],
      y: translatedPoint[1]
    }
  }

  /**
   * 旋转
   * 
   * @param coord 
   * @param thetaDegrees 
   * @returns 
   */
  static rotate(coord: IPoint, thetaDegrees: number): IPoint {
    const point = [coord.x, coord.y];
    const theta = MathUtils.degreesToRadians(thetaDegrees); // 将角度转换为弧度
    const rotationMatrix = [
      [Math.cos(theta), -Math.sin(theta), 0],
      [Math.sin(theta), Math.cos(theta), 0],
      [0, 0, 1]
    ];
    const rotatedPoint = multiply(rotationMatrix, [point[0], point[1], 1]);
    return {
      x: rotatedPoint[0],
      y: rotatedPoint[1]
    };
  }

  /**
   * 旋转并平移
   * 
   * @param coord 
   * @param thetaDegrees 
   * @param value 
   * @returns 
   */
  static rotateAndTranslate(coord: IPoint, thetaDegrees: number, value: TranslationValue): IPoint {
    return MathUtils.translate(MathUtils.rotate(coord, thetaDegrees), value);
  }

  /**
   * 缩放
   * 
   * @param coord 
   * @param value 
   * @returns 
   */
  static scale(coord: IPoint, value: ScaleValue): IPoint {
    const point = [coord.x, coord.y];
    const scaleMatrix = [[value.sx, 0, 0], [0, value.sy, 0], [0, 0, 1]];
    const scaledPoint = multiply(scaleMatrix, [point[0], point[1], 1]);
    return {
      x: scaledPoint[0],
      y: scaledPoint[1]
    };
  }

  /**
   * 角度转弧度
   * 
   * @param degrees 
   * @returns 
   */
  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 弧度转角度
   * 
   * @param radians 
   * @returns 
   */
  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * 使用面积和法线判断点是否在多边形内
   * 
   * @param coord 
   * @param polygonCoords 
   * @returns 
   */
  static isPointInPolygon(coord: IPoint, polygonCoords: IPoint[]): boolean {
    const point = [coord.x, coord.y];
    const polygon = polygonCoords.map(p => [p.x, p.y]);
    const [px, py] = point;
    let totalArea = 0;
    const n = polygon.length;

    for (let i = 0; i < n; i++) {
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[(i + 1) % n];

      // 计算三角形面积
      const area = (x1 * y2 - x2 * y1) / 2;
      totalArea += area;
    }

    // 计算点与多边形顶点连线形成的三角形面积之和
    let testArea = 0;
    for (let i = 0; i < n; i++) {
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[(i + 1) % n];

      // 计算三角形面积
      const area = Math.abs((x1 * (y2 - py) + x2 * (py - y1) + px * (y1 - y2)) / 2);
      testArea += area;
    }

    // 如果两个面积相等，则点在多边形内部
    return Math.abs(totalArea - testArea) < Number.EPSILON;
  }
}
