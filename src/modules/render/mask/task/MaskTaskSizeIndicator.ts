import { IMaskSizeIndicator, IMaskSizeIndicatorModel } from "@/types";
import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { DefaultSelectionSizeIndicatorFillColor, DefaultSelectionSizeIndicatorFontFamily, DefaultSelectionSizeIndicatorFontSize } from "@/types/constants";

export default class MaskTaskSizeIndicator extends MaskTaskBase implements IMaskSizeIndicator {

  get data(): IMaskSizeIndicatorModel {
    return this.model as IMaskSizeIndicatorModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawRotateText(this.canvas, this.data.text, this.data.point, {
      font: `${DefaultSelectionSizeIndicatorFontSize}px ${DefaultSelectionSizeIndicatorFontFamily}`,
      textAlign: 'center',
      textBaseline: 'middle',
      fillStyle: DefaultSelectionSizeIndicatorFillColor
    }, {
      angle: this.data.angle
    });
  }
}