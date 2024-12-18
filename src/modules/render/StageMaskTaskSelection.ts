import { IStageMaskTaskSelection, IStageMaskTaskSelectionObj } from "@/types";
import StageMaskTaskBase from "@/modules/render/StageMaskTaskBase";
import { DefaultSelectionStrokeColor, DefaultSelectionStrokeWidth } from "@/types/constants";
import { DefaultSelectionFillColor } from './../../types/constants';

export default class StageMaskTaskSelection extends StageMaskTaskBase implements IStageMaskTaskSelection {

  get data() {
    return this.obj as  IStageMaskTaskSelectionObj;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const canvas = this.getCanvas();
    const ctx = canvas?.getContext('2d');
    ctx.save();
    ctx.strokeStyle = DefaultSelectionStrokeColor;
    ctx.lineWidth = DefaultSelectionStrokeWidth;
    ctx.fillStyle = DefaultSelectionFillColor;
    ctx.beginPath();
    this.data.points.forEach((point, index) => {
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