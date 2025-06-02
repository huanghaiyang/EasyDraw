import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class MaskTaskCursorPosition extends MaskTaskBase {
  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;

    let { text, point } = this.model;

    if (!point) return;
    // 转换为舞台坐标
    point = ElementUtils.calcStageRelativePoint(point);
    await CanvasUtils.drawCommonRotateTextWithScale(this.canvas, text, point, this.styles);
  }
}
