import { ILine, IPoint, ISize, ScaleValue } from "@/types";
import CommonUtils from "@/utils/CommonUtils";
import { AngleModel } from "@/types/IElement";
import { ArcPoints } from "@/types/IRender";
import { nanoid } from "nanoid";
import { MapNamedPoints, NamedPoints } from "@/types/IWorker";

// 直线类型
export type DirectionLine = { point: IPoint; direction: IPoint };

const worker = new Worker(new URL("./worker/MathWorker.ts", import.meta.url), { type: "module" });
const workerCallback = new Map<string, Function>();
worker.onmessage = (e: any) => {
  const { id, result } = e.data;
  let callback = workerCallback.get(id);
  callback && callback(result);
  workerCallback.delete(id);
  callback = null;
};

export default class MathUtils {
  /**
   * 矩阵相乘
   *
   * @param matrixA
   * @param matrixB
   * @returns
   */
  static multiply(matrixA: number[][], matrixB: number[] | number[][]) {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;

    // 判断 matrixB 是向量还是矩阵
    if (Array.isArray(matrixB[0])) {
      // matrixB 是矩阵
      const rowsB = matrixB.length;
      const colsB = matrixB[0].length;

      // 检查矩阵是否可以相乘
      if (colsA !== rowsB) {
        throw new Error("矩阵 A 的列数必须等于矩阵 B 的行数");
      }

      // 初始化结果矩阵
      const result = new Array(rowsA);
      for (let i = 0; i < rowsA; i++) {
        result[i] = new Array(colsB).fill(0);
      }

      // 执行矩阵相乘
      for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
          for (let k = 0; k < colsA; k++) {
            result[i][j] += matrixA[i][k] * matrixB[k][j];
          }
        }
      }

