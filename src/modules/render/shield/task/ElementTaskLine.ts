import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class ElementTaskLine extends ElementTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    const {
      strokeCoords,
      model: { styles },
    } = this.element;
    // 计算描边的舞台坐标
    const strokePoints = ElementUtils.batchCalcStageRelativePoints(strokeCoords);

    // 绘制边框
    strokePoints.forEach((points, index) => {
      CanvasUtils.drawPathWithScale(this.canvas, points, styles.fills[0], styles.strokes[index]);
    });
  }
}
