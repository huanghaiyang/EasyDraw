import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { CursorPositionStyle } from "@/styles/MaskStyles";

export default class MaskTaskCursorPosition extends MaskTaskBase {
  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;
    
    let { text, point } = this.model;
    await CanvasUtils.drawRotateTextWithScale(this.canvas, text, point, CursorPositionStyle, CursorPositionStyle.fills[0]);
  }
}
