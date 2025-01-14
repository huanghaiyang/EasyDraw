import { IPoint } from "@/types";
import { ElementStyles, StrokeTypes } from "@/types/ElementStyles";
import MathUtils from "@/utils/MathUtils";
import StyleUtils from "@/utils/StyleUtils";
import PolygonUtils from "@/utils/PolygonUtils";
import CommonUtils from "@/utils/CommonUtils";
import { DefaultRenderParams, RenderParams } from "@/types/IRender";

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
  static convertPointsByStrokeType(points: IPoint[], strokeType: StrokeTypes, strokeWidth: number): IPoint[] {
    if (!strokeWidth) return points;
    // 需要考虑下舞台缩放
    const r = (strokeWidth / 2);
    switch (strokeType) {
      case StrokeTypes.inside:
        return PolygonUtils.getPolygonInnerVertices(points, r);
      case StrokeTypes.middle:
        return points;
      case StrokeTypes.outside:
        return PolygonUtils.getPolygonOuterVertices(points, r);
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
  static async drawImgLike(target: HTMLCanvasElement, data: string | HTMLCanvasElement | ImageData | HTMLImageElement, rect: Partial<DOMRect>, options?: RenderParams): Promise<void> {
    return new Promise((resolve, reject) => {
      if (data instanceof ImageData) {
        data = CanvasUtils.getCanvasByImageData(data).toDataURL();
      }
      if (typeof data === 'string') {
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
        }
        img.onerror = () => {
          reject();
        }
      } else if (data instanceof HTMLCanvasElement || data instanceof HTMLImageElement) {
        CanvasUtils.drawRotateImage(target, data, rect, options);
        resolve();
      } else {
        resolve();
      }
    })
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
  static drawRotateImage(target: HTMLCanvasElement, img: CanvasImageSource | HTMLCanvasElement, rect: Partial<DOMRect>, options?: RenderParams): void {
    let { x, y, width, height } = rect;
    const { angle, flipX, flipY } = options || DefaultRenderParams;
    const ctx = target.getContext('2d');
    const radian = MathUtils.degreesToRadians(angle);
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2);
    if (flipX && !flipY) {
      ctx.scale(-1, 1);
      ctx.rotate(-radian)
    } else if (flipY && !flipX) {
      ctx.scale(1, -1);
      ctx.rotate(MathUtils.degreesToRadians(180) - radian)
    } else {
      ctx.scale(1, 1);
      ctx.rotate(radian);
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
  static drawRotateImageData(target: HTMLCanvasElement, imageData: ImageData, rect: Partial<DOMRect>, options?: { angle: number }) {
    let { x, y, width, height } = rect;
    const { angle } = options || { angle: 0 };
    const ctx = target.getContext('2d');
    const img = CanvasUtils.getCanvasByImageData(imageData); // 频繁调用有性能问题
    if (angle) {
      ctx.save()
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(MathUtils.degreesToRadians(angle));
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    } else {
      ctx.drawImage(img, x, y, width, height);
    }
    ctx.restore();
  }

  /**
   * 绘制一个旋转的文字
   * 
   * @param target 
   * @param text 
   * @param centroid 
   * @param styles 
   * @param options 
   */
  static drawRotateText(target: HTMLCanvasElement, text: string, centroid: IPoint, styles: ElementStyles, options?: { angle: number }): void {
    const { angle } = options || { angle: 0 };
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.translate(centroid.x, centroid.y);
    ctx.rotate(MathUtils.degreesToRadians(angle));
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
   * @param centroid 
   * @param styles 
   * @param options 
   */
  static drawRotateTextWithScale(target: HTMLCanvasElement, text: string, centroid: IPoint, styles: ElementStyles, options?: { angle: number }) {
    if (CanvasUtils.scale !== 1) {
      centroid = {
        x: centroid.x * CanvasUtils.scale,
        y: centroid.y * CanvasUtils.scale
      }
    }
    CanvasUtils.drawRotateText(target, text, centroid, styles, options);
  }

  /**
   * 参数缩放
   * 
   * @param points 
   * @param styles 
   * @returns 
   */
  static transParamsWithScale(points: IPoint[], styles: ElementStyles): [IPoint[], ElementStyles] {
    points = CommonUtils.scalePoints(points, CanvasUtils.scale);
    styles = { ...styles, strokeWidth: styles.strokeWidth * CanvasUtils.scale }
    return [points, styles]
  }

  /**
   * 绘制路径
   * 
   * @param target 
   * @param points 
   * @param styles 
   * @param close
   */
  static drawPathWithScale(target: HTMLCanvasElement, points: IPoint[], styles: ElementStyles, close: boolean = true): void {
    [points, styles] = CanvasUtils.transParamsWithScale(points, styles)
    if (styles.fillColorOpacity) {
      const innerPoints = PolygonUtils.getPolygonInnerVertices(points, styles.strokeWidth / 2);
      CanvasUtils.drawPathFill(target, innerPoints, styles);
    }
    if (styles.strokeWidth && styles.strokeColorOpacity) {
      CanvasUtils.drawPathStroke(target, points, styles, close);
    }
  }

  /**
   * 绘制描边
   * 
   * @param target 
   * @param points 
   * @param styles 
   */
  static drawPathStokeWidthScale(target: HTMLCanvasElement, points: IPoint[], styles: ElementStyles, close: boolean = true) {
    [points, styles] = CanvasUtils.transParamsWithScale(points, styles)
    CanvasUtils.drawPathStroke(target, points, styles, close);
  }

  /**
   * 绘制描边形状
   * 
   * @param target 
   * @param points 
   * @param styles 
   * @param close
   */
  static drawPathStroke(target: HTMLCanvasElement, points: IPoint[], styles: ElementStyles, close: boolean = true) {
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.strokeStyle = StyleUtils.joinStrokeColor(styles);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    close && ctx.closePath();
    // 即使线宽为0，但若是调用了stroke()方法，也会绘制出边框
    if (styles.strokeWidth) {
      ctx.lineWidth = styles.strokeWidth;
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
  static drawPathFill(target: HTMLCanvasElement, points: IPoint[], styles: ElementStyles) {
    const ctx = target.getContext('2d');
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
  static drawCircleFill(target: HTMLCanvasElement, point: IPoint, radius: number, styles: ElementStyles) {
    const ctx = target.getContext('2d');
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
  static drawCircleStroke(target: HTMLCanvasElement, point: IPoint, radius: number, styles: ElementStyles) {
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.strokeStyle = StyleUtils.joinStrokeColor(styles);
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
  static drawCircleStrokeWithScale(target: HTMLCanvasElement, point: IPoint, radius: number, styles: ElementStyles) {
    const [points, scaleStyles] = CanvasUtils.transParamsWithScale([point], styles);
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
  static drawCircleFillWithScale(target: HTMLCanvasElement, point: IPoint, radius: number, styles: ElementStyles) {
    const [points, scaleStyles] = CanvasUtils.transParamsWithScale([point], styles);
    CanvasUtils.drawCircleFill(target, points[0], radius, scaleStyles);
  }

  /**
   * 绘制线段
   * 
   * @param ctx 
   * @param points 
   * @param styles 
   */
  static drawLine(target: HTMLCanvasElement, points: IPoint[], styles: ElementStyles) {
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = styles.strokeWidth;
    ctx.strokeStyle = StyleUtils.joinStrokeColor(styles);
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    })
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
  static drawLineWidthScale(target: HTMLCanvasElement, points: IPoint[], styles: ElementStyles) {
    [points, styles] = CanvasUtils.transParamsWithScale(points, styles);
    CanvasUtils.drawLine(target, points, styles);
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
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * 从图片元素中提取ImageData
   * 
   * @param image 
   * @returns 
   */
  static getImageDataFromImage(image: HTMLImageElement): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        resolve(ctx.getImageData(0, 0, image.width, image.height));
      } else {
        reject(new Error('Failed to get 2d context from canvas'));
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
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
  }
}