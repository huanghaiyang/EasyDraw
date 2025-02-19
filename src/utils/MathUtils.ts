import { multiply, cos, sin, add, isPositive } from "mathjs";
import { IPoint, ScaleValue, TranslationValue } from "@/types";
import CommonUtils from "@/utils/CommonUtils";
import { AngleModel } from "@/types/IElement";

// 直线类型
export type DirectionLine = { point: IPoint; direction: IPoint };

export default class MathUtils {
  /**
   * 计算平移矩阵
   *
   * @param dx
   * @param dy
   * @returns
   */
  static calcTranslateMatrix(dx: number, dy: number): number[][] {
    return [
      [1, 0, dx],
      [0, 1, dy],
      [0, 0, 1],
    ];
  }
  /**
   * 平移
   *
   * @param coord
   * @param value
   * @returns
   */
  static translate(coord: IPoint, value: TranslationValue): IPoint {
    const translationMatrix = MathUtils.calcTranslateMatrix(value.dx, value.dy);
    const translatedPoint = multiply(translationMatrix, [coord.x, coord.y, 1]);
    return MathUtils.precisePoint(
      {
        x: translatedPoint[0],
        y: translatedPoint[1],
      },
      1,
    );
  }

  /**
   * 批量平移
   *
   * @param coords
   * @param value
   * @returns
   */
  static batchTraslate(coords: IPoint[], value: TranslationValue): IPoint[] {
    return coords.map(coord => this.translate(coord, value));
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
    const rotationMatrix = MathUtils.calcRotateMatrix(angle);
    const rotatedPoint = multiply(rotationMatrix, [coord.x, coord.y, 1]);
    return MathUtils.precisePoint(
      {
        x: rotatedPoint[0],
        y: rotatedPoint[1],
      },
      1,
    );
  }

  /**
   * 批量旋转
   *
   * @param coords
   * @param angle
   * @returns
   */
  static batchRotate(coords: IPoint[], angle: number): IPoint[] {
    return coords.map(coord => this.rotate(coord, angle));
  }

  /**
   * 计算缩放矩阵
   *
   * @param scaleX
   * @param scaleY
   * @returns
   */
  static calcScaleMatrix(scaleX: number, scaleY: number): number[][] {
    return [
      [scaleX, 0, 0],
      [0, scaleY, 0],
      [0, 0, 1],
    ];
  }

  /**
   * 给定原点，以及一个不断移动的点，计算出缩放矩阵
   *
   * 旋转角度为0的情况下
   *
   * @param center 旋转中心点
   * @param point 移动点
   * @param originalPoint 缩放前的点
   * @param angles 旋转角度和纵轴倾斜角度
   */
  static calcTransformMatrix(
    center: IPoint,
    point: IPoint,
    originalPoint: IPoint,
    angles: Partial<AngleModel> = {},
  ): number[][] {
    // 计算移动点在原始坐标系中的位置
    point = MathUtils.transWithCenter(point, angles, center, true);
    // 计算缩放前的点在原始坐标系中的位置
    originalPoint = MathUtils.transWithCenter(
      originalPoint,
      angles,
      center,
      true,
    );
    // 计算原始宽度
    const originalWidth = originalPoint.x - center.x;
    // 计算原始高度
    const originalHeight = originalPoint.y - center.y;
    // 计算新宽度
    const newWidth = point.x - center.x;
    // 计算新高度
    const newHeight = point.y - center.y;
    // 计算宽度缩放比例
    const scaleX = originalWidth === 0 ? 1 : newWidth / originalWidth;
    // 计算高度缩放比例
    const scaleY = originalHeight === 0 ? 1 : newHeight / originalHeight;
    // 返回缩放矩阵
    return MathUtils.calcScaleMatrix(scaleX, scaleY);
  }