      return result;
    } else {
      // matrixB 是向量
      if (colsA !== matrixB.length) {
        throw new Error("矩阵 A 的列数必须等于向量的长度");
      }

      // 初始化结果向量
      const result = new Array(rowsA).fill(0);

      // 执行矩阵与向量相乘
      for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsA; j++) {
          result[i] += matrixA[i][j] * (matrixB[j] as number);
        }
      }

      return result;
    }
  }

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
   * @param offset
   * @returns
   */
  static translate(coord: IPoint, offset: IPoint): IPoint {
    if (!offset || !coord) return coord;
    if (offset.x === 0 && offset.y === 0) return coord;
    return {
      x: coord.x + offset.x,
      y: coord.y + offset.y,
    };
  }

  /**
   * 批量平移
   *
   * @param coords
   * @param offset
   * @returns
   */
  static batchTranslate(coords: IPoint[], offset: IPoint): IPoint[] {
    return coords.map(coord => this.translate(coord, offset));
  }

  /**
   * 异步平移
   *
   * @param coord
   * @param offset
   * @returns
   */
  static asyncTranslate(coord: IPoint, offset: IPoint): Promise<IPoint> {
    return new Promise(resolve => {
      const id = `${Date.now()}_${nanoid(4)}`;
      worker.postMessage({ funcName: "translate", args: [coord, offset], id });
      workerCallback.set(id, (data: any) => {
        resolve(data);
      });
    });
  }

  /**
   * 异步批量平移
   *
   * @param coords
   * @param offset
   * @returns
   */
  static asyncBatchTranslate(coords: IPoint[], offset: IPoint): Promise<IPoint[]> {
    return new Promise(resolve => {
      const id = `${Date.now()}_${nanoid(4)}`;
      worker.postMessage({ funcName: "batchTranslate", args: [coords, offset], id });
      workerCallback.set(id, (data: any) => {
        resolve(data);
      });
    });
  }

  /**
   * 批量平移
   *
   * @param coords
   * @param offset
   * @returns
   */
  static asyncNamedBatchTranslate(coords: NamedPoints, offset: IPoint): Promise<NamedPoints> {
    return new Promise(resolve => {
      const id = `${Date.now()}_${nanoid(4)}`;
      worker.postMessage({ funcName: "namedBatchTranslate", args: [coords, offset], id });
      workerCallback.set(id, (data: any) => {
        resolve(data);
      });
    });
  }

  /**
   * 批量组件坐标平移
   *
   * @param coords
   * @param offset
   * @returns
   */
  static asyncMapNamedBatchTranslate(coords: MapNamedPoints, offset: IPoint): Promise<MapNamedPoints> {
    return new Promise(resolve => {
      const id = `${Date.now()}_${nanoid(4)}`;
      worker.postMessage({ funcName: "mapNamedBatchTranslate", args: [coords, offset], id });
      workerCallback.set(id, (data: any) => {
        resolve(data);
      });
    });
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
    if (angle === 0) return coord;
    const rotationMatrix = MathUtils.calcRotateMatrix(angle);
    const rotatedPoint = MathUtils.multiply(rotationMatrix, [coord.x, coord.y, 1]);
    return {
      x: rotatedPoint[0],
      y: rotatedPoint[1],
    };
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
  static calcTransformMatrix(center: IPoint, point: IPoint, originalPoint: IPoint, angles: Partial<AngleModel> = {}): number[][] {
    // 计算移动点在原始坐标系中的位置
    point = MathUtils.transWithCenter(point, angles, center, true);
    // 计算缩放前的点在原始坐标系中的位置
    originalPoint = MathUtils.transWithCenter(originalPoint, angles, center, true);
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
  static rotateWithCenter(point: IPoint, angle: number, center: IPoint): IPoint {
    if (angle === 0 || !center) return point;
    point = {
      x: point.x - center.x,
      y: point.y - center.y,
    };
    const result = MathUtils.rotate(point, angle);
    return {
      x: result.x + center.x,
      y: result.y + center.y,
    };
  }

  /**
   * 旋转一组点
   *
   * @param coords
   * @param angle
   * @param center
   * @returns
   */
  static batchRotateWithCenter(coords: IPoint[], angle: number, center: IPoint): IPoint[] {
    return coords.map(coord => MathUtils.rotateWithCenter(coord, angle, center));
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coord
   * @param leanYAngle
   * @param center
   * @returns
   */
  static leanYWithCenter(coord: IPoint, leanYAngle: number, center: IPoint): IPoint {
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
  static batchLeanYWithCenter(coords: IPoint[], leanYAngle: number, center: IPoint): IPoint[] {
    return coords.map(coord => MathUtils.leanYWithCenter(coord, leanYAngle, center));
  }

  /**
   * 倾斜坐标系上的某一点
   *
   * @param coord
   * @param leanXAngle
   * @param center
   * @returns
   */
  static leanXWithCenter(coord: IPoint, leanXAngle: number, center: IPoint): IPoint {
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
  static batchLeanXWithCenter(coords: IPoint[], leanXAngle: number, center: IPoint): IPoint[] {
    return coords.map(coord => MathUtils.leanXWithCenter(coord, leanXAngle, center));
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
      [Math.cos(theta), -Math.sin(theta), 0],
      [Math.sin(theta), Math.cos(theta), 0],
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
  static leanWithCenter(coord: IPoint, leanXAngle: number, leanYAngle: number, center: IPoint): IPoint {
    if (leanXAngle === 0 && leanYAngle === 0) return coord;
    const matrix = MathUtils.calcLeanMatrix(leanXAngle, leanYAngle);
    const result = MathUtils.multiply(matrix, [coord.x - center.x, coord.y - center.y, 1]);
    return {
      x: result[0] + center.x,
      y: result[1] + center.y,
    };
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
  static batchLeanWithCenter(coords: IPoint[], leanXAngle: number, leanYAngle: number, center: IPoint): IPoint[] {
    return coords.map(coord => MathUtils.leanWithCenter(coord, leanXAngle, leanYAngle, center));
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
  static transWithCenter(coord: IPoint, angles: Partial<AngleModel>, center: IPoint, isReverse?: boolean) {
    let { angle = 0, leanXAngle = 0, leanYAngle = 0 } = angles || {};
    if (angle === 0 && leanXAngle === 0 && leanYAngle === 0) return coord;
    if (isReverse) {
      angle = -angle;
      leanXAngle = -leanXAngle;
      leanYAngle = -leanYAngle;
    }
    let matrix: number[][];
    const leanMatrix = MathUtils.calcLeanMatrix(leanXAngle, leanYAngle);
    const rotateMatrix = MathUtils.calcRotateMatrix(angle);
    if (isReverse) {
      matrix = MathUtils.multiply(leanMatrix, rotateMatrix) as unknown as number[][];
    } else {
      matrix = MathUtils.multiply(rotateMatrix, leanMatrix) as unknown as number[][];
    }
    let result = MathUtils.multiply(matrix, [coord.x - center.x, coord.y - center.y, 1]);
    return {
      x: result[0] + center.x,
      y: result[1] + center.y,
    };
  }

  /**
   * 旋转倾斜坐标系上的某一点
   *
   * @param coords
   * @param angles
   * @param center
   * @returns
   */
  static batchTransWithCenter(coords: IPoint[], angles: Partial<AngleModel>, center: IPoint, isReverse?: boolean) {
    return coords.map(coord => MathUtils.transWithCenter(coord, angles, center, isReverse));
  }

  /**
   * 旋转并平移
   *
   * @param coord
   * @param angle
   * @param value
   * @returns
   */
  static rotateAndTranslate(coord: IPoint, angle: number, value: IPoint): IPoint {
    return MathUtils.translate(MathUtils.rotate(coord, angle), value);
  }

  /**
   * 平移弧线点
   *
   * @param arcPoints
   * @param offset
   * @returns
   */
  static translateArcPoint(arcPoints: ArcPoints, offset: IPoint): ArcPoints {
    let { start, controller, end, corner, value } = arcPoints;
    [start, controller, end, corner] = MathUtils.batchTranslate([start, controller, end, corner], offset);
    return { start, controller, end, corner, value };
  }

  /**
   * 平移弧线点
   *
   * @param arcPoints
   * @param offset
   * @returns
   */
  static translateArcPoints(arcPoints: ArcPoints[], offset: IPoint): ArcPoints[] {
    return arcPoints.map(arc => MathUtils.translateArcPoint(arc, offset));
  }

  /**
   * 批量平移弧线点
   *
   * @param arcPoints
   * @param offsets
   * @returns
   */
  static batchTranslateArcPoints(arcPoints: ArcPoints[][], offset: IPoint): ArcPoints[][] {
    return arcPoints.map((arc, index) => MathUtils.translateArcPoints(arc, offset));
  }

  /**
   * 给出点和直线，返回点相对于直线的对称点
   *
   * @param coord
   * @param lineStart
   * @param lineEnd
   * @returns
   */
  static calcSymmetryPoint(coord: IPoint, lineStart: IPoint, lineEnd: IPoint): IPoint {
    // 计算直线的向量
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    // 计算直线的长度平方
    const lineLengthSquared = dx * dx + dy * dy;

    // 如果直线长度为 0，直接返回原坐标
    if (lineLengthSquared === 0) {
      return { ...coord };
    }

    // 计算从直线起点到待翻转点的向量
    const px = coord.x - lineStart.x;
    const py = coord.y - lineStart.y;

    // 计算点在直线上的投影比例
    const dotProduct = px * dx + py * dy;
    const projectionRatio = dotProduct / lineLengthSquared;

    // 计算投影点的坐标
    const projectionX = lineStart.x + projectionRatio * dx;
    const projectionY = lineStart.y + projectionRatio * dy;

    // 计算对称点的坐标
    const flippedX = 2 * projectionX - coord.x;
    const flippedY = 2 * projectionY - coord.y;

    return { x: flippedX, y: flippedY };
  }

  /**
   * 计算点在矩形中的水平对称点
   *
   * @param point
   * @param rect
   * @returns
   */
  static calcHorizontalSymmetryPointInRect(point: IPoint, rect: Partial<DOMRect>): IPoint {
    const { x, y, width, height } = rect;
    const centerX = (x + x + width) / 2;
    const centerY = (y + y + height) / 2;
    return MathUtils.calcSymmetryPoint(point, { x: centerX, y: centerY }, { x: centerX, y });
  }

  /**
   * 计算点在矩形中的垂直对称点
   *
   * @param point
   * @param rect
   * @returns
   */
  static calcVerticalSymmetryPointInRect(point: IPoint, rect: Partial<DOMRect>): IPoint {
    const { x, y, width, height } = rect;
    const centerX = (x + x + width) / 2;
    const centerY = (y + y + height) / 2;
    return MathUtils.calcSymmetryPoint(point, { x: centerX, y: centerY }, { x, y: centerY });
  }

  /**
   * 给出点数组和直线，返回点数组相对于直线的对称点数组
   *
   * @param coords
   * @param lineStart
   * @param lineEnd
   * @returns
   */
  static batchCalcSymmetryPoints(coords: IPoint[], lineStart: IPoint, lineEnd: IPoint): IPoint[] {
    return coords.map(coord => MathUtils.calcSymmetryPoint(coord, lineStart, lineEnd));
  }

  /**
   * 给出点数组和直线数组，返回点数组相对于直线的多次对称点数组
   *
   * @param coords
   * @param lines
   * @returns
   */
  static batchCalcSymmetryPointsMuch(coords: IPoint[], lines: [lineStart: IPoint, lineEnd: IPoint][]): IPoint[] {
    return coords.map(coord => {
      lines.forEach(line => {
        coord = MathUtils.calcSymmetryPoint(coord, line[0], line[1]);
      });
      return coord;
    });
  }

  /**
   * 缩放
   *
   * @param coord
   * @param value
   * @returns
   */
  static scale(coord: IPoint, value: ScaleValue): IPoint {
    if (value.sx === 1 && value.sy === 1) return coord;
    const scaleMatrix = MathUtils.calcScaleMatrix(value.sx, value.sy);
    const scaledPoint = MathUtils.multiply(scaleMatrix, [coord.x, coord.y, 1]);
    return {
      x: scaledPoint[0],
      y: scaledPoint[1],
    };
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
  static scaleWithCenter(coord: IPoint, value: ScaleValue, center: IPoint): IPoint {
    if (value.sx === 1 && value.sy === 1) return coord;
    coord = {
      x: coord.x - center.x,
      y: coord.y - center.y,
    };
    coord = MathUtils.scale(coord, value);
    return {
      x: coord.x + center.x,
      y: coord.y + center.y,
    };
  }

  /**
   * 批量缩放坐标系上的点集
   *
   * @param coords
   * @param value
   * @param center
   * @returns
   */
  static batchScaleWithCenter(coords: IPoint[], value: ScaleValue, center: IPoint): IPoint[] {
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
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }

      // 特殊情况：点恰好在多边形的边上
      if (yi === py && py === yj && px >= Math.min(xi, xj) && px <= Math.max(xi, xj) && py >= Math.min(yi, yj) && py <= Math.max(yi, yj)) {
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

    return {
      x: centerX,
      y: centerY,
    };
  }

  /**
   * 计算中心点
   *
   * @param points
   * @returns
   */
  static calcCenter(points: IPoint[]): IPoint {
    const box = CommonUtils.getBoxByPoints(points);
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
    const targetX = center.x + distance * Math.cos(angleRad);
    const targetY = center.y + distance * Math.sin(angleRad);
    return {
      x: targetX,
      y: targetY,
    };
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
    return 180 - MathUtils.calcTriangleAngle(boxPoints[0], boxPoints[3], boxPoints[2]);
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
    return MathUtils.calcLeanYAngle(MathUtils.calcInternalAngle(boxPoints), flipX);
  }

  /**
   * 计算不倾斜的点集
   *
   * @param points
   * @param leanXAngle
   * @param leanYAngle
   * @returns
   */
  static calcUnLeanByPoints(points: IPoint[], leanXAngle: number, leanYAngle: number): IPoint[] {
    if (leanXAngle === 0 && leanYAngle === 0) return points;
    const center = MathUtils.calcCenter(points);
    return MathUtils.batchLeanWithCenter(points, -leanXAngle, -leanYAngle, center);
  }

  /**
   * 判断翻转X是否正确
   *
   * @param boxPoints
   * @returns
   */
  static calcFlipXByPoints(boxPoints: IPoint[]): boolean {
    const centerCoord = MathUtils.calcCenter(boxPoints);
    return MathUtils.isPointClockwiseOfLine(centerCoord, boxPoints[0], boxPoints[3]);
  }

  /**
   * 计算实际角度
   *
   * @param points
   * @returns
   */
  static calcViewAngleByPoints(boxPoints: IPoint[]): number {
    const angle = MathUtils.calcAngle(boxPoints[2], boxPoints[1]);
    return MathUtils.constraintAngle(angle + 90);
  }

  /**
   * 计算实际角度
   *
   * @param boxPoints
   * @returns
   */
  static calcActualAngleByPoints(boxPoints: IPoint[]): number {
    const internalAngle = MathUtils.calcInternalAngle(boxPoints);
    const leanYAngle = MathUtils.calcLeanYAngle(internalAngle, MathUtils.calcFlipXByPoints(boxPoints));
    const viewAngle = MathUtils.calcViewAngleByPoints(boxPoints);
    return MathUtils.constraintAngle(viewAngle - leanYAngle);
  }

  /**
   * 角度约束
   *
   * @param angle
   * @returns
   */
  static constraintAngle(angle: number): number {
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
  static calcSegmentLineCenterCrossPoint(p1: IPoint, p2: IPoint, isClockwise: boolean, distance: number): IPoint {
    // 计算中心点
    const center = MathUtils.calcCenter([p1, p2]);
    // 计算角度
    const angle = MathUtils.calcAngle(p1, p2);
    // 计算目标点
    return MathUtils.calcTargetPoint(center, distance, isClockwise ? angle + 90 : angle - 90);
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
    return {
      x: closetX,
      y: closetY,
    };
  }

  /**
   * 计算点到直线的距离
   *
   * @param point
   * @param a
   * @param b
   */
  static calcDistancePointToLine(p: IPoint, a: IPoint, b: IPoint): number {
    const { x: closetX, y: closetY } = MathUtils.calcProjectionOnSegment(p, a, b);
    return Math.sqrt((p.x - closetX) * (p.x - closetX) + (p.y - closetY) * (p.y - closetY));
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
   * 计算点在给定的线段上的限制点
   *
   * @param p
   * @param a
   * @param b
   * @returns
   */
  static calcLimitPointOnSegment(p: IPoint, a: IPoint, b: IPoint): IPoint {
    const t = MathUtils.calcSegmentProportion(p, a, b);
    if (t < 0) {
      return a;
    } else if (t > 1) {
      return b;
    }
  }

  /**
   * 计算点在给定的线段上的内限点
   *
   * @param p
   * @param a
   * @param b
   * @param value
   * @returns
   */
  static calcInnerLimitPointOnSegment(p: IPoint, a: IPoint, b: IPoint, value: number): IPoint {
    const t = MathUtils.calcSegmentProportion(p, a, b);
    if (t < 0) {
      const angle = MathUtils.calcAngle(a, b);
      return MathUtils.calcTargetPoint(a, value, angle);
    } else if (t > 1) {
      const angle = MathUtils.calcAngle(b, a);
      return MathUtils.calcTargetPoint(b, value, angle);
    }
    return p;
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
   * 判断点是否在给定的点附近位置上
   *
   * @param point
   * @param target
   * @param distance
   * @returns
   */
  static isPointClosest(point: IPoint, target: IPoint, distance: number): boolean {
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
  static isPointClosestWhichPoint(point: IPoint, points: IPoint[], distance: number): number {
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
  static batchPrecisePoints(points: IPoint[], digits: number = 1): IPoint[] {
    return points.map(point => MathUtils.precisePoint(point, digits));
  }

  /**
   * 给定三角形的三个坐标点a,b,c计算b的夹角
   *
   * @param a
   * @param b
   * @param c
   * @returns
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
      // 是返回0好呢还是返回180呢
      angleDegrees = 0;
    }
    return angleDegrees;
  }

  /**
   * 给定三角形的三个坐标点a,b,c,按顺时针方向计算b的内测夹角
   *
   * @param a
   * @param b
   * @param c
   * @returns
   */
  static calcTriangleAngleWithClockwise(a: IPoint, b: IPoint, c: IPoint): number {
    const angle = MathUtils.calcTriangleAngle(a, b, c);
    const isClockwise = MathUtils.isPointClockwiseOfLine(b, a, c);
    if (!isClockwise) {
      return 180 - angle;
    }
    return angle;
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
    const angle = Math.acos((Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)) / (Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2)));
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
    const angle = Math.acos((Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2)) / (Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)));
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
  static sortPointsClockwise(vertices: IPoint[]) {
    // 计算质心
    let center = MathUtils.calcCenter(vertices);
    return MathUtils.sortPointsClockwiseByCenter(vertices, center);
  }

  /**
   * 给定顶点数组和质心，将顶点数组按照顺时针方向排序
   *
   * @param vertices
   * @param center
   * @returns
   */
  static sortPointsClockwiseByCenter(vertices: IPoint[], center: IPoint): IPoint[] {
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
  static calcPointToSegmentCenterAngle(point: IPoint, segmentStart: IPoint, segmentEnd: IPoint): number {
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
    return value >= 0 ? Math.abs(referValue) : -Math.abs(referValue);
  }

  /**
   * 判断点在直线的哪一侧
   *
   * 给定点在起点到结束点的右侧，则返回true，否则返回false
   *
   * @param point
   * @param lineStart
   * @param lineEnd
   */
  static isPointClockwiseOfLine(point: IPoint, lineStart: IPoint, lineEnd: IPoint): boolean {
    const crossProduct = (point.x - lineStart.x) * (lineEnd.y - lineStart.y) - (point.y - lineStart.y) * (lineEnd.x - lineStart.x);
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

    // 计算每个顶点的角平分线参数方程
    const bisectors = MathUtils.calcBisectors(vertices);
    const { width, height } = MathUtils.calcParallelogramVerticalSize(vertices);

    // 计算相邻顶点的角平分线交点
    const intersections: IPoint[] = [];

    if (width < height) {
      intersections.push(MathUtils.calcIntersectionOfLines(bisectors[0], bisectors[1]));
      intersections.push(MathUtils.calcIntersectionOfLines(bisectors[2], bisectors[3]));
    } else {
      intersections.push(MathUtils.calcIntersectionOfLines(bisectors[0], bisectors[3]));
      intersections.push(MathUtils.calcIntersectionOfLines(bisectors[1], bisectors[2]));
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
  static calcIntersectionOfLines(line1: DirectionLine, line2: DirectionLine): IPoint | null {
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
   *
   * 需要使用时，需按照一下所以进行坐标获取
   *
   * [3, 0],[0, 1],[1, 2],[2, 3]
   *
   * @param point
   * @param vertices
   * @returns
   */
  static calcCrossPointsOfParallelLines(point: IPoint, vertices: IPoint[]): IPoint[] {
    const [A, B, C, D] = vertices;
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const BC = { x: C.x - B.x, y: C.y - B.y };
    const CD = { x: D.x - C.x, y: D.y - C.y };
    const DA = { x: A.x - D.x, y: A.y - D.y };
    const BA = { x: A.x - B.x, y: A.y - B.y };

    const p_ab = MathUtils.calcIntersectionOfLines({ point: A, direction: AB }, { point: point, direction: DA });
    const p_bc = MathUtils.calcIntersectionOfLines({ point: B, direction: BC }, { point: point, direction: AB });
    const p_cd = MathUtils.calcIntersectionOfLines({ point: C, direction: CD }, { point: point, direction: BC });
    const p_da = MathUtils.calcIntersectionOfLines({ point: D, direction: DA }, { point: point, direction: BA });

    return [p_ab, p_bc, p_cd, p_da];
  }

  /**
   * 给定三个坐标，计算三角形的面积
   *
   * @param a
   * @param b
   * @param c
   * @returns
   */
  static calcTriangleArea(a: IPoint, b: IPoint, c: IPoint): number {
    const side1 = MathUtils.calcDistance(a, b);
    const side2 = MathUtils.calcDistance(b, c);
    const side3 = MathUtils.calcDistance(c, a);
    const s = (side1 + side2 + side3) / 2;
    return Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));
  }

  /**
   * 给定平行四边形及其内部的一点，计算点到四个边的垂直相交点
   *
   * @param point 点
   * @param vertices 平行四边形的四个顶点
   * @param smooth 是否平滑处理
   * @returns 垂直相交点数组
   */
  static calcParallelogramVerticalIntersectionPoints(point: IPoint, vertices: IPoint[], smooth?: boolean): IPoint[] {
    const [A, B, C, D] = vertices;
    let p1 = MathUtils.calcProjectionOnSegment(point, D, A);
    let p2 = MathUtils.calcProjectionOnSegment(point, A, B);
    let p3 = MathUtils.calcProjectionOnSegment(point, B, C);
    let p4 = MathUtils.calcProjectionOnSegment(point, C, D);

    if (smooth) {
      if (!MathUtils.isProjectionOnSegment(p1, D, A)) {
        p1 = MathUtils.calcInnerLimitPointOnSegment(p1, D, A, 0.01);
      }
      if (!MathUtils.isProjectionOnSegment(p2, A, B)) {
        p2 = MathUtils.calcInnerLimitPointOnSegment(p2, A, B, 0.01);
      }
      if (!MathUtils.isProjectionOnSegment(p3, B, C)) {
        p3 = MathUtils.calcInnerLimitPointOnSegment(p3, B, C, 0.01);
      }
      if (!MathUtils.isProjectionOnSegment(p4, C, D)) {
        p4 = MathUtils.calcInnerLimitPointOnSegment(p4, C, D, 0.01);
      }
    }

    return [p1, p2, p3, p4];
  }

  /**
   * 计算平行四边形内部的垂直尺寸
   *
   * @param vertices 平行四边形的四个顶点坐标
   * @returns 返回平行四边形的垂直宽度和高度
   */
  static calcParallelogramVerticalSize(vertices: IPoint[]): ISize {
    const [A, B, C, D] = vertices;
    const width = MathUtils.calcDistancePointToLine(A, B, C);
    const height = MathUtils.calcDistancePointToLine(A, C, D);
    return { width, height };
  }

  /**
   * 计算点相对直线的镜像坐标
   */
  static calcMirrorPointToLine(point: IPoint, start: IPoint, end: IPoint): IPoint {
    // 射影坐标
    const projection = MathUtils.calcProjectionOnSegment(point, start, end);
    const distance = MathUtils.calcDistance(point, projection);
    const angle = MathUtils.calcAngle(start, end);
    return MathUtils.calcTargetPoint(projection, distance * 2, angle);
  }

  /**
   * 计算点相对于中心点的坐标
   * @param point
   * @param center
   * @returns
   */
  static calcRelativePointWithCenter(point: IPoint, center: IPoint): IPoint {
    return {
      x: point.x - center.x,
      y: point.y - center.y,
    };
  }

  /**
   * 批量计算点相对于中心点的坐标
   * @param points
   * @param center
   * @returns
   */
  static batchCalcRelativePointWithCenter(points: IPoint[], center: IPoint): IPoint[] {
    return points.map(point => MathUtils.calcRelativePointWithCenter(point, center));
  }

  /**
   * 计算全局坐标
   *
   * @param point
   * @param center
   * @returns
   */
  static calcAbsolutePointWithCenter(point: IPoint, center: IPoint): IPoint {
    return {
      x: point.x + center.x,
      y: point.y + center.y,
    };
  }

  /**
   * 批量计算全局坐标
   * @param points
   * @param center
   * @returns
   */
  static batchCalcAbsolutePointWithCenter(points: IPoint[], center: IPoint): IPoint[] {
    return points.map(point => MathUtils.calcAbsolutePointWithCenter(point, center));
  }

  /**
   * 给定一条直线，求过点start的平行线

   * @param line
   * @param start
   * @returns
   */
  static calcParrelLine(line: ILine, start: IPoint): ILine {
    const angle = MathUtils.calcAngle(line.start, line.end);
    const end = MathUtils.calcTargetPoint(start, MathUtils.calcDistance(line.start, line.end), angle);
    return { start, end };
  }

  /**
   * 计算两个向量之间的夹角
   * 
   * @param xVector 
   * @param yVector 
   * @returns 
   */
  static calcVectorAngle(xVector: IPoint, yVector: IPoint): number {
    // 计算向量的模（长度）
    const xVectorLength = Math.sqrt(xVector.x * xVector.x + xVector.y * xVector.y);
    const yVectorLength = Math.sqrt(yVector.x * yVector.x + yVector.y * yVector.y);

    // 归一化向量（转换为单位向量）
    const xVectorNormalized = {
      x: xVector.x / xVectorLength,
      y: xVector.y / xVectorLength,
    };
    // 计算两个向量之间的夹角（弧度）
    const dotProduct = xVectorNormalized.x * (yVector.x / yVectorLength) + xVectorNormalized.y * (yVector.y / yVectorLength);
    return Math.acos(dotProduct);
  }

  /**
   * 计算包含所有点的最小平行四边形
   * @param points 点集合
   * @param xVector 第一个方向向量（平行四边形的一条边方向）
   * @param yVector 第二个方向向量（平行四边形的另一条边方向）
   * @returns 平行四边形的四个顶点坐标，顺序为 [A, B, C, D]
   */
  static calcMinParallelogramByPoints(points: IPoint[], xVector: IPoint, yVector: IPoint): IPoint[] {
    if (points.length === 0) {
      return [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ];
    }

    // 计算向量的模（长度）
    const xVectorLength = Math.sqrt(xVector.x * xVector.x + xVector.y * xVector.y);
    const yVectorLength = Math.sqrt(yVector.x * yVector.x + yVector.y * yVector.y);

    // 归一化向量（转换为单位向量）
    const xVectorNormalized = {
      x: xVector.x / xVectorLength,
      y: xVector.y / xVectorLength,
    };
    const yVectorNormalized = {
      x: yVector.x / yVectorLength,
      y: yVector.y / yVectorLength,
    };
    return MathUtils.calculateParallelogram(points, xVectorNormalized, yVectorNormalized);
  }

  /**
   * 计算平行四边形
   * 
   * 注意：
   * 1. 不能使用简单的点积来计算投影，而是解线性方程组来找到点在非正交基下的准确分量(u, v)
   * 2. 添加行列式计算来检测基向量是否共线（如果共线则无法形成平行四边形）
   * 3. 使用克莱姆法则解方程组，得到点在基向量方向上的准确分量
   *
   * @param points
   * @param xVector
   * @param yVector
   * @returns
   */
  static calculateParallelogram(points: IPoint[], xVector: IPoint, yVector: IPoint): IPoint[] {
    // 初始化投影值的极值
    let uMin = Infinity;
    let uMax = -Infinity;
    let vMin = Infinity;
    let vMax = -Infinity;

    // 计算行列式（用于解方程组）
    const det = xVector.x * yVector.y - xVector.y * yVector.x;
    
    // 如果向量共线，返回空数组或处理错误
    if (Math.abs(det) < 1e-10) {
        return [];
    }

    // 计算每个点在两个向量方向上的投影
    for (const point of points) {
      // ↓-------------错误的向量计算---------------↓
      // 计算点在xVector方向上的投影u
      // const u = point.x * xVector.x + point.y * xVector.y;
      // // 计算点在yVector方向上的投影v
      // const v = point.x * yVector.x + point.y * yVector.y;
      // ↑-------------错误的向量计算---------------↑
      // 使用克莱姆法则解方程组，得到点在基向量方向上的准确分量
      const u = (point.x * yVector.y - point.y * yVector.x) / det;
      const v = (xVector.x * point.y - xVector.y * point.x) / det;

      // 更新极值
      uMin = Math.min(uMin, u);
      uMax = Math.max(uMax, u);
      vMin = Math.min(vMin, v);
      vMax = Math.max(vMax, v);
    }

    // 计算平行四边形的四个顶点
    const A = {
      x: uMin * xVector.x + vMin * yVector.x,
      y: uMin * xVector.y + vMin * yVector.y,
    };
    const B = {
      x: uMax * xVector.x + vMin * yVector.x,
      y: uMax * xVector.y + vMin * yVector.y,
    };
    const C = {
      x: uMax * xVector.x + vMax * yVector.x,
      y: uMax * xVector.y + vMax * yVector.y,
    };
    const D = {
      x: uMin * xVector.x + vMax * yVector.x,
      y: uMin * xVector.y + vMax * yVector.y,
    };

    return [A, B, C, D];
  }

  /**
   * 计算包含所有点的最小平行四边形（给定中心点参照）
   * @param points
   * @param xVector
   * @param yVector
   * @param center
   * @returns
   */
  static calcMinParallelogramByPointsByCenter(points: IPoint[], xVector: IPoint, yVector: IPoint, center: IPoint): IPoint[] {
    points = MathUtils.batchCalcRelativePointWithCenter(points, center);
    xVector = MathUtils.calcRelativePointWithCenter(xVector, center);
    yVector = MathUtils.calcRelativePointWithCenter(yVector, center);
    const result = this.calcMinParallelogramByPoints(points, xVector, yVector);
    return MathUtils.batchCalcAbsolutePointWithCenter(result, center);
  }
}
