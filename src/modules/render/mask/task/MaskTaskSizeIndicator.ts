import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IMaskSizeIndicatorModel } from "@/types/IModel";
import { IMaskSizeIndicator } from "@/types/IRenderTask";
import { DefaultSelectionSizeIndicatorStyle } from "@/types/MaskStyles";

export default class MaskTaskSizeIndicator extends MaskTaskBase implements IMaskSizeIndicator {

  get data(): IMaskSizeIndicatorModel {
    return this.model as IMaskSizeIndicatorModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawRotateTextWithScale(this.canvas, this.data.text, this.data.point, DefaultSelectionSizeIndicatorStyle, {
      angle: this.data.angle
    });
  }
}