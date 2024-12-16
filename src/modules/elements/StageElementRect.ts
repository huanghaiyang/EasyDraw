import StageElement from "@/modules/elements/StageElement";
import { IPoint } from "@/types";
import { defaultCreatorStrokeColor, defaultCreatorStrokeWidth } from "@/types/constants";

export default class StageElementRect extends StageElement {

  /**
   * 绘制矩形
   * 
   * @param canvas 
   */
  render(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.strokeStyle = this.obj.strokeColor || defaultCreatorStrokeColor;
    ctx.fillStyle = this.obj.fillColor || defaultCreatorStrokeColor;
    ctx.lineWidth = this.obj.strokeWidth || defaultCreatorStrokeWidth;
    ctx.beginPath();
    this.fullPoints.forEach((point, index) => {
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

  /**
   * 矩形在绘制过程中仅有两个点，需要计算出四个点
   * 
   * @returns 
   */
  calcFullPoints(): IPoint[] {
    const minX = Math.min(...this.points.map(point => point.x));
    const minY = Math.min(...this.points.map(point => point.y));
    const maxX = Math.max(...this.points.map(point => point.x));
    const maxY = Math.max(...this.points.map(point => point.y));

    return [
      { x: minX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
      { x: maxX, y: minY },
    ];
  }

}