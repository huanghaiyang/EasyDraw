import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementRect } from "@/types/IElement";
import { DefaultLineMeterLimit } from "@/styles/ElementStyles";

export default class ElementTaskArbitrary extends ElementTaskBase {
  get node() {
    return this.element as IElementRect;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const {
      innerestStrokePathPointsIndex,
      strokePathPoints,
      model: { styles, isFold },
    } = this.node;

    if (isFold) {
      styles.fills.forEach(fillStyle => {
        CanvasUtils.drawInnerPathFillWithScale(
          this.canvas,
          strokePathPoints[innerestStrokePathPointsIndex],
          fillStyle,
          styles.strokes[innerestStrokePathPointsIndex],
        );
      });
    }

    strokePathPoints.forEach((points, index) => {
      CanvasUtils.drawPathStrokeWidthScale(
        this.canvas,
        points,
        styles.strokes[index],
        {
          isFold,
          miterLimit: DefaultLineMeterLimit,
        },
      );
    });
  }
}
