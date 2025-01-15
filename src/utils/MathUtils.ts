import { multiply, cos, sin, add, isPositive } from "mathjs";
import { IPoint, ScaleValue, TranslationValue } from "@/types";
import { divide } from "lodash";
import CommonUtils from '@/utils/CommonUtils';

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
   * @param angle 
   * @returns 
   */
  static rotate(coord: IPoint, angle: number): IPoint {
    const theta = MathUtils.degreesToRadians(angle); // 将角度转换为弧度
    const rotationMatrix = [[cos(theta), -sin(theta), 0], [sin(theta), cos(theta), 0], [0, 0, 1]];
    const rotatedPoint = multiply(rotationMatrix, [coord.x, coord.y, 1]);
    return {
      x: rotatedPoint[0],
      y: rotatedPoint[1]
    };
  }

  /**
   * 给定原点，以及一个不断移动的点，计算出缩放矩阵
   * 
   * 旋转角度为0的情况下
   * 
   * @param center 旋转中心点
   * @param point 移动点
   * @param originalPoint 缩放前的点
   */
  static calcTransformMatrixOfCenter(center: IPoint, point: IPoint, originalPoint: IPoint, angle?: number): number[][] {
    // 如果坐标系旋转过，则需要重新计算给定的坐标
    if (angle) {
      point = MathUtils.rotateRelativeCenter(point, -angle, center);
      originalPoint = MathUtils.rotateRelativeCenter(originalPoint, -angle, center);
    }
    const originalWidth = add(originalPoint.x, -center.x);
    const originalHeight = add(originalPoint.y, -center.y);
    const newWidth = add(point.x, - center.x);
    const newHeight = add(point.y, - center.y);
    const scaleX = originalWidth === 0 ? 1 : divide(newWidth, originalWidth);
    const scaleY = originalHeight === 0 ? 1 : divide(newHeight, originalHeight);
    return [[scaleX, 0, 0], [0, scaleY, 0], [0, 0, 1]];
  }

  /**
   * 相对于圆心上旋转
   * 
   * @param coord 
   * @param angle 
   * @param center 
   * @returns 
   */
  static rotateRelativeCenter(coord: IPoint, angle: number, center: IPoint): IPoint {
    const point = {
      x: add(coord.x, - center.x),
      y: add(coord.y, - center.y)
    };
    const result = MathUtils.rotate(point, angle);
    return {
      x: add(result.x, center.x),
      y: add(result.y, center.y)
    }
  }

  /**
   * 旋转垂直坐标系上的某一点（x右侧为正，顺时针为正角度）
   * 
   * @param point 
   * @param angle 
   * @returns 
   */
  static rotatePoint(point: IPoint, angle: number): IPoint {
    const { x, y } = point;
    const theta = MathUtils.degreesToRadians(angle);
    // 计算新坐标
    let xPrime = add(multiply(x, cos(theta)), - multiply(y, sin(theta)));
    let yPrime = add(multiply(x, sin(theta)), multiply(y, cos(theta)));
    return { x: xPrime, y: yPrime };
  }

  /**
   * 旋转并平移
   * 
   * @param coord 
   * @param angle 
   * @param value 
   * @returns 
   */
  static rotateAndTranslate(coord: IPoint, angle: number, value: TranslationValue): IPoint {
    return MathUtils.translate(MathUtils.rotate(coord, angle), value);
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
  static isPolygonsOverlap(points1: IPoint[], points2: IPoint[]) {
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
   * 计算多边形的质心（几何法）
   * 
   * @param points 
   * @returns 
   */
  static calcPolygonCentroid(points: IPoint[]): IPoint {
    if (!points || points.length === 0) {
      throw new Error("顶点数组不能为空");
    }

    let centerX = 0;
    let centerY = 0;
    const numPoints = points.length;

    for (let i = 0; i < numPoints; i++) {
      centerX += points[i].x;
      centerY += points[i].y;
    }

    centerX /= numPoints;
    centerY /= numPoints;

    return { x: centerX, y: centerY };
  }

  /**
   * 计算中心点
   * 
   * @param points 
   * @returns 
   */
  static calcCenter(points: IPoint[]): IPoint {
    const box = CommonUtils.getBoxPoints(points);
    return MathUtils.calcPolygonCentroid(box);
  }

  /**
   * 给定中心点和一个距离，以及一个角度，计算出该角度下的目标点。
   * 
   * 以x轴为0度，顺时针为正，逆时针为负
   * 
   * @param center 
   * @param distance 
   * @param angleDeg 值如果小于0，请加上360在传递给此方法
   * @returns 
   */
  static calcTargetPoint(center: IPoint, distance: number, angleDeg: number) {
    // 将角度转换为弧度
    const angleRad = MathUtils.degreesToRadians(angleDeg);
    // 计算目标点的坐标
    const targetX = center.x + distance * cos(angleRad);
    const targetY = center.y + distance * sin(angleRad);
    return { x: targetX, y: targetY };
  }

  /**
   * 计算两个点之间的夹角，以x轴正方向为0度，逆时针为负，顺时针为正，角度绝对值不超过180
   * 
   * @param p1 
   * @param p2 
   * @returns 
   */
  static calcAngle(p1: IPoint, p2: IPoint): number {
    // 计算两点之间的差值
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // 使用atan2函数计算角度（弧度）
    const angleRadians = Math.atan2(dy, dx);
    // 将角度转换为度数
    const angleDegrees = angleRadians * (180 / Math.PI);
    return angleDegrees;
  }

  /**
   * 给定一条线段，求距离线段中心点距离的一点，参数为直线的点一和点二，是否顺时针还是逆时针，距离，共四个参数
   * 
   * 注意p1一定是x轴值最小的那个点
   * 
   * @param p1 
   * @param p2 
   * @param isClockwise 
   * @param distance 
   */
  static calcSegmentLineCenterCrossPoint(p1: IPoint, p2: IPoint, isClockwise: boolean, distance: number): IPoint {
    const center = MathUtils.calcCenter([p1, p2]);
    const angle = MathUtils.calcAngle(p1, p2);
    return MathUtils.calcTargetPoint(center, distance, isClockwise ? angle + 90 : angle - 90);
  }

  /**
   * 计算点到直线的距离
   * 
   * @param point
   * @param a 
   * @param b
   */
  static calcDistancePointToLine(p: IPoint, a: IPoint, b: IPoint): number {
    const Abx = b.x - a.x;
    const Aby = b.y - a.y;
    const Apx = p.x - a.x;
    const Apy = p.y - a.y;
    const ab_sq = Abx * Abx + Aby * Aby;
    const t = (Apx * Abx + Apy * Aby) / ab_sq;
    const closetX = a.x + t * Abx;
    const closetY = a.y + t * Aby;
    return Math.sqrt((p.x - closetX) * (p.x - closetX) + (p.y - closetY) * (p.y - closetY));
  }

  /**
   * 判断点在线段的射影是否在线段上
   * 
   * @param p 
   * @param a 
   * @param b
   */
  static isProjectionOnSegment(p: IPoint, a: IPoint, b: IPoint): boolean {
    // 计算向量AB和AP
    const Abx = b.x - a.x;
    const Aby = b.y - a.y;
    const Apx = p.x - a.x;
    const Apy = p.y - a.y;
    // 计算向量AB的长度平方
    const ab_sq = Abx * Abx + Aby * Aby;
    // 计算点P在向量AB上的投影长度比例t
    const t = (Apx * Abx + Apy * Aby) / ab_sq;
    // 如果t在0到1之间，则投影在线段上
    return t >= 0 && t <= 1;
  }


  /**
   * 判断点是否在给定的线段附近位置上
   * 
   * @param point 
   * @param a 
   * @param b 
   * @param maxDistance 
   * @returns 
   */
  static isPointClosestSegment(point: IPoint, a: IPoint, b: IPoint, maxDistance: number): boolean {
    if (!MathUtils.isProjectionOnSegment(point, a, b)) return false;
    return MathUtils.calcDistancePointToLine(point, a, b) < maxDistance;
  }

  /**
   * 将大于90度的钝角转换为锐角
   * 
   * @param angle 
   * @returns 
   */
  static transformToAcuteAngle(angle: number) {
    if (angle > 90) {
      angle = 180 - angle;
    }
    return angle;
  }

  /**
   * 计算两点之间的距离
   * 
   * @param p1 
   * @param p2 
   * @returns 
   */
  static distanceBetweenPoints(p1: IPoint, p2: IPoint) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * 判断给定的四边形是否是一个矩形
   * 
   * @param points 
   */
  static isRectangle(points: IPoint[]): boolean {
    if (points.length !== 4) {
      return false;
    }
    const sides = [
      MathUtils.distanceBetweenPoints(points[0], points[1]),
      MathUtils.distanceBetweenPoints(points[1], points[2]),
      MathUtils.distanceBetweenPoints(points[2], points[3]),
      MathUtils.distanceBetweenPoints(points[3], points[0]),
    ];
    const uniqueSides = new Set(sides);
    return uniqueSides.size === 2;
  }

  /**
   * 判断两个数值的符号是否相等
   * 
   * @param a 
   * @param b 
   */
  static isSameSign(a: number, b: number): boolean {
    return (a * b) >= 0;
  }

  /**
   * 保留小数点后几位
   * 
   * @param num 
   * @param precision 
   * @returns 
   */
  static preciseToFixed(number: number, digits: number = 2): number {
    if (typeof number !== 'number' || typeof digits !== 'number') {
      throw new TypeError('Both arguments must be numbers');
    }

    // Handle edge cases for very small or very large numbers
    if (!isFinite(number)) {
      return number;
    }

    const factor = Math.pow(10, digits);
    const roundedNumber = Math.round(number * factor);
    const resultString = roundedNumber / factor;

    // Ensure the result has the correct number of decimal places
    const resultArray = resultString.toString().split('.');
    if (resultArray.length === 1) {
      resultArray.push(''); // No decimal part
    }
    while (resultArray[1].length < digits) {
      resultArray[1] += '0'; // Add trailing zeros if necessary
    }

    return Number(resultArray.join('.'));
  }
  /**
   * 给定三角形的三个坐标点a,b,c计算b的夹角
   */
  static calcTriangleAngle(a: IPoint, b: IPoint, c: IPoint): number {
    // 计算向量AB和BC
    let AB = { x: b.x - a.x, y: b.y - a.y };
    let BC = { x: c.x - b.x, y: c.y - b.y };
    // 计算向量的点积
    let dotProduct = AB.x * BC.x + AB.y * BC.y;
    // 计算向量的模（长度）
    let magnitudeAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
    let magnitudeBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y);
    // 计算夹角的余弦值
    let cosTheta = dotProduct / (magnitudeAB * magnitudeBC);
    // 计算夹角（以弧度为单位）
    let angleRadians = Math.acos(cosTheta);
    // 将弧度转换为度
    let angleDegrees = angleRadians * (180 / Math.PI);
    return angleDegrees;
  }

  /**
   * 给定三角形的三个坐标点a,b,c计算b的内测夹角
   */
  static calcTriangleAngle2(a: IPoint, b: IPoint, c: IPoint): number {
    const angle = Math.acos((Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) / (Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2)));
    return angle * (180 / Math.PI);
  }

  /**
   * 给定三角形的三个坐标点a,b,c计算b的外侧夹角
   */
  static calcTriangleAngle3(a: IPoint, b: IPoint, c: IPoint): number {
    const angle = Math.acos((Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2)) / (Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)));
    return angle * (180 / Math.PI);
  }

  /**
   * 给定a向量和b向量，其中b垂直于a，且a+b=c,求向量c的坐标
   */
  static calcVectorC(a: IPoint, b: IPoint): IPoint {
    const cx = a.x + b.x;
    const cy = a.y + b.y;
    return { x: cx, y: cy };
  }

  /**
   * 给定原点以及坐标，计算向量
   */
  static calcVector(origin: IPoint, point: IPoint): IPoint {
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    return { x: dx, y: dy };
  }

  /**
   * 给定角度和对边边长，计算直角三角形的临边边长
   * 
   * @param angle 
   * @param oppositeSide 
   * @returns 
   */
  static calcTriangleSide1By2(angle: number, oppositeSide: number): number {
    const radians = angle * (Math.PI / 180);
    return oppositeSide / Math.tan(radians);
  }

  /**
   * 给定角度和对边边长，计算直角三角形的斜边边长
   * 
   * @param angle 
   * @param oppositeSide 
   * @returns 
   */
  static calcTriangleSide3By2(angle: number, oppositeSide: number): number {
    const radians = angle * (Math.PI / 180);
    return oppositeSide / sin(radians);
  }

  /**
   * 给定角度和斜边长，求临边长度
   * 
   * @param angle 
   * @param hypotenuse 
   */
  static calcTriangleSide1By3(angle: number, hypotenuse: number): number {
    const radians = angle * (Math.PI / 180);
    return hypotenuse * cos(radians);
  }

  /**
   * 给定角度和斜边长，求对边长
   */
  static calcTriangleSide2By3(angle: number, hypotenuse: number): number {
    const radians = angle * (Math.PI / 180);
    return hypotenuse * sin(radians);
  }

  /**
   * 将多边形的顶点按照顺时针方向排序
   * 
   * @param vertices 
   * @returns 
   */
  static sortVerticesClockwise(vertices: IPoint[]) {
    // 计算质心
    let center = MathUtils.calcCenter(vertices);
    // 计算每个顶点与质心之间的角度
    let angles = vertices.map((vertex, index) => {
      let angle = Math.atan2(vertex.y - center.y, vertex.x - center.x);
      return { index, angle };
    });

    // 根据角度进行排序
    angles.sort((a, b) => a.angle - b.angle);

    // 创建一个新的按顺时针排序的顶点数组
    let sortedVertices = [];
    for (let i = 0; i < angles.length; i++) {
      sortedVertices.push(vertices[angles[i].index]);
    }

    return sortedVertices;
  }

  /**
   * 计算点到线段中点的角度
   * 
   * @param point 
   * @param segmentStart 
   * @param segmentEnd 
   */
  static calcAngleBetweenPointAndSegment(point: IPoint, segmentStart: IPoint, segmentEnd: IPoint): number {
    const center = MathUtils.calcCenter([segmentStart, segmentEnd]);
    return MathUtils.calcAngle(point, center);
  }

  /**
   * 赋值但保留符号
   * 
   * @param value 
   * @param referValue 
   * @returns 
   */
  static resignValue(value: number, referValue: number): number {
    const isPst = isPositive(value);
    return isPst ? Math.abs(referValue) : -Math.abs(referValue);
  }

  /**
   * 判断点在直线的哪一侧
   * 
   * @param point 
   * @param lineStart 
   * @param lineEnd 
   */
  static pointSideOfLine(point: IPoint, lineStart: IPoint, lineEnd: IPoint): boolean {
    const crossProduct = (point.x - lineStart.x) * (lineEnd.y - lineStart.y) - (point.y - lineStart.y) * (lineEnd.x - lineStart.x);
    return crossProduct > 0;
  }

}