import { IPoint } from "@/types";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { evaluate } from "mathjs";

export default class PolygonUtils {
  /**
   * 计算内外顶点坐标
   *
   * @param current
   * @param next
   * @param angle
   * @param r
   * @param innerOrOuter
   * @returns
   */
  static calcIOPoint(
    current: IPoint,
    next: IPoint,
    angle: number,
    r: number,
    innerOrOuter: boolean,
  ): IPoint {
    if (MathUtils.preciseToFixed(angle) === MathUtils.preciseToFixed(360)) {
      angle = 180;
    }
    if (MathUtils.preciseToFixed(angle) === MathUtils.preciseToFixed(0)) {
      angle = 180;
    }
    // 半角度
    const halfAngle = evaluate("angle / 2", { angle });
    // 三角形斜边
    const hypotenuse = MathUtils.calcTriangleSide3By2(halfAngle, r);
    // 下一个角度
    let nextAngle = MathUtils.calcAngle(current, next);
    // 角度范围[0, 360]
    if (nextAngle < 0) {
      nextAngle += 360;
    }
    // 最终角度
    let finalAngle = evaluate("halfAngle + nextAngle", {
      halfAngle,
      nextAngle,
    });
    // 计算目标点
    const point = MathUtils.calcTargetPoint(
      current,
      hypotenuse,
      innerOrOuter ? finalAngle : evaluate("finalAngle + 180", { finalAngle }),
    );
    return point;
  }

  /**
   * 给定一个多边形的顶点坐标集合，已知多边形的边的宽度，计算多边形的内外顶点坐标
   *
   * @param vertices
   * @param r
   * @param innerOrOuter
   * @returns
   */
  static getPolygonVertices(
    vertices: IPoint[],
    r: number,
    innerOrOuter: boolean,
  ): IPoint[] {
    // 排序顶点
    const sortedVertices = MathUtils.sortVerticesClockwise(vertices);
    // 计算内外顶点
    return sortedVertices.map((ver, index) => {
      // 上一个顶点
      const prev = CommonUtils.getPrevOfArray(sortedVertices, index);
      // 下一个顶点
      const next = CommonUtils.getNextOfArray(sortedVertices, index);
      // 三角形角度
      const angle = MathUtils.calcTriangleAngle(prev, ver, next);
      // 计算内外顶点
      return PolygonUtils.calcIOPoint(ver, next, angle, r, innerOrOuter);
    });
  }

  /**
   * 获取对边形内顶点坐标
   *
   * @param points 多边形的顶点坐标集合
   * @param width 多边形的宽度
   */
  static getPolygonInnerVertices(vertices: IPoint[], r: number): IPoint[] {
    return PolygonUtils.getPolygonVertices(vertices, r, true);
  }

  /**
   * 获取对边形外顶点坐标
   *
   * @param vertices
   * @param width
   * @returns
   */
  static getPolygonOuterVertices(vertices: IPoint[], r: number): IPoint[] {
    return PolygonUtils.getPolygonVertices(vertices, r, false);
  }

  /**
   * 计算连续的线段的外顶点坐标
   *
   * @param points
   * @param r
   */
  static calcBentLineOuterVertices(points: IPoint[], r: number): IPoint[] {
    const result: IPoint[] = [];
    result.push(...PolygonUtils.calcBentLineClockWisePoints(points, r, true));
    result.push(
      ...PolygonUtils.calcBentLineClockWisePoints(points.reverse(), r, true),
    );
    return result;
  }

  /**
   * 计算线段的平行线
   *
   * @param points
   * @param r
   * @param isClockWise
   * @returns
   */
  static calcBentLineClockWisePoints(
    points: IPoint[],
    r: number,
    isClockWise: boolean,
  ): IPoint[] {
    // 结果
    const result: IPoint[] = [];
    // 遍历坐标
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      let angle = MathUtils.calcAngle(p1, p2);
      if (isClockWise) {
        angle = angle + 90;
      } else {
        angle = angle - 90;
      }
      result.push(MathUtils.calcTargetPoint(p1, r, angle));
      if (i === points.length - 2) {
        result.push(MathUtils.calcTargetPoint(p2, r, angle));
      }
    }
    return result;
  }
}
