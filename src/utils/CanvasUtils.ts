import { IPoint } from "@/types";
import {
  ElementStyles,
  StrokeStyle,
  StrokeTypes,
} from "@/styles/ElementStyles";
import MathUtils from "@/utils/MathUtils";
import StyleUtils from "@/utils/StyleUtils";
import CommonUtils from "@/utils/CommonUtils";
import { RenderParams } from "@/types/IRender";
import ArbitraryUtils from "@/utils/ArbitraryUtils";

export default class CanvasUtils {
  static ImageCaches = new Map();
  static scale: number = 1;

  /**
   * 根据线型转换点坐标
   *
   * @param points
   * @param strokeType
   * @param strokeWidth
   * @returns
   */
  static convertPointsByStrokeType(
    points: IPoint[],
    strokeType: StrokeTypes,
    strokeWidth: number,
    options: RenderParams,
  ): IPoint[] {
    if (!strokeWidth) return points;
    const { flipX = false, flipY = false } = options;
    // 需要考虑下舞台缩放
    const r = strokeWidth / 2;
    switch (strokeType) {
      case StrokeTypes.inside:
        return flipX !== flipY
          ? ArbitraryUtils.getArbitraryOuterVertices(points, r, options)
          : ArbitraryUtils.getArbitraryInnerVertices(points, r, options);
      case StrokeTypes.middle:
        return points;
      case StrokeTypes.outside:
        return flipX !== flipY
          ? ArbitraryUtils.getArbitraryInnerVertices(points, r, options)
          : ArbitraryUtils.getArbitraryOuterVertices(points, r, options);
    }
  }

