import { IPoint } from "@/types";
import { CreatorStyles } from "@/types/Styles";
import MathUtils from "@/utils/MathUtils";

export default class CanvasUtils {
  static ImageCaches = new Map();
  static scale: number = 1;

  /**
   * 绘制图片或者canvas到canvas上
   * 
   * @param target 
   * @param svg 
   * @param options 
   * @param options
   * @returns 
   */
  static async drawImgLike(target: HTMLCanvasElement, svg: string | HTMLCanvasElement, rect: Partial<DOMRect>, options?: { angle: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof svg === 'string') {
        if (CanvasUtils.ImageCaches.has(svg)) {
          CanvasUtils.drawRotateImage(target, CanvasUtils.ImageCaches.get(svg), rect, options);
          resolve();
          return;
        }
        const img = new Image();
        img.src = svg;
        img.onload = () => {
          CanvasUtils.ImageCaches.set(svg, img);
          CanvasUtils.drawRotateImage(target, img, rect, options);
          resolve();
        }
        img.onerror = () => {
          reject();
        }
      } else if (svg instanceof HTMLCanvasElement) {
        CanvasUtils.drawRotateImage(target, svg, rect, options);
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
   * @param svg 
   * @param rect 
   * @param options 
   */
  static drawRotateImage(target: HTMLCanvasElement, svg: CanvasImageSource | HTMLCanvasElement, rect: Partial<DOMRect>, options?: { angle: number }): void {
    let { x, y, width, height } = rect;
    x *= CanvasUtils.scale;
    y *= CanvasUtils.scale;
    width *= CanvasUtils.scale;
    height *= CanvasUtils.scale;
    const { angle } = options || { angle: 0 };
    const ctx = target.getContext('2d');
    if (angle) {
      ctx.save()
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(MathUtils.degreesToRadians(angle));
      ctx.drawImage(svg, -width / 2, -height / 2, width, height);
    } else {
      ctx.drawImage(svg, x, y, width, height);
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
  static drawRotateText(target: HTMLCanvasElement, text: string, centroid: IPoint, styles: CreatorStyles, options?: { angle: number }): void {
    const { angle } = options || { angle: 0 };
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.translate(centroid.x * CanvasUtils.scale, centroid.y * CanvasUtils.scale);
    ctx.rotate(MathUtils.degreesToRadians(angle));
    ctx.font = styles.font;
    ctx.fillStyle = styles.fillStyle;
    ctx.textAlign = styles.textAlign;
    ctx.textBaseline = styles.textBaseline;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  /**
   * 绘制路径
   * 
   * @param target 
   * @param points 
   * @param styles 
   */
  static drawPath(target: HTMLCanvasElement, points: IPoint[], styles: CreatorStyles): void {
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.strokeStyle = styles.strokeStyle;
    ctx.fillStyle = styles.fillStyle;
    ctx.lineWidth = styles.lineWidth;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x * CanvasUtils.scale, point.y * CanvasUtils.scale);
      } else {
        ctx.lineTo(point.x * CanvasUtils.scale, point.y * CanvasUtils.scale);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
}