import { IStageMaskTaskSelection, IStageMaskTaskSelectionObj } from "@/types";
import StageMaskTaskBase from "@/modules/render/mask/StageMaskTaskBase";
import { DefaultSelectionStrokeColor, DefaultSelectionStrokeWidth, DefaultSelectionFillColor } from "@/types/constants";
import CanvasUtils from "@/utils/CanvasUtils";

export default class StageMaskTaskSelection extends StageMaskTaskBase implements IStageMaskTaskSelection {

  get data() {
    return this.obj as IStageMaskTaskSelectionObj;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPath(this.canvas, this.data.points, {
      strokeStyle: DefaultSelectionStrokeColor,
      lineWidth: DefaultSelectionStrokeWidth,
      fillStyle: DefaultSelectionFillColor
    });
  }
}