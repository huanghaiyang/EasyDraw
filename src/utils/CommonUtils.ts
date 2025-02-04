import { IPoint, ISize } from "@/types";
import { nanoid } from "nanoid";
import MathUtils from "@/utils/MathUtils";
import { isNumber } from "lodash";

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
   * @param isRectangle 是否是矩形
   */
  static getLBRPoints(points: IPoint[], isRectangle?: boolean): IPoint[] {
    let [left, bottom, right] = CommonUtils.getLBRPointIndexes(points, isRectangle);
    if (left === bottom) {
      left = CommonUtils.getPrevIndexOfArray(points.length, left);
    }
    if (bottom === right) {
      right = CommonUtils.getNextIndexOfArray(points.length, right);
    }
    return [points[left], points[bottom], points[right]];
  }

  /**
   * 给定一个多边形，取最左侧，最下侧，最右侧三个点的索引
   * 
   * @param points 
   * @param isRectangle
   * @returns 
   */
  static getLBRPointIndexes(points: IPoint[], isRectangle?: boolean): number[] {
    let left, bottom, right;
    isRectangle = isRectangle ?? false;
    points.forEach((point, index) => {
      if (!isRectangle) {
        if (left === undefined || point.x < points[left].x) {
          left = index;
        }
        if (right === undefined || point.x > points[right].x) {
          right = index;
        }
      }
      if (bottom === undefined || point.y > points[bottom].y) {
        bottom = index;
      }
    });
    if (isRectangle) {
      left = CommonUtils.getPrevIndexOfArray(points.length, bottom);
      right = CommonUtils.getNextIndexOfArray(points.length, bottom);
    }
    return [left, bottom, right];
  }

  /**
   * 给定中心点，宽高和角度，返回矩形的四个顶点
   * 
   * @param center 
   * @param size 
   * @param options 
   * @returns 
   */
  static get4BoxPoints(center: IPoint, size: ISize, options?: { angle?: number, leanYAngle?: number }): IPoint[] {
    const { angle = 0, leanYAngle = 0 } = options || {};
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
      Object.assign(point, MathUtils.leanYRelativeCenter(point, leanYAngle, center));
      Object.assign(point, MathUtils.rotateRelativeCenter(point, angle, center));
      // Object.assign(point, MathUtils.transformRelativeCenter(point, { angle, leanYAngle }, center));
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
    const width = MathUtils.preciseToFixed(MathUtils.calcDistance(coords[0], coords[1]));
    const height = MathUtils.preciseToFixed(MathUtils.calcDistance(coords[0], coords[3]));
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
    if (scale === 1) return points;
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
  static calcRectangleSizeInRect(width: number, height: number, stageRect: Partial<DOMRect>, padding: number = 0): ISize {
    const innerWidth = stageRect.width - padding * 2;
    const innerHeight = stageRect.height - padding * 2;
    if (width > innerWidth || height > innerHeight) {
      const ratio = MathUtils.preciseToFixed(width / height, 2);
      const rectRatio = MathUtils.preciseToFixed(stageRect.width / stageRect.height, 2);
      if (ratio > rectRatio) {
        width = innerWidth;
        height = MathUtils.preciseToFixed(width / ratio, 2);
      } else {
        height = innerHeight;
        width = MathUtils.preciseToFixed(height * ratio, 2);
      }
    }
    return {
      width,
      height
    }
  }

  /**
   * 计算矩形中心点在矩形内部的四个顶点
   * 
   * @param innerRect 
   * @param outerRect 
   * @returns 
   */
  static calcCenterInnerRectPoints(innerRect: ISize, outerRect: ISize): IPoint[] {
    const { width, height } = innerRect;
    const { width: outerWidth, height: outerHeight } = outerRect;
    return [
      {
        x: MathUtils.preciseToFixed(outerWidth / 2 - width / 2),
        y: MathUtils.preciseToFixed(outerHeight / 2 - height / 2),
      },
      {
        x: MathUtils.preciseToFixed(outerWidth / 2 + width / 2),
        y: MathUtils.preciseToFixed(outerHeight / 2 - height / 2),
      },
      {
        x: MathUtils.preciseToFixed(outerWidth / 2 + width / 2),
        y: MathUtils.preciseToFixed(outerHeight / 2 + height / 2),
      },
      {
        x: MathUtils.preciseToFixed(outerWidth / 2 - width / 2),
        y: MathUtils.preciseToFixed(outerHeight / 2 + height / 2),
      },
    ]
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
    ['x', 'y', 'width', 'height', 'left', 'top', 'right', 'bottom'].forEach(key => {
      const value = rect[key as keyof Partial<DOMRect>];
      if (isNumber(value)) {
        result[key] = MathUtils.preciseToFixed(value * scale);
      }
    });
    return result;
  }

  /**
   * 按纵坐标排序
   * 
   * @param points 
   * @returns 
   */
  static sortPointsByY(points: IPoint[]) {
    return points.sort((a, b) => a.y - b.y);
  }

  /**
   * 按横坐标排序
   * 
   * @param points 
   * @returns 
   */
  static sortPointsByX(points: IPoint[]) {
    return points.sort((a, b) => a.x - b.x);
  }

}