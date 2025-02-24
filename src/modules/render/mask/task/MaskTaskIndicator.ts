import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { SelectionIndicatorStyle } from "@/styles/MaskStyles";

export default class MaskTaskIndicator extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawRotateTextWithScale(this.canvas, this.data.text, this.data.point, SelectionIndicatorStyle, SelectionIndicatorStyle.fills[0], {
      angle: this.data.angle,
    });
  }
}
