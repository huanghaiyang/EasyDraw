import { IPoint } from "@/types";
import { ElementStyles, FillStyle, FontStyle, StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";
import MathUtils from "@/utils/MathUtils";
import StyleUtils from "@/utils/StyleUtils";
import CommonUtils from "@/utils/CommonUtils";
import { ArcPoints, RenderParams } from "@/types/IRender";
import ArbitraryUtils from "@/utils/ArbitraryUtils";
import { EllipseModel } from "@/types/IElement";
import ITextData from "@/types/IText";

// 画布变换参数
type CtxTransformOptions = {
  radian: number;
  scaleX: number;
  scaleY: number;
  leanY: number;
};

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
  static convertPointsByStrokeType(points: IPoint[], strokeType: StrokeTypes, strokeWidth: number, options: RenderParams): IPoint[] {
    if (!strokeWidth) return points;
    const { flipX = false, flipY = false } = options;
    // 需要考虑下舞台缩放
    const r = strokeWidth / 2;
    switch (strokeType) {
      case StrokeTypes.inside:
        return flipX !== flipY ? ArbitraryUtils.getArbitraryOuterVertices(points, r, options) : ArbitraryUtils.getArbitraryInnerVertices(points, r, options);
      case StrokeTypes.middle:
        return points;
      case StrokeTypes.outside:
        return flipX !== flipY ? ArbitraryUtils.getArbitraryInnerVertices(points, r, options) : ArbitraryUtils.getArbitraryOuterVertices(points, r, options);
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
  static async drawImgLike(target: HTMLCanvasElement, data: string | HTMLCanvasElement | ImageData | HTMLImageElement, rect: Partial<DOMRect>, options: RenderParams = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (data instanceof ImageData) {
        data = CanvasUtils.getCanvasByImageData(data).toDataURL();
      }
      if (typeof data === "string") {
        if (CanvasUtils.ImageCaches.has(data)) {
          CanvasUtils.drawRotateImage(target, CanvasUtils.ImageCaches.get(data), rect, options);
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
      } else if (data instanceof HTMLCanvasElement || data instanceof HTMLImageElement) {
        CanvasUtils.drawRotateImage(target, data, rect, options);
        resolve();
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取需要的变换参数
   *
   * @param rect
   * @param options
   * @returns
   */
  static getTransformValues(options: RenderParams): CtxTransformOptions {
    let { angle = 0, flipX = false, leanY, actualAngle } = options;
    // 以实际组件角度替换angle
    if (typeof actualAngle === "number") {
      angle = actualAngle;
    }
    // 计算弧度
    let radian = MathUtils.angleToRadian(angle);
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
    return { radian, scaleX, scaleY, leanY };
  }

  /**
   * 变换上下文
   *
   * @param ctx
   * @param rect
   * @param options
   */
  static transformCtx(ctx: CanvasRenderingContext2D, rect: Partial<DOMRect>, options: CtxTransformOptions) {
    const { x, y, width, height } = rect;
    const { radian, scaleX, scaleY, leanY } = options;

    ctx.translate(x + width / 2, y + height / 2);
    // 缩放
    ctx.scale(scaleX, scaleY);
    // 旋转
    ctx.rotate(radian);
    // 倾斜
    ctx.transform(1, 0, leanY, 1, 0, 0);
  }

  /**
   * 根据矩形计算偏移量
   *
   * @param rect
   * @returns
   */
  static calcOffsetByRect(rect: Partial<DOMRect>): IPoint {
    return {
      x: -(rect.x + rect.width / 2),
      y: -(rect.y + rect.height / 2),
    };
  }

  /**
   * 如果路径绘制是以组件中心点开始的，则需要将组件的坐标以组件中心点开始的坐标系转换回来
   *
   * @param points
   * @param rect
   * @returns
   */
  static translatePoints(points: IPoint[], rect: Partial<DOMRect>) {
    const offset = CanvasUtils.calcOffsetByRect(rect);
    return points.map(point => {
      return MathUtils.translate(point, offset);
    });
  }

  /**
   * 平移弧线点
   *
   * @param arcPoints
   * @param rect
   * @param rect
   * @returns
   */
  static translateArcPoints(arcPoints: ArcPoints[], rect: Partial<DOMRect>): ArcPoints[] {
    const offset = CanvasUtils.calcOffsetByRect(rect);
    return MathUtils.translateArcPoints(arcPoints, offset);
  }

  /**
   * 绘制裁剪路径
   *
   * @param ctx
   * @param arcPoints
   * @param rect
   */
  static drawClipArcPoints(ctx: CanvasRenderingContext2D, arcPoints: ArcPoints[], rect: Partial<DOMRect>) {
    arcPoints = CanvasUtils.transArcParamsWithScale(arcPoints)[0];
    arcPoints = CanvasUtils.translateArcPoints(arcPoints, rect);
    ctx.beginPath();
    CanvasUtils.drawBazierPoints(arcPoints, ctx);
    ctx.closePath();
    ctx.clip();
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
  static drawRotateImage(target: HTMLCanvasElement, img: CanvasImageSource | HTMLCanvasElement, rect: Partial<DOMRect>, options: RenderParams = {}): void {
    const { width, height } = rect;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, rect, this.getTransformValues(options));
    if (options.clipArcPoints) {
      CanvasUtils.drawClipArcPoints(ctx, options.clipArcPoints, rect);
    }
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
  static drawRotateImageData(target: HTMLCanvasElement, imageData: ImageData, rect: Partial<DOMRect>, options: RenderParams = {}) {
    const img = CanvasUtils.getCanvasByImageData(imageData); // 频繁调用有性能问题
    CanvasUtils.drawRotateImage(target, img, rect, options);
  }

  /**
   * 绘制一个旋转的文字
   *
   * @param target
   * @param textData
   * @param points
   * @param rect
   * @param fontStyle
   * @param options
   */
  static drawRotateText(target: HTMLCanvasElement, textData: ITextData, points: IPoint[], rect: Partial<DOMRect>, fontStyle: FontStyle, options: RenderParams = {}): void {
    const { flipX } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, rect, this.getTransformValues(options));
    points = CanvasUtils.translatePoints(points, rect);
    ctx.font = `${fontStyle.fontSize}px ${fontStyle.fontFamily}`;
    ctx.textAlign = fontStyle.textAlign;
    ctx.textBaseline = fontStyle.textBaseline;
    ctx.fillStyle = StyleUtils.joinFillColor({ color: fontStyle.fontColor, colorOpacity: fontStyle.fontColorOpacity });
    let prevY = points[0].y;

    textData.lines.forEach(line => {
      let prevX = flipX ? -points[0].x : points[0].x;
      let maxHeight = 0;
      const { nodes } = line;
      nodes.forEach(node => {
        ctx.save();
        let { content, fontStyle } = node;
        fontStyle = CanvasUtils.transFontWithScale(fontStyle);
        const { fontColor, fontColorOpacity, fontSize, fontFamily } = fontStyle;
        ctx.fillStyle = StyleUtils.joinFillColor({ color: fontColor, colorOpacity: fontColorOpacity });
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillText(content, prevX, prevY);
        const metric = ctx.measureText(content);
        prevX += metric.width;
        maxHeight = Math.max(maxHeight, metric.fontBoundingBoxAscent + metric.fontBoundingBoxDescent);
        ctx.restore();
      });
      prevY += maxHeight;
    });
    ctx.restore();
  }

  /**
   * 绘制中心点需要缩放的文本
   *
   * @param target
   * @param textData
   * @param points
   * @param rect
   * @param fontStyle
   * @param options
   */
  static drawRotateTextWithScale(target: HTMLCanvasElement, textData: ITextData, points: IPoint[], rect: Partial<DOMRect>, fontStyle: FontStyle, options: RenderParams = {}) {
    points = CanvasUtils.transPointsWidthScale(points);
    fontStyle = CanvasUtils.transFontWithScale(fontStyle);
    CanvasUtils.drawRotateText(target, textData, points, rect, fontStyle, options);
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
  static drawCommonRotateText(target: HTMLCanvasElement, text: string, center: IPoint, styles: ElementStyles, fillStyle: FillStyle, options: RenderParams = {}): void {
    const { angle = 0 } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(MathUtils.angleToRadian(angle));
    ctx.font = StyleUtils.joinFont(styles);
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
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
  static drawCommonRotateTextWithScale(target: HTMLCanvasElement, text: string, center: IPoint, styles: ElementStyles, fillStyle: FillStyle, options: RenderParams = {}) {
    if (CanvasUtils.scale !== 1) {
      center = {
        x: center.x * CanvasUtils.scale,
        y: center.y * CanvasUtils.scale,
      };
    }
    CanvasUtils.drawCommonRotateText(target, text, center, styles, fillStyle, options);
  }

  /**
   * 点缩放
   *
   * @param points
   * @returns
   */
  static transPointsWidthScale(points: IPoint[]): IPoint[] {
    if (CanvasUtils.scale === 1) return points;
    return CommonUtils.scalePoints(points, CanvasUtils.scale);
  }

  /**
   * 线宽缩放
   *
   * @param strokeStyle
   * @returns
   */
  static transStrokeWithScale(strokeStyle: StrokeStyle): StrokeStyle {
    if (CanvasUtils.scale === 1) return strokeStyle;
    return {
      ...strokeStyle,
      width: strokeStyle.width * CanvasUtils.scale,
    };
  }

  /**
   * 字体缩放
   *
   * @param fontStyle
   * @returns
   */
  static transFontWithScale(fontStyle: FontStyle): FontStyle {
    if (CanvasUtils.scale === 1) return fontStyle;
    return {
      ...fontStyle,
      fontSize: fontStyle.fontSize * CanvasUtils.scale,
    };
  }

  /**
   * 曲线参数缩放
   *
   * @param arcPoints
   * @param strokeStyle
   * @returns
   */
  static transArcParamsWithScale(arcPoints: ArcPoints[], strokeStyle?: StrokeStyle): [ArcPoints[], StrokeStyle] {
    if (CanvasUtils.scale === 1) return [arcPoints, strokeStyle];
    arcPoints = CanvasUtils.scaleArcPoints(arcPoints);
    if (strokeStyle) {
      strokeStyle = {
        ...strokeStyle,
        width: strokeStyle.width * CanvasUtils.scale,
      };
    }
    return [arcPoints, strokeStyle];
  }

  /**
   * 椭圆模型缩放
   *
   * @param ellipseModel
   * @returns
   */
  static transEllipseModelWithScale(ellipseModel: EllipseModel) {
    if (CanvasUtils.scale === 1) return ellipseModel;
    return {
      ...ellipseModel,
      rx: ellipseModel.rx * CanvasUtils.scale,
      ry: ellipseModel.ry * CanvasUtils.scale,
    };
  }

  /**
   * 绘制路径
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawPathWithScale(target: HTMLCanvasElement, points: IPoint[], styles: ElementStyles, fillStyle: FillStyle, strokeStyle: StrokeStyle, options: RenderParams = {}): void {
    points = CanvasUtils.transPointsWidthScale(points);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    if (fillStyle.colorOpacity) {
      CanvasUtils.drawInnerPathFill(target, points, fillStyle, strokeStyle, options);
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
  static drawInnerPathFill(target: HTMLCanvasElement, points: IPoint[], fillStyle: FillStyle, strokeStyle: StrokeStyle, options: RenderParams = {}): void {
    const { calcVertices = true } = options;
    let innerPoints: IPoint[];
    if (calcVertices) {
      innerPoints = ArbitraryUtils.getArbitraryInnerVertices(points, strokeStyle.width / 2, options);
    } else {
      innerPoints = points;
    }
    CanvasUtils.drawPathFill(target, innerPoints, fillStyle);
  }

  /**

  /**
   * 绘制内填充
   *
   * @param target
   * @param points
   * @param fillStyle
   * @param strokeStyle
   * @param options
   */
  static drawInnerPathFillWithScale(target: HTMLCanvasElement, points: IPoint[], fillStyle: FillStyle, strokeStyle: StrokeStyle, options: RenderParams = {}): void {
    points = CanvasUtils.transPointsWidthScale(points);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    if (fillStyle.colorOpacity) {
      CanvasUtils.drawInnerPathFill(target, points, fillStyle, strokeStyle, options);
    }
  }

  /**
   * 缩放曲线点数组
   *
   * @param arcPoints
   * @param scale
   * @returns
   */
  static scaleArcPoints(arcPoints: ArcPoints[]) {
    if (CanvasUtils.scale === 1) return arcPoints;
    arcPoints = arcPoints.map(arc => {
      const { start, controller, end, value, corner } = arc;
      const [p1, p2, p3, p4] = CommonUtils.scalePoints([start, controller, end, corner], CanvasUtils.scale);
      return {
        start: p1,
        controller: p2,
        end: p3,
        corner: p4,
        value: value * CanvasUtils.scale,
      };
    });
    return arcPoints;
  }

  /**
   * 绘制曲线内填充
   *
   * @param target
   * @param arcPoints
   * @param fillStyle
   * @param options
   */
  static drawInnerArcPathFillWithScale(target: HTMLCanvasElement, rect: Partial<DOMRect>, arcPoints: ArcPoints[], fillStyle: FillStyle, options: RenderParams = {}): void {
    arcPoints = CanvasUtils.scaleArcPoints(arcPoints);
    if (fillStyle.colorOpacity) {
      CanvasUtils.drawArcPathFill(target, arcPoints, rect, fillStyle, options);
    }
  }

  /**
   * 绘制描边
   *
   * @param target
   * @param points
   * @param styles
   */
  static drawPathStrokeWidthScale(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle, options: RenderParams = {}) {
    points = CanvasUtils.transPointsWidthScale(points);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    CanvasUtils.drawPathStroke(target, points, strokeStyle, options);
  }

  /**
   * 绘制曲线描边
   * 绘制曲线描边
   *
   * @param target
   * @param arcPoints
   * @param strokeStyle
   * @param options
   */
  static drawArcPathStrokeWidthScale(target: HTMLCanvasElement, arcPoints: ArcPoints[], rect: Partial<DOMRect>, strokeStyle: StrokeStyle, options: RenderParams = {}) {
    [arcPoints, strokeStyle] = CanvasUtils.transArcParamsWithScale(arcPoints, strokeStyle);
    CanvasUtils.drawArcPathStroke(target, arcPoints, rect, strokeStyle, options);
  }

  /**
   * 绘制描边形状
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawPathStroke(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle, options: RenderParams = {}) {
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
   * 计算曲线起点
   *
   * @param arcPoints
   * @returns
   */
  static calcStartOfArcPoints(arcPoints: ArcPoints[]): {
    point: IPoint;
    index: number;
  } {
    let index = 0;
    let point: IPoint;
    const [A, B, C] = arcPoints;
    const controllers = arcPoints.map(arc => arc.controller);
    const { width, height } = MathUtils.calcParallelogramVerticalSize(controllers);
    if (width >= height) {
      point = MathUtils.calcCenter([A.end, B.start]);
      index = 1;
    } else {
      point = MathUtils.calcCenter([B.end, C.start]);
      index = 2;
    }
    return { point, index };
  }

  /**
   * 将曲线点转换为贝塞尔曲线
   *
   * @param arcPoints
   * @param ctx
   *
   * @deprecated 此圆角绘制在组件y轴倾斜状态下不美观~
   */
  static arcToBezierPoints(arcPoints: ArcPoints[], ctx: CanvasRenderingContext2D) {
    let { point, index } = CanvasUtils.calcStartOfArcPoints(arcPoints);
    // 从index开始绘制
    let counter = 0;
    let current = arcPoints[index];
    while (current) {
      const { start, controller, end, corner, value } = current;
      if (counter === 0) {
        ctx.moveTo(point.x, point.y);
      }
      if (value) {
        const r = MathUtils.calcDistance(start, corner);
        ctx.arcTo(controller.x, controller.y, end.x, end.y, r);
      } else {
        ctx.lineTo(controller.x, controller.y);
      }
      current = CommonUtils.getNextOfArray(arcPoints, index, 1);
      index++;
      if (index >= arcPoints.length) {
        index = 0;
      }
      counter++;
      if (counter >= arcPoints.length) {
        break;
      }
    }
  }

  /**
   * 绘制二次贝塞尔曲线
   *
   * @param arcPoints
   * @param ctx
   */
  static drawBazierPoints(arcPoints: ArcPoints[], ctx: CanvasRenderingContext2D) {
    arcPoints.forEach((arc, index) => {
      const { start, controller, end, value } = arc;
      if (index === 0) {
        ctx.moveTo(start.x, start.y);
      } else {
        ctx.lineTo(start.x, start.y);
      }
      if (value) {
        ctx.arcTo(controller.x, controller.y, end.x, end.y, value);
      } else {
        ctx.lineTo(controller.x, controller.y);
      }
    });
  }

  /**
   * 绘制曲线描边
   *
   * @param target
   * @param arcPoints
   * @param strokeStyle
   * @param options
   */
  static drawArcPathStroke(target: HTMLCanvasElement, arcPoints: ArcPoints[], rect: Partial<DOMRect>, strokeStyle: StrokeStyle, options: RenderParams = {}) {
    const { isFold = true } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, rect, CanvasUtils.getTransformValues(options));
    ctx.miterLimit = 0;
    ctx.lineCap = "round";
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.beginPath();
    arcPoints = CanvasUtils.translateArcPoints(arcPoints, rect);
    CanvasUtils.drawBazierPoints(arcPoints, ctx);
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
  static drawPathFill(target: HTMLCanvasElement, points: IPoint[], fillStyle: FillStyle) {
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
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
   * 绘制贝塞尔曲线填充
   *
   * @param target
   * @param arcPoints
   * @param fillStyle
   */
  static drawArcPathFill(target: HTMLCanvasElement, arcPoints: ArcPoints[], rect: Partial<DOMRect>, fillStyle: FillStyle, options: RenderParams = {}) {
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, rect, CanvasUtils.getTransformValues(options));
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
    ctx.beginPath();
    arcPoints = CanvasUtils.translateArcPoints(arcPoints, rect);
    CanvasUtils.drawBazierPoints(arcPoints, ctx);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 变换椭圆
   *
   * @param ctx
   * @param point
   * @param model
   * @param rect
   * @param options
   */
  static transformEllipse(ctx: CanvasRenderingContext2D, point: IPoint, model: EllipseModel, rect?: Partial<DOMRect>, options?: RenderParams): { point: IPoint; model: EllipseModel } {
    if (rect && options) {
      CanvasUtils.transformCtx(ctx, rect, CanvasUtils.getTransformValues(options));
      point = CanvasUtils.translatePoints([point], rect)[0];
    }
    model = CanvasUtils.transEllipseModelWithScale(model);
    return { point, model };
  }

  /**
   * 绘制填充圆形
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseFill(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, fillStyle: FillStyle, rect?: Partial<DOMRect>, options?: RenderParams) {
    const ctx = target.getContext("2d");
    ctx.save();
    const {
      point: { x, y },
      model: { rx, ry },
    } = CanvasUtils.transformEllipse(ctx, point, model, rect, options);
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 绘制描边圆形
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseStroke(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, strokeStyle: StrokeStyle, rect?: Partial<DOMRect>, options?: RenderParams) {
    const ctx = target.getContext("2d");
    ctx.save();
    const {
      point: { x, y },
      model: { rx, ry },
    } = CanvasUtils.transformEllipse(ctx, point, model, rect, options);
    ctx.lineWidth = strokeStyle.width;
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 需要缩放的圆形描边
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseStrokeWithScale(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, strokeStyle: StrokeStyle, rect?: Partial<DOMRect>, options?: RenderParams) {
    const points = CanvasUtils.transPointsWidthScale([point]);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    CanvasUtils.drawEllipseStroke(target, points[0], model, strokeStyle, rect, options);
  }

  /**
   * 需要缩放的圆形填充
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseFillWithScale(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, fillStyle: FillStyle, rect?: Partial<DOMRect>, options?: RenderParams) {
    const points = CanvasUtils.transPointsWidthScale([point]);
    CanvasUtils.drawEllipseFill(target, points[0], model, fillStyle, rect, options);
  }

  /**
   * 绘制线段
   *
   * @param ctx
   * @param points
   * @param styles
   */
  static drawLine(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle) {
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
  static drawLineWidthScale(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle) {
    points = CanvasUtils.transPointsWidthScale(points);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
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

  /**
   * 从图片组件中提取DataURL
   *
   * @param image
   * @returns
   */
  static getDataUrlFromImage(image: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        resolve(canvas.toDataURL());
      } else {
        reject(new Error("Failed to get 2d context from canvas"));
      }
    });
  }
}
