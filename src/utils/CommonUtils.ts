import { IPoint, ISize } from "@/types";
import { nanoid } from "nanoid";
import MathUtils from "@/utils/MathUtils";

export default class CommonUtils {

  /**
   * 计算点的最小X坐标
   * 
   * @param points 
   * @returns 
   */
  static getMinX(points: IPoint[]): number {
    return Math.min(...points.map(point => point.x));
  }

  /**
   * 计算点的最小Y坐标
   * 
   * @param points 
   * @returns 
   */
  static getMinY(points: IPoint[]): number {
    return Math.min(...points.map(point => point.y));
  }

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
   * 给定点集，返回盒模型
   * 
   * @param points 
   * @returns 
   */
  static getRect(points: IPoint[]): Partial<DOMRect> {
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
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
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
   * 生成一个随机的id
   * 
   * @returns 
   */
  static getRandomId() {
    return nanoid(8)
  }

  /**
   * 获取事件触发时相对于给定盒模型的坐标
   * 
   * @param e 
   * @param rect 
   * @returns 
   */
  static getEventPosition(e: MouseEvent, rect: DOMRect, scale?: number): IPoint {
    scale = scale || 1;
    return {
      x: (e.clientX - rect.x) / scale,
      y: (e.clientY - rect.y) / scale
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

  /**
   * 给定一个多边形，取最左侧，最下侧，最右侧三个点
   * 
   * @param points 
   */
  static getLBRPoints(points: IPoint[]): IPoint[] {
    let leftIndex, bottomIndex, rightIndex;
    points.forEach((point, index) => {
      if (leftIndex === undefined || point.x < points[leftIndex].x) {
        leftIndex = index;
      }
      if (bottomIndex === undefined || point.y > points[bottomIndex].y) {
        bottomIndex = index;
      }
      if (rightIndex === undefined || point.x > points[rightIndex].x) {
        rightIndex = index;
      }
    });
    return [points[leftIndex], points[bottomIndex], points[rightIndex]];
  }

  /**
   * 给定中心点，宽高和角度，返回矩形的四个顶点
   * 
   * @param center 
   * @param size 
   * @param param2 
   * @returns 
   */
  static get4BoxPoints(center: IPoint, size: ISize, { angle: number } = { angle: 0 }): IPoint[] {
    const points = [
      {
        x: center.x - size.width / 2,
        y: center.y - size.height / 2,
      },
      {
        x: center.x + size.width / 2,
        y: center.y - size.height / 2,
      },
      {
        x: center.x + size.width / 2,
        y: center.y + size.height / 2,
      },
      {
        x: center.x - size.width / 2,
        y: center.y + size.height / 2,
      },
    ];
    points.forEach((point) => {
      Object.assign(point, MathUtils.rotateRelativeCentroid(point, number, center));
    });
    return points;
  }
  /**
   * 获取数组中前一个索引
   * 
   * @param length 
   * @param index 
   * @returns 
   */
  static getPrevIndexOfArray(length: number, index: number, step: number = 1): number {
    let result;
    while (true) {
      result = index - step;
      if (result < 0) {
        result = length + result;
      }
      if (result >= 0) {
        break;
      }
    }
    return result;
  }

  /**
   * 获取数组中前一个元素
   * 
   * @param array 
   * @param index 
   * @param step 
   * @returns 
   */
  static getPrevOfArray(array: any[], index: number, step: number = 1) {
    return array[CommonUtils.getPrevIndexOfArray(array.length, index, step)];
  }

  /**
   * 获取数组中后一个索引
   * 
   * @param length 
   * @param index 
   * @returns 
   */
  static getNextIndexOfArray(length: number, index: number, step: number = 1): number {
    let result;
    while (true) {
      result = index + step;
      if (result >= length) {
        result = result - length;
      }
      if (result < length) {
        break;
      }
    }
    return result;
  }
  /**
   * 获取数组中后一个元素
   * 
   * @param array 
   * @param index 
   * @returns 
   */
  static getNextOfArray(array: any[], index: number, step: number = 1) {
    return array[CommonUtils.getNextIndexOfArray(array.length, index, step)];
  }

  /**
   * 计算矩形尺寸
   * 
   * @param coords 
   * @returns 
   */
  static calcRectangleSize(coords: IPoint[]): ISize {
    const width = MathUtils.preciseToFixed(Math.abs(coords[0].x - coords[1].x));
    const height = MathUtils.preciseToFixed(Math.abs(coords[0].y - coords[3].y));
    return { width, height };
  }

  /**
   * 计算直线尺寸
   * 
   * @param coords 
   * @returns 
   */
  static calcLineSize(coords: IPoint[]): ISize {
    const width = MathUtils.preciseToFixed(Math.abs(coords[0].x - coords[1].x));
    const height = MathUtils.preciseToFixed(Math.abs(coords[0].y - coords[1].y));
    return { width, height };
  }

  /**
   * 缩放点
   * 
   * @param point 
   * @param scale 
   * @returns 
   */
  static scalePoint(point: IPoint, scale: number) {
    return {
      x: point.x * scale,
      y: point.y * scale
    }
  }

  /**
   * 缩放点数组
   * 
   * @param points 
   * @param scale 
   * @returns 
   */
  static scalePoints(points: IPoint[], scale: number) {
    return points.map(point => CommonUtils.scalePoint(point, scale))
  }

  /**
   * 将源矩形缩放至目标矩形内部计算缩放比例
   * 
   * @param targetRect 
   * @param sourceRect 
   * @param padding 
   * @returns 
   */
  static calcScale(targetRect: DOMRect | ISize, sourceRect: DOMRect | ISize, padding: number = 0): number {
    const widthScale = (targetRect.width - padding * 2) / sourceRect.width;
    const heightScale = (targetRect.height - padding * 2) / sourceRect.height;
    return Math.min(widthScale, heightScale);
  }

  /**
   * 给定矩形的宽度和高度，将矩形放置到舞台中央且不能超出舞台，计算坐标
   * 
   * @param width 
   * @param height 
   * @param stageRect 
   */
  static calcRectanglePointsInRect(width: number, height: number, stageRect: DOMRect, padding: number = 0): IPoint[] {
    if (width > stageRect.width + padding * 2 || height > stageRect.height + padding * 2) {
      const ratio = MathUtils.preciseToFixed(width / height, 2);
      const rectRatio = MathUtils.preciseToFixed(stageRect.width / stageRect.height, 2);
      if (ratio > rectRatio) {
        width = stageRect.width - padding * 2;
        height = MathUtils.preciseToFixed(width / ratio, 2);
      } else {
        height = stageRect.height - padding * 2;
        width = MathUtils.preciseToFixed(height * ratio, 2);
      }
    }
    const left = MathUtils.preciseToFixed(stageRect.width / 2 - width / 2, 2);
    const top = MathUtils.preciseToFixed(stageRect.height / 2 - height / 2, 2);
    return [
      { x: left, y: top },
      { x: left + width, y: top },
      { x: left + width, y: top + height },
      { x: left, y: top + height },
    ];
  }

  /**
   * 缩放盒模型
   * 
   * @param rect 
   * @param scale 
   * @returns 
   */
  static scaleRect(rect: Partial<DOMRect>, scale: number): Partial<DOMRect> {
    const result: Partial<DOMRect> = {};
    for (const key in rect) {
      if (Object.prototype.hasOwnProperty.call(rect, key)) {
        const value = rect[key];
        if (typeof value === 'number') {
          result[key] = MathUtils.preciseToFixed(value * scale, 2);
        }
      }
    }
    return result;
  }
}