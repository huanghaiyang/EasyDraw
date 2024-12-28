import { IMaskSelection, IMaskSelectionModel } from "@/types";
import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { DefaultSelectionStrokeColor, DefaultSelectionStrokeWidth, DefaultSelectionFillColor } from "@/types/constants";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskSelection extends MaskTaskBase implements IMaskSelection {

  get data(): IMaskSelectionModel {
    return this.model as IMaskSelectionModel;
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