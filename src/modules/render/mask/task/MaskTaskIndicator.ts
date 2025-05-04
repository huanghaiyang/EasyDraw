import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { SelectionIndicatorStyle } from "@/styles/MaskStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class MaskTaskIndicator extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;

    let { text, point } = this.model;
    point = ElementUtils.calcStageRelativePoint(point);

    CanvasUtils.drawCommonRotateTextWithScale(this.canvas, text, point, SelectionIndicatorStyle, SelectionIndicatorStyle.fills[0], {
      angle: this.model.angle,
    });
  }
}
