import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementRect } from "@/types/IElement";
import { DefaultLineMeterLimit } from "@/styles/ElementStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class ElementTaskArbitrary extends ElementTaskBase {
  get node() {
    return this.element as IElementRect;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.node) return;
    
    let {
      innermostStrokeCoordIndex,
      strokeCoords,
      model: { styles, isFold },
    } = this.node;
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
