import { CanvasCreatorStyles, IPoint } from "@/types";
import MathUtils from "./MathUtils";

export default class CanvasUtils {

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
        const img = new Image();
        img.src = svg;
        img.onload = () => {
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
   * @param target 
   * @param svg 
   * @param rect 
   * @param options 
   */
  static drawRotateImage(target: HTMLCanvasElement, svg: CanvasImageSource | HTMLCanvasElement, rect: Partial<DOMRect>, options?: { angle: number }): void {
    const { x, y, width, height } = rect;
    const { angle } = options || { angle: 0 };
    const ctx = target.getContext('2d');
    if (angle) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(MathUtils.degreesToRadians(angle));
      ctx.drawImage(svg, -width / 2, -height / 2, width, height);
    } else {
      ctx.drawImage(svg, x, y, width, height);
    }
  }

  /**
   * 绘制路径
   * 
   * @param target 
   * @param points 
   * @param styles 
   */
  static drawPath(target: HTMLCanvasElement, points: IPoint[], styles: CanvasCreatorStyles): void {
    const ctx = target.getContext('2d');
    ctx.save();
    ctx.strokeStyle = styles.strokeStyle;
    ctx.fillStyle = styles.fillStyle;
    ctx.lineWidth = styles.lineWidth;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
}