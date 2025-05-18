import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { DefaultLineMeterLimit } from "@/styles/ElementStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class ElementTaskArbitrary extends ElementTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    let {
      innermostStrokeCoordIndex,
      strokeCoords,
      model: { styles, isFold, coords },
      isOnStage,
    } = this.element;
    if (coords?.length === 0 || !isOnStage) return;
    // 计算秒表的舞台坐标
    const strokePoints = ElementUtils.batchCalcStageRelativePoints(strokeCoords);
    // 判断路径是否闭合
    if (isFold) {
      // 绘制填充
      styles.fills.forEach(fillStyle => {
        CanvasUtils.drawInnerPathFillWithScale(this.canvas, strokePoints[innermostStrokeCoordIndex], fillStyle, styles.strokes[innermostStrokeCoordIndex]);
      });
    }

    // 绘制边框
    strokePoints.forEach((points, index) => {
      CanvasUtils.drawPathStrokeWidthScale(this.canvas, points, styles.strokes[index], {
        isFold,
        miterLimit: DefaultLineMeterLimit,
      });
    });
  }
}
