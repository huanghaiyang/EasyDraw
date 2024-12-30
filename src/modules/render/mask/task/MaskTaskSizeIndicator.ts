import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { DefaultSelectionSizeIndicatorFillColor, DefaultSelectionSizeIndicatorFontFamily, DefaultSelectionSizeIndicatorFontSize } from "@/types/Constants";
import { IMaskSizeIndicatorModel } from "@/types/IModel";
import { IMaskSizeIndicator } from "@/types/IRenderTask";

export default class MaskTaskSizeIndicator extends MaskTaskBase implements IMaskSizeIndicator {

  get data(): IMaskSizeIndicatorModel {
    return this.model as IMaskSizeIndicatorModel;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawRotateText(this.canvas, this.data.text, this.data.point, {
      fontSize: DefaultSelectionSizeIndicatorFontSize,
      fontFamily: DefaultSelectionSizeIndicatorFontFamily,
      textAlign: 'center',
      textBaseline: 'middle',
      fillColor: DefaultSelectionSizeIndicatorFillColor
    }, {
      angle: this.data.angle
    });
  }
}