import { IPoint } from "@/types";
import { RenderParams } from "@/types/IRender";
import CommonUtils from "@/utils/CommonUtils";
import PolygonUtils from "@/utils/PolygonUtils";
import MathUtils from "@/utils/MathUtils";

export default class ArbitraryUtils {
  /**
     * 获取自由边形内顶点坐标
     * 
     * @param vertices 
     * @param r 
     * @returns 
     */
  static getArbitraryInnerVertices(vertices: IPoint[], r: number, options: RenderParams): IPoint[] {
    return ArbitraryUtils.getArbitraryVertices(vertices, r, true, options);
  }

  /**
   * 获取自由边形外顶点坐标
   * 
   * @param vertices 
   * @param r 
   * @returns 
   */
  static getArbitraryOuterVertices(vertices: IPoint[], r: number, options: RenderParams): IPoint[] {
    return ArbitraryUtils.getArbitraryVertices(vertices, r, false, options);
  }

  /**
     * 给定一个多边形的顶点坐标集合，已知多边形的边的宽度，计算多边形的内外顶点坐标
     * 
     * @param vertices 
     * @param r 
     * @param innerOrOuter 
     * @returns 
     */
  static getArbitraryVertices(vertices: IPoint[], r: number, innerOrOuter: boolean, options: RenderParams): IPoint[] {
    if (vertices.length === 1) return vertices;
    if (vertices.length === 2) {
      return PolygonUtils.calcBentLineClockWisePoints(vertices, r, innerOrOuter);
    }
    return vertices.map((ver, index) => {
      const prev = CommonUtils.getPrevOfArray(vertices, index);
      const next = CommonUtils.getNextOfArray(vertices, index);
      const isClockwise = MathUtils.isPointClockwise(next, prev, ver);
      let angle = MathUtils.calcTriangleAngle(prev, ver, next);
      if (isClockwise) {
        angle = 180 + angle;
      } else {
        angle = 180 - angle;
      }
      const { isFold = true } = options;
      if (!isFold && [0, vertices.length - 1].includes(index)) {
        let vnAngle;
        if (index === 0) {
          vnAngle = MathUtils.calcAngle(ver, next) + (innerOrOuter ? 90 : -90);
        } else {
          vnAngle = MathUtils.calcAngle(ver, prev) + (innerOrOuter ? -90 : 90);
        }
        return MathUtils.calcTargetPoint(ver, r, vnAngle);
      } else {
        return PolygonUtils.calcIOPoint(ver, next, angle, r, innerOrOuter);
      }
    });
  }
}