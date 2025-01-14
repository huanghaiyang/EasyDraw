import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IMaskSizeIndicator } from "@/types/IRenderTask";
import { SelectionIndicatorStyle } from "@/types/MaskStyles";

export default class MaskTaskSizeIndicator extends MaskTaskBase implements IMaskSizeIndicator {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawRotateTextWithScale(this.canvas, this.data.text, this.data.point, SelectionIndicatorStyle, {
      angle: this.data.angle
    });
  }
}