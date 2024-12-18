import StageElement from "@/modules/elements/StageElement";
import { IPoint } from "@/types";
import { DefaultCreatorStrokeColor, DefaultCreatorStrokeWidth } from "@/types/constants";
import CommonUtils from "@/utils/CommonUtils";

export default class StageElementRect extends StageElement {

  /**
   * 绘制矩形
   * 
   * @param canvas 
   */
  render(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.strokeStyle = this.obj.strokeColor || DefaultCreatorStrokeColor;
    ctx.fillStyle = this.obj.fillColor || DefaultCreatorStrokeColor;
    ctx.lineWidth = this.obj.strokeWidth || DefaultCreatorStrokeWidth;
    ctx.beginPath();
    this.pathPoints.forEach((point, index) => {
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
  calcPathPoints(): IPoint[] {
    this.pathPoints = CommonUtils.getBoxByPoints(this.points);
    return this.pathPoints;
  }

  /**
   * 获取矩形的边线点
   * 
   * @returns 
   */
  getEdgePoints(): IPoint[] {
    return this.pathPoints;
  }

}