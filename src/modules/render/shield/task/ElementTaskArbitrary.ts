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
      model: { styles, isFold },
    } = this.element;
    const strokePoints = ElementUtils.batchCalcStageRelativePoints(strokeCoords);

    if (isFold) {
      styles.fills.forEach(fillStyle => {
        CanvasUtils.drawInnerPathFillWithScale(this.canvas, strokePoints[innermostStrokeCoordIndex], fillStyle, styles.strokes[innermostStrokeCoordIndex]);
      });
    }

    strokePoints.forEach((points, index) => {
      CanvasUtils.drawPathStrokeWidthScale(this.canvas, points, styles.strokes[index], {
        isFold,
        miterLimit: DefaultLineMeterLimit,
      });
    });
  }
}
