import { IPoint, ISize } from "@/types";
import { nanoid } from "nanoid";
import MathUtils from "@/utils/MathUtils";

export default class CommonUtils {

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
   * 获取随机id, 以时间戳加随机字符串组合
   * 
   * @returns 
   */
  static getRandomDateId() {
    return `${+ new Date()}_${nanoid(8)}`
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
}