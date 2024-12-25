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
    const translationMatrix = [[1, 0, value.dx], [0, 1, value.dy], [0, 0, 1]];
    const translatedPoint = multiply(translationMatrix, [coord.x, coord.y, 1]);
    return {
      x: translatedPoint[0],
      y: translatedPoint[1]
    }
  }

  /**
   * 旋转
   * 
   * 在右手坐标系中，当从旋转轴的正向向原点看去，如果旋转是逆时针方向进行的，那么这种旋转被定义为正方向。相反，如果旋转是顺时针方向进行的，则定义为负方向。这一规则适用于绕任意坐标轴（x轴、y轴或z轴）的旋转。
   * 
   * @param coord 
   * @param thetaDegrees 
   * @returns 
   */
  static rotate(coord: IPoint, thetaDegrees: number): IPoint {
    const theta = MathUtils.degreesToRadians(thetaDegrees); // 将角度转换为弧度
    const rotationMatrix = [
      [Math.cos(theta), -Math.sin(theta), 0],
      [Math.sin(theta), Math.cos(theta), 0],
      [0, 0, 1]
    ];
    const rotatedPoint = multiply(rotationMatrix, [coord.x, coord.y, 1]);
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
    const scaleMatrix = [[value.sx, 0, 0], [0, value.sy, 0], [0, 0, 1]];
    const scaledPoint = multiply(scaleMatrix, [coord.x, coord.y, 1]);
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
    const { x: px, y: py } = coord;
    let totalArea = 0;
    const n = polygonCoords.length;

    for (let i = 0; i < n; i++) {
      const { x: x1, y: y1 } = polygonCoords[i];
      const { x: x2, y: y2 } = polygonCoords[(i + 1) % n];

      // 计算三角形面积
      const area = (x1 * y2 - x2 * y1) / 2;
      totalArea += area;
    }

    // 计算点与多边形顶点连线形成的三角形面积之和
    let testArea = 0;
    for (let i = 0; i < n; i++) {
      const { x: x1, y: y1 } = polygonCoords[i];
      const { x: x2, y: y2 } = polygonCoords[(i + 1) % n];

      // 计算三角形面积
      const area = Math.abs((x1 * (y2 - py) + x2 * (py - y1) + px * (y1 - y2)) / 2);
      testArea += area;
    }

    // 如果两个面积相等，则点在多边形内部
    return Math.abs(totalArea - testArea) < Number.EPSILON;
  }

  /**
   * 使用射线法判断点是否在多边形内
   * 
   * @param coord 
   * @param polygonCoords 
   * @returns 
   */
  static isPointInPolygonByRayCasting(coord: IPoint, polygonCoords: IPoint[]) {
    const point = [coord.x, coord.y];
    const polygon = polygonCoords.map(p => [p.x, p.y]);
    const [px, py] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      // 检查点是否在多边形的边上
      if ((yi > py) !== (yj > py) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }

      // 特殊情况：点恰好在多边形的边上
      if ((yi === py && py === yj && px >= Math.min(xi, xj) && px <= Math.max(xi, xj) && py >= Math.min(yi, yj) && py <= Math.max(yi, yj))) {
        return true;
      }
    }

    return inside;
  }

  /**
   * 要判断两个多边形是否重叠，可以使用分离轴定理（Separating Axis Theorem, SAT）。这个定理指出，如果存在一条轴，使得将两个多边形投影到这条轴上时，它们的投影不重叠，那么这两个多边形就不重叠。
   * 
   * @param points1 
   * @param points2 
   * @returns 
   */
  static polygonsOverlap(points1: IPoint[], points2: IPoint[]) {
    const poly1 = points1.map(p => [p.x, p.y]);
    const poly2 = points2.map(p => [p.x, p.y]);

    // 获取所有边
    function getEdges(polygon: number[][]) {
      let edges = [];
      for (let i = 0; i < polygon.length; i++) {
        let next = (i + 1) % polygon.length;
        let edge = [polygon[next][0] - polygon[i][0], polygon[next][1] - polygon[i][1]];
        edges.push(edge);
      }
      return edges;
    }

    // 计算点积
    function dotProduct(v1: number[], v2: number[]) {
      return v1[0] * v2[0] + v1[1] * v2[1];
    }

    // 计算法向量
    function normal(edge: number[]) {
      return [-edge[1], edge[0]];
    }

    // 投影多边形到轴上
    function projectPolygon(axis: number[], polygon: number[][]) {
      let min = dotProduct(axis, polygon[0]);
      let max = min;
      for (let i = 1; i < polygon.length; i++) {
        let projection = dotProduct(axis, polygon[i]);
        min = Math.min(min, projection);
        max = Math.max(max, projection);
      }
      return [min, max];
    }

    // 检查投影是否重叠
    function overlap(proj1: number[], proj2: number[]) {
      return proj1[0] <= proj2[1] && proj2[0] <= proj1[1];
    }

    // 获取两个多边形的所有边
    let edges1 = getEdges(poly1);
    let edges2 = getEdges(poly2);

    // 检查每个多边形的每条边作为分离轴
    for (let edge of edges1.concat(edges2)) {
      let axis = normal(edge);
      let proj1 = projectPolygon(axis, poly1);
      let proj2 = projectPolygon(axis, poly2);
      if (!overlap(proj1, proj2)) {
        return false; // 如果在任何轴上投影不重叠，则多边形不重叠
      }
    }

    return true; // 在所有轴上投影都重叠，则多边形重叠
  }

  /**
   * 计算多边形的中心节点（几何法）
   * 
   * @param points 
   * @returns 
   */
  static calcPolygonCentroid(points: IPoint[]): IPoint {
    if (!points || points.length === 0) {
      throw new Error("顶点数组不能为空");
    }

    let centroidX = 0;
    let centroidY = 0;
    const numPoints = points.length;

    for (let i = 0; i < numPoints; i++) {
      centroidX += points[i].x;
      centroidY += points[i].y;
    }

    centroidX /= numPoints;
    centroidY /= numPoints;

    return { x: centroidX, y: centroidY };
  }

  /**
   * 给定中心点和一个距离，以及一个角度，计算出该角度下的目标点。
   * 
   * 以x轴为0度，顺时针为正，逆时针为负
   * 
   * @param center 
   * @param distance 
   * @param angleDeg 
   * @returns 
   */
  static calculateTargetPoint(center: IPoint, distance: number, angleDeg: number) {
    // 将角度转换为弧度
    const angleRad = MathUtils.degreesToRadians(angleDeg);
    // 计算目标点的坐标
    const targetX = center.x + distance * Math.cos(angleRad);
    const targetY = center.y + distance * Math.sin(angleRad);
    return { x: targetX, y: targetY };
  }
}
