import { IPoint } from "@/types";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";

export default class PolygonUtils {

  /**
   * 给定一个多边形的顶点坐标集合，已知多边形的边的宽度，计算多边形的内外顶点坐标
   * 
   * @param vertices 
   * @param r 
   * @param innerOrOuter 
   * @returns 
   */
  static getPolygonVertices(vertices: IPoint[], r: number, innerOrOuter: boolean): IPoint[] {
    return vertices.map((ver, index) => {
      const prev = CommonUtils.getPrevOfArray(vertices, index);
      const next = CommonUtils.getNextOfArray(vertices, index);
      const angle = MathUtils.calculateTriangleAngle(prev, ver, next);
      const hypotenuse = MathUtils.calculateTriangleHypotenuse(angle / 2, r);
      let nextAngle = MathUtils.calculateAngle(ver, next);
      if (nextAngle < 0) {
        nextAngle += 360;
      }
      let finalAngle = nextAngle + angle / 2;
      const point = MathUtils.calculateTargetPoint(ver, hypotenuse, innerOrOuter ? finalAngle : finalAngle + 180);
      return point;
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
}