  /**
   * 相对于圆心上旋转
   *
   * @param coord
   * @param angle
   * @param center
   * @returns
   */
  static rotateWithCenter(
    point: IPoint,
    angle: number,
    center: IPoint,
  ): IPoint {
    point = {
      x: point.x - center.x,
      y: point.y - center.y,
    };
    const result = MathUtils.rotate(point, angle);
    return MathUtils.precisePoint(
      {
        x: result.x + center.x,
        y: result.y + center.y,
      },
      1,
    );
  }

  /**
   * 旋转一组点
   *
   * @param coords
   * @param angle
   * @param center
   * @returns
   */
  static batchRotateWithCenter(
    coords: IPoint[],
    angle: number,
    center: IPoint,
  ): IPoint[] {
    return coords.map(coord =>
      MathUtils.rotateWithCenter(coord, angle, center),
    );
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coord
   * @param leanYAngle
   * @param center
   * @returns
   */
  static leanYWithCenter(
    coord: IPoint,
    leanYAngle: number,
    center: IPoint,
  ): IPoint {
    return MathUtils.leanWithCenter(coord, 0, leanYAngle, center);
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coords
   * @param leanYAngle
   * @param center
   * @returns
   */
  static batchLeanYWithCenter(
    coords: IPoint[],
    leanYAngle: number,
    center: IPoint,
  ): IPoint[] {
    return coords.map(coord =>
      MathUtils.leanYWithCenter(coord, leanYAngle, center),
    );
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coord
   * @param leanXAngle
   * @param center
   * @returns
   */
  static leanXWithCenter(
    coord: IPoint,
    leanXAngle: number,
    center: IPoint,
  ): IPoint {
    return MathUtils.leanWithCenter(coord, leanXAngle, 0, center);
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coords
   * @param leanXAngle
   * @param center
   * @returns
   */
  static batchLeanXWithCenter(
    coords: IPoint[],
    leanXAngle: number,
    center: IPoint,
  ): IPoint[] {
    return coords.map(coord =>
      MathUtils.leanXWithCenter(coord, leanXAngle, center),
    );
  }

  /**
   * 计算偏移矩阵
   *
   * @param leanXAngle
   * @param leanYAngle
   * @returns
   */
  static calcLeanMatrix(leanXAngle: number, leanYAngle: number): number[][] {
    leanXAngle = leanXAngle || 0;
    leanYAngle = leanYAngle || 0;
    const leanX = Math.tan(MathUtils.angleToRadian(leanXAngle));
    const leanY = -Math.tan(MathUtils.angleToRadian(leanYAngle));
    const matrix = [
      [1, leanY, 0],
      [leanX, 1, 0],
      [0, 0, 1],
    ];
    return matrix;
  }

  /**
   * 计算旋转矩阵
   *
   * @param angle
   * @returns
   */
  static calcRotateMatrix(angle: number): number[][] {
    angle = angle || 0;
    const theta = MathUtils.angleToRadian(angle);
    return [
      [cos(theta), -sin(theta), 0],
      [sin(theta), cos(theta), 0],
      [0, 0, 1],
    ];
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coord
   * @param leanXAngle
   * @param leanYAngle
   * @param center
   * @returns
   */
  static leanWithCenter(
    coord: IPoint,
    leanXAngle: number,
    leanYAngle: number,
    center: IPoint,
  ): IPoint {
    const matrix = MathUtils.calcLeanMatrix(leanXAngle, leanYAngle);
    const result = multiply(matrix, [
      coord.x - center.x,
      coord.y - center.y,
      1,
    ]);
    return MathUtils.precisePoint(
      {
        x: add(result[0], center.x),
        y: add(result[1], center.y),
      },
      1,
    );
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coords
   * @param leanXAngle
   * @param leanYAngle
   * @param center
   * @returns
   */
  static batchLeanWithCenter(
    coords: IPoint[],
    leanXAngle: number,
    leanYAngle: number,
    center: IPoint,
  ): IPoint[] {
    return coords.map(coord =>
      MathUtils.leanWithCenter(coord, leanXAngle, leanYAngle, center),
    );
  }

  /**
   * 旋转倾斜坐标系上的某一点
   *
   * @param coord
   * @param angles
   * @param center
   * @param isReverse
   * @returns
   */
  static transWithCenter(
    coord: IPoint,
    angles: Partial<AngleModel>,
    center: IPoint,
    isReverse?: boolean,
  ) {
    let { angle = 0, leanXAngle = 0, leanYAngle = 0 } = angles || {};
    if (isReverse) {
      angle = -angle;
      leanXAngle = -leanXAngle;
      leanYAngle = -leanYAngle;
    }
    let matrix: number[][];
    const leanMatrix = MathUtils.calcLeanMatrix(leanXAngle, leanYAngle);
    const rotateMatrix = MathUtils.calcRotateMatrix(angle);
    if (isReverse) {
      matrix = multiply(leanMatrix, rotateMatrix) as unknown as number[][];
    } else {
      matrix = multiply(rotateMatrix, leanMatrix) as unknown as number[][];
    }
    let result = multiply(matrix, [coord.x - center.x, coord.y - center.y, 1]);
    return MathUtils.precisePoint(
      {
        x: add(result[0], center.x),
        y: add(result[1], center.y),
      },
      1,
    );
  }

  /**
   * 旋转倾斜坐标系上的某一点
   *
   * @param coords
   * @param angles
   * @param center
   * @returns
   */
  static batchTransWithCenter(
    coords: IPoint[],
    angles: Partial<AngleModel>,
    center: IPoint,
    isReverse?: boolean,
  ) {
    return coords.map(coord =>
      MathUtils.transWithCenter(coord, angles, center, isReverse),
    );
  }

  /**
   * 旋转并平移
   *
   * @param coord
   * @param angle
   * @param value
   * @returns
   */
  static rotateAndTranslate(
    coord: IPoint,
    angle: number,
    value: TranslationValue,
  ): IPoint {
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
    const scaleMatrix = MathUtils.calcScaleMatrix(value.sx, value.sy);
    const scaledPoint = multiply(scaleMatrix, [coord.x, coord.y, 1]);
    return MathUtils.precisePoint(
      {
        x: scaledPoint[0],
        y: scaledPoint[1],
      },
      1,
    );
  }

  /**
   * 批量缩放
   *
   * @param coords
   * @param value
   * @returns
   */
  static scales(coords: IPoint[], value: ScaleValue): IPoint[] {
    return coords.map(coord => MathUtils.scale(coord, value));
  }

  /**
   * 缩放坐标系上的某一点
   *
   * @param coord
   * @param value
   * @param center
   * @returns
   */
  static scaleWithCenter(
    coord: IPoint,
    value: ScaleValue,
    center: IPoint,
  ): IPoint {
    coord = {
      x: coord.x - center.x,
      y: coord.y - center.y,
    };
    coord = MathUtils.scale(coord, value);
    return MathUtils.precisePoint(
      {
        x: coord.x + center.x,
        y: coord.y + center.y,
      },
      1,
    );
  }

  /**
   * 批量缩放坐标系上的点集
   *
   * @param coords
   * @param value
   * @param center
   * @returns
   */
  static batchScaleWithCenter(
    coords: IPoint[],
    value: ScaleValue,
    center: IPoint,
  ): IPoint[] {
    return coords.map(coord => MathUtils.scaleWithCenter(coord, value, center));
  }
  /**
   * 角度转弧度
   *
   * @param degrees
   * @returns
   */
  static angleToRadian(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 弧度转角度
   *
   * @param radians
   * @returns
   */
  static radianToAngle(radians: number): number {
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
      if (
        yi > py !== yj > py &&
        px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }

      // 特殊情况：点恰好在多边形的边上
      if (
        yi === py &&
        py === yj &&
        px >= Math.min(xi, xj) &&
        px <= Math.max(xi, xj) &&
        py >= Math.min(yi, yj) &&
        py <= Math.max(yi, yj)
      ) {
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
        let edge = [
          polygon[next][0] - polygon[i][0],
          polygon[next][1] - polygon[i][1],
        ];
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

    return MathUtils.precisePoint({ x: centerX, y: centerY }, 1);
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
    const angleRad = MathUtils.angleToRadian(angleDeg);
    // 计算目标点的坐标
    const targetX = center.x + distance * cos(angleRad);
    const targetY = center.y + distance * sin(angleRad);
    return MathUtils.precisePoint({ x: targetX, y: targetY }, 1);
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
   * 计算内角
   *
   * @param boxPoints
   * @returns
   */
  static calcInternalAngle(boxPoints: IPoint[]): number {
    return (
      180 -
      MathUtils.calcTriangleAngle(boxPoints[0], boxPoints[3], boxPoints[2])
    );
  }

  /**
   * 计算倾斜Y角度
   *
   * @param internalAngle
   * @param flipX
   * @returns
   */
  static calcLeanYAngle(internalAngle: number, flipX: boolean): number {
    if (flipX) return internalAngle - 90;
    return 90 - internalAngle;
  }

  /**
   * 根据点集和翻转信息计算倾斜Y角度
   *
   * @param boxPoints
   * @param flipX
   * @returns
   */
  static calcLeanYAngleByPoints(boxPoints: IPoint[], flipX: boolean): number {
    return MathUtils.calcLeanYAngle(
      MathUtils.calcInternalAngle(boxPoints),
      flipX,
    );
  }

  /**
   * 计算不倾斜的点集
   *
   * @param points
   * @param leanYAngle
   * @param leanXAngle
   * @returns
   */
  static calcUnLeanByPoints(
    points: IPoint[],
    leanXAngle: number,
    leanYAngle: number,
  ): IPoint[] {
    const center = MathUtils.calcCenter(points);
    return MathUtils.batchLeanWithCenter(
      points,
      -leanXAngle,
      -leanYAngle,
      center,
    );
  }

  /**
   * 判断翻转X是否正确
   *
   * @param boxPoints
   * @returns
   */
  static calcFlipXByPoints(boxPoints: IPoint[]): boolean {
    const centerCoord = MathUtils.calcCenter(boxPoints);
    return MathUtils.isPointClockwise(centerCoord, boxPoints[0], boxPoints[3]);
  }

  /**
   * 计算实际角度
   *
   * @param points
   * @returns
   */
  static calcViewAngleByPoints(boxPoints: IPoint[]): number {
    const angle = MathUtils.calcAngle(boxPoints[2], boxPoints[1]);
    return MathUtils.mirrorAngle(angle + 90);
  }

  /**
   * 计算实际角度
   *
   * @param boxPoints
   * @returns
   */
  static calcActualAngleByPoints(boxPoints: IPoint[]): number {
    const internalAngle = MathUtils.calcInternalAngle(boxPoints);
    const leanYAngle = MathUtils.calcLeanYAngle(
      internalAngle,
      MathUtils.calcFlipXByPoints(boxPoints),
    );
    const viewAngle = MathUtils.calcViewAngleByPoints(boxPoints);
    return MathUtils.mirrorAngle(viewAngle - leanYAngle);
  }

  /**
   * 镜像角度
   *
   * @param angle
   * @returns
   */
  static mirrorAngle(angle: number): number {
    // 将角度限制在[-180, 180]之间
    while (angle > 180) {
      angle -= 360;
    }
    while (angle < -180) {
      angle += 360;
    }
    return angle;
  }

  /**
   * 角度归一化
   *
   * @param angle
   * @returns
   */
  static normalizeAngle(angle: number): number {
    if (angle < 0) {
      angle = angle + 360;
    }
    return angle;
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
  static calcSegmentLineCenterCrossPoint(
    p1: IPoint,
    p2: IPoint,
    isClockwise: boolean,
    distance: number,
  ): IPoint {
    // 计算中心点
    const center = MathUtils.calcCenter([p1, p2]);
    // 计算角度
    const angle = MathUtils.calcAngle(p1, p2);
    // 计算目标点
    return MathUtils.calcTargetPoint(
      center,
      distance,
      isClockwise ? angle + 90 : angle - 90,
    );
  }

  /**
   * 计算点在线段上的射影坐标
   *
   * @param p
   * @param a
   * @param b
   * @returns
   */
  static calcProjectionOnSegment(p: IPoint, a: IPoint, b: IPoint): IPoint {
    const t = MathUtils.calcSegmentProportion(p, a, b);
    const closetX = a.x + t * (b.x - a.x);
    const closetY = a.y + t * (b.y - a.y);
    return MathUtils.precisePoint({ x: closetX, y: closetY }, 1);
  }

  /**
   * 计算点到直线的距离
   *
   * @param point
   * @param a
   * @param b
   */
  static calcDistancePointToLine(p: IPoint, a: IPoint, b: IPoint): number {
    const { x: closetX, y: closetY } = MathUtils.calcProjectionOnSegment(
      p,
      a,
      b,
    );
    return Math.sqrt(
      (p.x - closetX) * (p.x - closetX) + (p.y - closetY) * (p.y - closetY),
    );
  }

  /**
   * 计算线段上一点的内分比或者外分比
   *
   * 1. 如果大于1则点在ab的延长线上
   * 2. 如果小于0则点在ba的延长线上
   *
   * @param p
   * @param a
   * @param b
   * @returns
   */
  static calcSegmentProportion(p: IPoint, a: IPoint, b: IPoint): number {
    const Abx = b.x - a.x;
    const Aby = b.y - a.y;
    const Apx = p.x - a.x;
    const Apy = p.y - a.y;
    const ab_sq = Abx * Abx + Aby * Aby;
    return (Apx * Abx + Apy * Aby) / ab_sq;
  }

  /**
   * 判断点在线段的射影是否在线段上
   *
   * @param p
   * @param a
   * @param b
   */
  static isProjectionOnSegment(p: IPoint, a: IPoint, b: IPoint): boolean {
    const t = MathUtils.calcSegmentProportion(p, a, b);
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
  static isPointClosestSegment(
    point: IPoint,
    a: IPoint,
    b: IPoint,
    maxDistance: number,
  ): boolean {
    if (!MathUtils.isProjectionOnSegment(point, a, b)) return false;
    return MathUtils.calcDistancePointToLine(point, a, b) < maxDistance;
  }

  /**
   * 判断点是否在给定的点附近位置上
   *
   * @param point
   * @param target
   * @param distance
   * @returns
   */
  static isPointClosest(
    point: IPoint,
    target: IPoint,
    distance: number,
  ): boolean {
    return MathUtils.calcDistance(point, target) <= distance;
  }

  /**
   * 判断点是否在给定的点附近位置上
   *
   * @param point
   * @param points
   * @param distance
   * @returns
   */
  static isPointClosestWhichPoint(
    point: IPoint,
    points: IPoint[],
    distance: number,
  ): number {
    for (let i = 0; i < points.length; i++) {
      if (MathUtils.isPointClosest(point, points[i], distance)) {
        return i;
      }
    }
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
  static calcDistance(p1: IPoint, p2: IPoint) {
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
      MathUtils.calcDistance(points[0], points[1]),
      MathUtils.calcDistance(points[1], points[2]),
      MathUtils.calcDistance(points[2], points[3]),
      MathUtils.calcDistance(points[3], points[0]),
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
    return a * b >= 0;
  }

  /**
   * 保留小数点后几位
   *
   * @param num
   * @param precision
   * @returns
   */
  static precise(number: number, digits: number = 2): number {
    if (typeof number !== "number" || typeof digits !== "number") {
      throw new TypeError("Both arguments must be numbers");
    }

    // Handle edge cases for very small or very large numbers
    if (!isFinite(number)) {
      return number;
    }

    const factor = Math.pow(10, digits);
    const roundedNumber = Math.round(number * factor);
    const resultString = roundedNumber / factor;

    // Ensure the result has the correct number of decimal places
    const resultArray = resultString.toString().split(".");
    if (resultArray.length === 1) {
      resultArray.push(""); // No decimal part
    }
    while (resultArray[1].length < digits) {
      resultArray[1] += "0"; // Add trailing zeros if necessary
    }

    return Number(resultArray.join("."));
  }

  /**
   * 批量保留小数点后几位
   *
   * @param numbers
   * @param digits
   * @returns
   */
  static batchPrecise(numbers: number[], digits: number): number[] {
    return numbers.map(num => MathUtils.precise(num, digits));
  }

  /**
   * 保留小数点后几位
   *
   * @param point
   * @param digits
   * @returns
   */
  static precisePoint(point: IPoint, digits: number): IPoint {
    return {
      x: MathUtils.precise(point.x, digits),
      y: MathUtils.precise(point.y, digits),
    };
  }

  /**
   * 批量保留小数点后几位
   *
   * @param points
   * @param digits
   * @returns
   */
  static batchPrecisePoint(points: IPoint[], digits: number): IPoint[] {
    return points.map(point => MathUtils.precisePoint(point, digits));
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
    // 计算夹角的余弦值,值为1表示三点共线
    let cosTheta = dotProduct / (magnitudeAB * magnitudeBC);
    // 计算夹角（以弧度为单位）
    let angleRadians = Math.acos(cosTheta);
    // 将弧度转换为度
    let angleDegrees = angleRadians * (180 / Math.PI);
    // 如果角度是不合法的值，则返回0，表示三点共线
    if (isNaN(angleDegrees)) {
      angleDegrees = 0;
    }
    return angleDegrees;
  }

  /**
   * 给定三角形的三个坐标点a,b,c计算b的内测夹角
   *
   * @param a
   * @param b
   * @param c
   * @returns
   */
  static calcTriangleAngle2(a: IPoint, b: IPoint, c: IPoint): number {
    const angle = Math.acos(
      (Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) /
        (Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2)),
    );
    return angle * (180 / Math.PI);
  }

  /**
   * 给定三角形的三个坐标点a,b,c计算b的外侧夹角
   *
   * @param a
   * @param b
   * @param c
   * @returns
   */
  static calcTriangleAngle3(a: IPoint, b: IPoint, c: IPoint): number {
    const angle = Math.acos(
      (Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2)) /
        (Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)),
    );
    return angle * (180 / Math.PI);
  }

  /**
   * 给定a向量和b向量，其中b垂直于a，且a+b=c,求向量c的坐标
   *
   * @param a
   * @param b
   * @returns
   */
  static calcVectorC(a: IPoint, b: IPoint): IPoint {
    const cx = a.x + b.x;
    const cy = a.y + b.y;
    return { x: cx, y: cy };
  }

  /**
   * 给定原点以及坐标，计算向量
   *
   * @param origin
   * @param point
   * @returns
   */
  static calcVector(origin: IPoint, point: IPoint): IPoint {
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    return { x: dx, y: dy };
  }

  /**
   * 向量平移到新的原点
   *
   * @param vector
   * @param origin
   * @returns
   */
  static translateVector(vector: IPoint, origin: IPoint): IPoint {
    const dx = vector.x - origin.x;
    const dy = vector.y - origin.y;
    return { x: dx, y: dy };
  }

  /**
   * 给定角度和对边边长，计算直角三角形的临边边长
   *
   * @param angle
   * @param value
   * @returns
   */
  static calcTriangleSide1By2(angle: number, value: number): number {
    const radians = angle * MathUtils.angleToRadian(angle);
    return value / Math.tan(radians);
  }

  /**
   * 给定角度和临边边长，计算直角三角形的斜边边长
   *
   * @param angle
   * @param value
   * @returns
   */
  static calcTriangleSide3By1(angle: number, value: number): number {
    const radians = angle * MathUtils.angleToRadian(angle);
    return value / Math.cos(radians);
  }

  /**
   * 给定角度和对边边长，计算直角三角形的斜边边长
   *
   * @param angle
   * @param value
   * @returns
   */
  static calcTriangleSide3By2(angle: number, value: number): number {
    const radians = MathUtils.angleToRadian(angle);
    return value / Math.sin(radians);
  }

  /**
   * 给定角度和斜边长，求临边长度
   *
   * @param angle
   * @param hypotenuse
   */
  static calcTriangleSide1By3(angle: number, hypotenuse: number): number {
    const radians = MathUtils.angleToRadian(angle);
    return hypotenuse * Math.cos(radians);
  }

  /**
   * 给定角度和斜边长，求对边长
   */
  static calcTriangleSide2By3(angle: number, hypotenuse: number): number {
    const radians = MathUtils.angleToRadian(angle);
    return hypotenuse * Math.sin(radians);
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
    return MathUtils.sortVerticesClockwiseByCenter(vertices, center);
  }

  /**
   * 给定顶点数组和质心，将顶点数组按照顺时针方向排序
   *
   * @param vertices
   * @param center
   * @returns
   */
  static sortVerticesClockwiseByCenter(
    vertices: IPoint[],
    center: IPoint,
  ): IPoint[] {
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
  static calcAngleBetweenPointAndSegment(
    point: IPoint,
    segmentStart: IPoint,
    segmentEnd: IPoint,
  ): number {
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
  static isPointClockwise(
    point: IPoint,
    lineStart: IPoint,
    lineEnd: IPoint,
  ): boolean {
    const crossProduct =
      (point.x - lineStart.x) * (lineEnd.y - lineStart.y) -
      (point.y - lineStart.y) * (lineEnd.x - lineStart.x);
    return crossProduct < 0;
  }

  /**
   * 根据矩阵获取缩放比例
   *
   * @param matrix
   * @returns
   */
  static getScaleFromMatrix(matrix: number[][]): {
    scaleX: number;
    scaleY: number;
  } {
    return {
      scaleX: matrix[0][0],
      scaleY: matrix[1][1],
    };
  }

  /**
   * 计算平行四边形四个内角平分线的两个交点坐标
   *
   * @param vertices 平行四边形的四个顶点坐标，按顺序排列
   * @returns 两个交点坐标数组
   */
  static calculateAngleBisectorIntersection(vertices: IPoint[]): IPoint[] {
    if (vertices.length !== 4) {
      throw new Error("必须提供四个顶点坐标");
    }

    // 定义四个顶点A, B, C, D
    const [A, B, C, D] = vertices;

    // 计算每个顶点的角平分线参数方程
    const bisectors = MathUtils.calcBisectors(vertices);
    const width = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    const height = Math.sqrt(Math.pow(D.x - A.x, 2) + Math.pow(D.y - A.y, 2));

    // 计算相邻顶点的角平分线交点
    const intersections: IPoint[] = [];

    if (width < height) {
      intersections.push(
        MathUtils.calcIntersection(bisectors[0], bisectors[1]),
      );
      intersections.push(
        MathUtils.calcIntersection(bisectors[2], bisectors[3]),
      );
    } else {
      intersections.push(
        MathUtils.calcIntersection(bisectors[0], bisectors[3]),
      );
      intersections.push(
        MathUtils.calcIntersection(bisectors[1], bisectors[2]),
      );
    }

    return intersections;
  }

  /**
   * 计算两条直线的交点
   *
   * @param line1
   * @param line2
   * @returns
   */
  static calcIntersection(
    line1: DirectionLine,
    line2: DirectionLine,
  ): IPoint | null {
    const p1 = line1.point;
    const d1 = line1.direction;
    const p2 = line2.point;
    const d2 = line2.direction;

    // 解参数方程：p1 + t*d1 = p2 + s*d2
    const denominator = d1.x * d2.y - d1.y * d2.x;
    if (Math.abs(denominator) < 1e-6) return null; // 平行线无交点

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const t = (dx * d2.y - dy * d2.x) / denominator;
    const s = (dx * d1.y - dy * d1.x) / denominator;

    return MathUtils.precisePoint(
      {
        x: p1.x + t * d1.x,
        y: p1.y + t * d1.y,
      },
      1,
    );
  }

  /**
   * 计算给定多边形的角平分线
   *
   * @param vertices
   * @returns
   */
  static calcBisectors(vertices: IPoint[]): DirectionLine[] {
    const [A, B, C, D] = vertices;
    return vertices.map((vertex, index) => {
      let v1: IPoint, v2: IPoint;
      switch (index) {
        case 0: // A: 邻边AB和AD
          v1 = { x: B.x - A.x, y: B.y - A.y };
          v2 = { x: D.x - A.x, y: D.y - A.y };
          break;
        case 1: // B: 邻边BA和BC
          v1 = { x: A.x - B.x, y: A.y - B.y };
          v2 = { x: C.x - B.x, y: C.y - B.y };
          break;
        case 2: // C: 邻边CB和CD
          v1 = { x: B.x - C.x, y: B.y - C.y };
          v2 = { x: D.x - C.x, y: D.y - C.y };
          break;
        case 3: // D: 邻边DC和DA
          v1 = { x: C.x - D.x, y: C.y - D.y };
          v2 = { x: A.x - D.x, y: A.y - D.y };
          break;
        default:
          throw new Error("无效的顶点索引");
      }

      // 计算单位向量
      const len1 = Math.hypot(v1.x, v1.y);
      const len2 = Math.hypot(v2.x, v2.y);
      const uv1 = { x: v1.x / len1, y: v1.y / len1 };
      const uv2 = { x: v2.x / len2, y: v2.y / len2 };

      // 角平分线方向向量
      const dir = { x: uv1.x + uv2.x, y: uv1.y + uv2.y };

      return { point: vertex, direction: dir } as DirectionLine;
    });
  }

  /**
   * 求过平行四边形内一点的两条与平行四边形的四个边平行的线相较于四个边的交点
   */
  static calcCrossPointsOfParallelLines(
    point: IPoint,
    vertices: IPoint[],
  ): IPoint[] {
    const [A, B, C, D] = vertices;
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const BC = { x: C.x - B.x, y: C.y - B.y };
    const CD = { x: D.x - C.x, y: D.y - C.y };
    const DA = { x: A.x - D.x, y: A.y - D.y };
    const BA = { x: A.x - B.x, y: A.y - B.y };

    const p_ab = MathUtils.calcIntersection(
      { point: A, direction: AB },
      { point: point, direction: DA },
    );
    const p_bc = MathUtils.calcIntersection(
      { point: B, direction: BC },
      { point: point, direction: AB },
    );
    const p_cd = MathUtils.calcIntersection(
      { point: C, direction: CD },
      { point: point, direction: BC },
    );
    const p_da = MathUtils.calcIntersection(
      { point: D, direction: DA },
      { point: point, direction: BA },
    );

    return [p_ab, p_bc, p_cd, p_da];
  }

  /**
   * 给定三个坐标，计算三角形的面积
   */
  static calcTriangleArea(a: IPoint, b: IPoint, c: IPoint): number {
    const side1 = MathUtils.calcDistance(a, b);
    const side2 = MathUtils.calcDistance(b, c);
    const side3 = MathUtils.calcDistance(c, a);
    const s = (side1 + side2 + side3) / 2;
    return Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));
  }
}
