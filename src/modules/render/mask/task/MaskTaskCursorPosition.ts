import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { CursorPositionStyle } from "@/styles/MaskStyles";

export default class MaskTaskCursorPosition extends MaskTaskBase {
  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      await CanvasUtils.drawRotateTextWithScale(
        this.canvas,
        this.data.text,
        this.data.point,
        CursorPositionStyle,
      );
    }
  }
}
