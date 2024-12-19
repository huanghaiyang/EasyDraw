import { CanvasCreatorStyles, IPoint } from "@/types";

export default class CanvasUtils {

  /**
   * 绘制图片或者canvas到canvas上
   * 
   * @param target 
   * @param svg 
   * @param options 
   * @returns 
   */
  static async drawImgLike(target: HTMLCanvasElement, svg: string | HTMLCanvasElement, options: Partial<DOMRect>): Promise<void> {
    return new Promise((resolve, reject) => {
      const { x, y, width, height } = options;
      const ctx = target.getContext('2d');
      if (typeof svg === 'string') {
        const img = new Image();
        img.src = svg;
        img.onload = () => {
          ctx.drawImage(img, x, y, width, height);
          resolve();
        }
        img.onerror = () => {
          reject();
        }
      } else if (svg instanceof HTMLCanvasElement) {
        ctx.drawImage(svg, x, y, width, height);
        resolve();
      }
    })
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