  /**
   * 绘制图片或者canvas到canvas上
   *
   * @param target
   * @param data
   * @param options
   * @param options
   * @returns
   */
  static async drawImgLike(
    target: HTMLCanvasElement,
    data: string | HTMLCanvasElement | ImageData | HTMLImageElement,
    rect: Partial<DOMRect>,
    options: RenderParams = {},
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (data instanceof ImageData) {
        data = CanvasUtils.getCanvasByImageData(data).toDataURL();
      }
      if (typeof data === "string") {
        if (CanvasUtils.ImageCaches.has(data)) {
          CanvasUtils.drawRotateImage(
            target,
            CanvasUtils.ImageCaches.get(data),
            rect,
            options,
          );
          resolve();
          return;
        }
        const img = new Image();
        img.src = data;
        img.onload = () => {
          CanvasUtils.ImageCaches.set(data, img);
          CanvasUtils.drawRotateImage(target, img, rect, options);
          resolve();
        };
        img.onerror = () => {
          reject();
        };
      } else if (
        data instanceof HTMLCanvasElement ||
        data instanceof HTMLImageElement
      ) {
        CanvasUtils.drawRotateImage(target, data, rect, options);
        resolve();
      } else {
        resolve();
      }
    });
  }

  /**
   * 绘制一张旋转过的图片
   *
   * canvas是以x的正方向为0，顺时针为正角度旋转的
   *
   * @param target
   * @param data
   * @param rect
   * @param options
   */
  static drawRotateImage(
    target: HTMLCanvasElement,
    img: CanvasImageSource | HTMLCanvasElement,
    rect: Partial<DOMRect>,
    options: RenderParams = {},
  ): void {
    let { x, y, width, height } = rect;
    let { angle = 0, flipX = false, leanY, actualAngle } = options;
    const ctx = target.getContext("2d");
    // 以实际组件角度替换angle
    if (typeof actualAngle === "number") {
      angle = actualAngle;
    }
    // 计算弧度
    let radian = MathUtils.angleToRadian(angle);
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    let scaleX = 1;
    let scaleY = 1;
    // 如果组件翻转
    if (flipX) {
      // 翻转显示
      scaleX = -1;
      // 翻转角度
      radian = -radian;
      // 倾斜翻转
      leanY = -leanY;
    }
    // 缩放
    ctx.scale(scaleX, scaleY);
    // 旋转
    ctx.rotate(radian);
    // 倾斜
    ctx.transform(1, 0, leanY, 1, 0, 0);
    // 绘制
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  /**
   * 绘制图片
   *
   * @param target
   * @param imageData
   * @param rect
   * @param options
   */
  static drawRotateImageData(
    target: HTMLCanvasElement,
    imageData: ImageData,
    rect: Partial<DOMRect>,
    options: RenderParams = {},
  ) {
    const img = CanvasUtils.getCanvasByImageData(imageData); // 频繁调用有性能问题
    CanvasUtils.drawRotateImage(target, img, rect, options);
  }

  /**
   * 绘制一个旋转的文字
   *
   * @param target
   * @param text
   * @param center
   * @param styles
   * @param options
   */
  static drawRotateText(
    target: HTMLCanvasElement,
    text: string,
    center: IPoint,
    styles: ElementStyles,
    options: RenderParams = {},
  ): void {
    const { angle = 0 } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(MathUtils.angleToRadian(angle));
    ctx.font = StyleUtils.joinFont(styles);
    ctx.fillStyle = StyleUtils.joinFillColor(styles);
    ctx.textAlign = styles.textAlign;
    ctx.textBaseline = styles.textBaseline;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  /**
   * 绘制中心点需要缩放的文本
   *
   * @param target
   * @param text
   * @param center
   * @param styles
   * @param options
   */
  static drawRotateTextWithScale(
    target: HTMLCanvasElement,
    text: string,
    center: IPoint,
    styles: ElementStyles,
    options: RenderParams = {},
  ) {
    if (CanvasUtils.scale !== 1) {
      center = {
        x: center.x * CanvasUtils.scale,
        y: center.y * CanvasUtils.scale,
      };
    }
    CanvasUtils.drawRotateText(target, text, center, styles, options);
  }

  /**
   * 参数缩放
   *
   * @param points
   * @param styles
   * @returns
   */
  static transParamsWithScale(
    points: IPoint[],
    strokeStyle: StrokeStyle,
  ): [IPoint[], StrokeStyle] {
    points = CommonUtils.scalePoints(points, CanvasUtils.scale);
    strokeStyle = {
      ...strokeStyle,
      width: strokeStyle.width * CanvasUtils.scale,
    };
    return [points, strokeStyle];
  }

  /**
   * 绘制路径
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawPathWithScale(
    target: HTMLCanvasElement,
    points: IPoint[],
    styles: ElementStyles,
    strokeStyle: StrokeStyle,
    options: RenderParams = {},
  ): void {
    [points, strokeStyle] = CanvasUtils.transParamsWithScale(
      points,
      strokeStyle,
    );
    if (styles.fillColorOpacity) {
      CanvasUtils.drawInnerPathFill(
        target,
        points,
        styles,
        strokeStyle,
        options,
      );
    }
    if (strokeStyle.width && strokeStyle.colorOpacity) {
      CanvasUtils.drawPathStroke(target, points, strokeStyle, options);
    }
  }

  /**
   * 绘制路径
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawInnerPathFill(
    target: HTMLCanvasElement,
    points: IPoint[],
    styles: ElementStyles,
    strokeStyle: StrokeStyle,
    options: RenderParams = {},
  ): void {
    const { calcVertices = true } = options;
    let innerPoints: IPoint[];
    if (calcVertices) {
      innerPoints = ArbitraryUtils.getArbitraryInnerVertices(
        points,
        strokeStyle.width / 2,
        options,
      );
    } else {
      innerPoints = points;
    }
    CanvasUtils.drawPathFill(target, innerPoints, styles);
  }

  /**
   * 绘制内填充
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawInnerPathFillWithScale(
    target: HTMLCanvasElement,
    points: IPoint[],
    styles: ElementStyles,
    strokeStyle: StrokeStyle,
    options: RenderParams = {},
  ): void {
    [points, strokeStyle] = CanvasUtils.transParamsWithScale(
      points,
      strokeStyle,
    );
    if (styles.fillColorOpacity) {
      CanvasUtils.drawInnerPathFill(
        target,
        points,
        styles,
        strokeStyle,
        options,
      );
    }
  }

  /**
   * 绘制描边
   *
   * @param target
   * @param points
   * @param styles
   */
  static drawPathStrokeWidthScale(
    target: HTMLCanvasElement,
    points: IPoint[],
    strokeStyle: StrokeStyle,
    options: RenderParams = {},
  ) {
    [points, strokeStyle] = CanvasUtils.transParamsWithScale(
      points,
      strokeStyle,
    );
    CanvasUtils.drawPathStroke(target, points, strokeStyle, options);
  }

  /**
   * 绘制描边形状
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawPathStroke(
    target: HTMLCanvasElement,
    points: IPoint[],
    strokeStyle: StrokeStyle,
    options: RenderParams = {},
  ) {
    const { isFold = true, miterLimit } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    if (miterLimit) {
      ctx.miterLimit = miterLimit;
    }
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    isFold && ctx.closePath();
    // 即使线宽为0，但若是调用了stroke()方法，也会绘制出边框
    if (strokeStyle.width) {
      ctx.lineWidth = strokeStyle.width;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 绘制填充形状
   *
   * @param target
   * @param points
   * @param styles
   */
  static drawPathFill(
    target: HTMLCanvasElement,
    points: IPoint[],
    styles: ElementStyles,
  ) {
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.fillStyle = StyleUtils.joinFillColor(styles);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 绘制填充圆形
   *
   * @param target
   * @param point
   * @param radius
   * @param styles
   */
  static drawCircleFill(
    target: HTMLCanvasElement,
    point: IPoint,
    radius: number,
    styles: ElementStyles,
  ) {
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.fillStyle = StyleUtils.joinFillColor(styles);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 绘制描边圆形
   *
   * @param target
   * @param point
   * @param radius
   * @param styles
   */
  static drawCircleStroke(
    target: HTMLCanvasElement,
    point: IPoint,
    radius: number,
    strokeStyle: StrokeStyle,
  ) {
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 需要缩放的圆形描边
   *
   * @param target
   * @param point
   * @param radius
   * @param styles
   */
  static drawCircleStrokeWithScale(
    target: HTMLCanvasElement,
    point: IPoint,
    radius: number,
    strokeStyle: StrokeStyle,
  ) {
    const [points, scaleStyles] = CanvasUtils.transParamsWithScale(
      [point],
      strokeStyle,
    );
    CanvasUtils.drawCircleStroke(target, points[0], radius, scaleStyles);
  }

  /**
   * 需要缩放的圆形填充
   *
   * @param target
   * @param point
   * @param radius
   * @param styles
   */
  static drawCircleFillWithScale(
    target: HTMLCanvasElement,
    point: IPoint,
    radius: number,
    strokeStyle: StrokeStyle,
  ) {
    const [points, scaleStyles] = CanvasUtils.transParamsWithScale(
      [point],
      strokeStyle,
    );
    CanvasUtils.drawCircleStroke(target, points[0], radius, scaleStyles);
  }

  /**
   * 绘制线段
   *
   * @param ctx
   * @param points
   * @param styles
   */
  static drawLine(
    target: HTMLCanvasElement,
    points: IPoint[],
    strokeStyle: StrokeStyle,
  ) {
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = strokeStyle.width;
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 绘制线段
   *
   * @param target
   * @param points
   * @param styles
   */
  static drawLineWidthScale(
    target: HTMLCanvasElement,
    points: IPoint[],
    strokeStyle: StrokeStyle,
  ) {
    [points, strokeStyle] = CanvasUtils.transParamsWithScale(
      points,
      strokeStyle,
    );
    CanvasUtils.drawLine(target, points, strokeStyle);
  }

  /**
   * 将blob转换为ImageData
   *
   * @param blob
   * @returns
   */
  static getImageDataFromBlob(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * 从图片组件中提取ImageData
   *
   * @param image
   * @returns
   */
  static getImageDataFromImage(image: HTMLImageElement): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        resolve(ctx.getImageData(0, 0, image.width, image.height));
      } else {
        reject(new Error("Failed to get 2d context from canvas"));
      }
    });
  }

  /**
   * 将ImageData转换为canvas
   *
   * @param imageData
   * @returns
   */
  static getCanvasByImageData(imageData: ImageData): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
  }
}
