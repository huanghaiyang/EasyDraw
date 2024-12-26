import { IStageDrawerMaskTaskSizeIndicator, IStageDrawerMaskTaskSizeIndicatorModel } from "@/types";
import StageDrawerMaskTaskBase from "@/modules/render/mask/task/StageDrawerMaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { DefaultSelectionSizeIndicatorFillColor, DefaultSelectionSizeIndicatorFontFamily, DefaultSelectionSizeIndicatorFontSize } from "@/types/constants";

export default class StageDrawerMaskTaskSizeIndicator extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskSizeIndicator {

  get data(): IStageDrawerMaskTaskSizeIndicatorModel {
    return this.model as IStageDrawerMaskTaskSizeIndicatorModel;
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