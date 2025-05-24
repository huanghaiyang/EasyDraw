import { IPoint, IRect, ISize } from "@/types";
import { nanoid } from "nanoid";
import MathUtils from "@/utils/MathUtils";
import { isNumber } from "lodash";
import { AngleModel } from "@/types/IElement";

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
  static getBoxByPoints(points: IPoint[]): IPoint[] {
    let minX = Number.MAX_SAFE_INTEGER,
      minY = Number.MAX_SAFE_INTEGER,
      maxX = Number.MIN_SAFE_INTEGER,
      maxY = Number.MIN_SAFE_INTEGER;

    points.forEach(point => {
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

    points.forEach(point => {
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
   * 生成一个随机的id
   *
   * @returns
   */
  static getRandomId() {
    return `${nanoid(8)}-${nanoid(4)}`;
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
      y: (e.clientY - rect.y) / scale,
    };
  }

  /**
   * 给定中心点及所属的和模型，返回盒模型四个顶点
   *
   * @param center
   * @param rect
   * @returns
   */
  static getBoxByCenter(center: IPoint, rect: ISize | DOMRect, angles?: Partial<AngleModel>): IPoint[] {
    const { width, height } = rect;
    const hWidth = width / 2;
    const hHeight = height / 2;
    const { x, y } = center;
    const result = [
      {
        x: x - hWidth,
        y: y - hHeight,
      },
      {
        x: x + hWidth,
        y: y - hHeight,
      },
      {
        x: x + hWidth,
        y: y + hHeight,
      },
      {
        x: x - hWidth,
        y: y + hHeight,
      },
    ];
    if (angles) {
      result.forEach(point => {
        Object.assign(point, MathUtils.transWithCenter(point, angles, center));
      });
    }
    return result;
  }

  /**
   * 给定左上角坐标及所属的和模型，返回盒模型四个顶点
   *
   * @param point
   * @param rect
   * @returns
   */
  static getBoxByLeftTop(point: IPoint, rect: ISize | DOMRect): IPoint[] {
    const { width, height } = rect;
    const { x, y } = point;
    return [
      {
        x,
        y,
      },
      {
        x: x + width,
        y,
      },
      {
        x: x + width,
        y: y + height,
      },
      {
        x,
        y: y + height,
      },
    ];
  }

  /**
   * 返回rect的四个顶点
   *
   * @param size
   * @returns
   */
  static getRectBySize(size: ISize): IPoint[] {
    const { width, height } = size;
    return [
      {
        x: 0,
        y: 0,
      },
      {
        x: width,
        y: 0,
      },
      {
        x: width,
        y: height,
      },
      {
        x: 0,
        y: height,
      },
    ];
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
   * 获取数组中前一个组件
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
   * 获取数组中后一个组件
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
    const width = MathUtils.precise(MathUtils.calcDistance(coords[0], coords[1]));
    const height = MathUtils.precise(MathUtils.calcDistance(coords[0], coords[3]));
    return { width, height };
  }

  /**
   * 计算直线尺寸
   *
   * @param coords
   * @returns
   */
  static calcLineSize(coords: IPoint[]): ISize {
    const width = MathUtils.precise(Math.abs(coords[0].x - coords[1].x));
    const height = MathUtils.precise(Math.abs(coords[0].y - coords[1].y));
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
    if (!point) return point;
    return {
      x: point.x * scale,
      y: point.y * scale,
    };
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
    return points.map(point => CommonUtils.scalePoint(point, scale));
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
      const ratio = MathUtils.precise(width / height, 1);
      const rectRatio = MathUtils.precise(stageRect.width / stageRect.height, 2);
      if (ratio > rectRatio) {
        width = innerWidth;
        height = MathUtils.precise(width / ratio, 1);
      } else {
        height = innerHeight;
        width = MathUtils.precise(height * ratio, 1);
      }
    }
    return {
      width,
      height,
    };
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
        x: outerWidth / 2 - width / 2,
        y: outerHeight / 2 - height / 2,
      },
      {
        x: outerWidth / 2 + width / 2,
        y: outerHeight / 2 - height / 2,
      },
      {
        x: outerWidth / 2 + width / 2,
        y: outerHeight / 2 + height / 2,
      },
      {
        x: outerWidth / 2 - width / 2,
        y: outerHeight / 2 + height / 2,
      },
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
    ["x", "y", "width", "height", "left", "top", "right", "bottom"].forEach(key => {
      const value = rect[key as keyof Partial<DOMRect>];
      if (isNumber(value)) {
        result[key] = MathUtils.precise(value * scale);
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

  /**
   * 计算矩形倾斜后的rect
   *
   * @param rotateBoxPoints
   * @param center
   */
  static calcRenderRect(rotateBoxPoints: IPoint[], center: IPoint): Partial<DOMRect> {
    // 计算倾斜后的图片的宽度
    const width = MathUtils.calcDistance(rotateBoxPoints[0], rotateBoxPoints[1]);
    // 计算倾斜后的图片的高度
    const height = MathUtils.calcDistancePointToLine(rotateBoxPoints[0], rotateBoxPoints[2], rotateBoxPoints[3]);
    // 计算绘制后的图片的rect
    const rect = {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    };
    return rect;
  }

  /**
   * 判断点是否在矩形内
   *
   * @param rect
   * @param point
   * @returns
   */
  static isPointInRect(rect: Partial<DOMRect>, point: IPoint): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  /**
   * 将给定的rect转换为以rect中心点为原点的rect
   *
   * @param rect
   * @returns
   */
  static centerRectConversion(rect: Partial<DOMRect>): Partial<DOMRect> {
    const { width, height } = rect;
    return {
      x: -width / 2,
      y: -height / 2,
      width,
      height,
    };
  }

  /**
   * 二维平铺算法, 确保矩形在二维空间均匀分布
   * 
   * 1. 每行的高度不需要相同
   * 2. 每行的个数不需要相同
   * 3. 第一行在中间，第二行在第一行的上方，第三行在第一行的下方，呈上下上下的方式进行布局
   * 4. 每行按照左对齐的方式进行布局
   * 5. 每行的矩形之间的间距为margin
   * 
   * @param rectangles 矩形数组
   * @param center 中心点
   * @param margin 矩形之间的间距
   * @returns 矩形数组
   */
  static packRectangles(rectangles: ISize[], center: IPoint, margin: number = 0): IRect[] {
    if (rectangles.length === 0) return [];
    // 利用np加减枝算法，计算第一行的最大宽度
    let rowSize = Math.ceil(Math.sqrt(rectangles.length));
    if (rowSize >= 1) {
      rowSize--;
    }
    let rowWidth = 0;
    while (true) {
      rowSize++;
      rowWidth = rectangles.slice(0, rowSize).reduce((prev, curr) => prev + curr.width, 0) + (rowSize - 1) * margin;
      if (rowSize === rectangles.length) {
        break;
      }
      const widths: number[] = [];
      for (let i = 0; i < rectangles.length; i += rowSize) {
        const width = rectangles.slice(i, i + rowSize).reduce((prev, curr) => prev + curr.width, 0) + (rowSize - 1) * margin;
        widths.push(width);
        i += rowSize;
      }
      let gtCounter = 0;
      for (let i = 0; i < widths.length; i++) {
        if (widths[i] <= rowWidth) {
          gtCounter++;
        }
      }
      if (gtCounter >= Math.ceil(widths.length / 2)) {
        break;
      }
    }
    const result: IRect[][] = [];
    let totalHeight = 0;
    let currentRowWidth = 0;
    let currentRowHeight = 0;
    // 计算第一行的矩形
    const x = center.x - rowWidth / 2;
    const y = center.y - rectangles[0].height / 2;
    let row: IRect[] = [];
    for (let i = 0; i < rowSize; i++) {
      const { width, height } = rectangles[i];
      row.push({
        x: x + currentRowWidth + (currentRowWidth === 0 ? 0: margin) + width / 2,
        y: y + height / 2,
        width,
        height,
      });
      if (height > currentRowHeight) {
        currentRowHeight = height;
      }
      currentRowWidth += width + (currentRowWidth === 0? 0: margin);
    }
    result.push(row);

    if (rowSize < rectangles.length) {
      totalHeight += currentRowHeight;
      currentRowWidth = 0;
      currentRowHeight = 0;
      row = [];
      let currentRowSize = 0;
      let currentRowDirection = 1; // 1: 向上, -1: 向下
      let lastY = y + totalHeight;
      let lastUpperRowIndex: number = -1;

      // 重置当前行的状态
      function reset(): void {
        currentRowDirection = -currentRowDirection;
        totalHeight += currentRowHeight + margin;
        currentRowWidth = 0;
        currentRowHeight = 0;
        currentRowSize = 0;
        row = [];
      }

      // 计算其他行的矩形,以第一行的第一个矩形为基准，左对齐
      for (let i = rowSize; i < rectangles.length; i++) {
        const { width, height } = rectangles[i];
        row.push({
          x: x + currentRowWidth + (currentRowWidth === 0 ? 0: margin) + width / 2,
          y: 0,
          width,
          height,
        });
        if (height > currentRowHeight) {
          currentRowHeight = height;
        }
        currentRowSize++;
        currentRowWidth += width + (currentRowWidth === 0? 0: margin);
        if (i < rectangles.length - 1 && currentRowWidth + rectangles[i + 1].width + margin > rowWidth || i === rectangles.length - 1) {
          result.push(row);
          // 计算当前行的y坐标
          if (currentRowDirection === 1) {
            lastY = lastY - totalHeight - margin - currentRowHeight;
            lastUpperRowIndex = result.length - 1;
          } else {
            lastY = lastY + totalHeight + margin + currentRowHeight;
          }
          row.forEach((item, index) => {
            item.y = lastY + (currentRowDirection === -1? -currentRowHeight: 0) + row[index].height / 2;
          });
          reset();
        }
      }

      if (lastUpperRowIndex !== -1) {
        const row = result[lastUpperRowIndex];
        const rowHeight = Math.max(...row.map(item => item.height));
        row.forEach((item) => {
          item.y = item.y + (rowHeight - item.height);
        });
      }
    }

    return result.flat();
  }
}
