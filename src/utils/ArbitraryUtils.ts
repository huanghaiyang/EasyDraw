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
    // 顶点个数为1时，直接返回当前坐标点，无需计算
    if (vertices.length === 1) return vertices;
    // 顶点个数为2时，按照直线进行计算
    if (vertices.length === 2) {
      // 计算直线的外轮廓坐标
      return PolygonUtils.calcBentLineClockWisePoints(vertices, r, innerOrOuter);
    }
    return vertices.map((ver, index) => {
      // 前一个顶点
      const prev = CommonUtils.getPrevOfArray(vertices, index);
      // 后一个顶点
      const next = CommonUtils.getNextOfArray(vertices, index);
      // 判断顺时针
      const isClockwise = MathUtils.isPointClockwiseOfLine(next, prev, ver);
      // 计算角度
      let angle = MathUtils.calcTriangleAngle(prev, ver, next);
      // 判断是否顺时针
      if (!isClockwise) {
        angle = 180 + angle;
      } else {
        angle = 180 - angle;
      }
      // 线条是否闭合
      const { isFold = true } = options;
      // 如果不是闭合线条，且当前顶点是第一个或最后一个顶点，则计算当前顶点的临边角度并计算对应的外轮廓坐标
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
