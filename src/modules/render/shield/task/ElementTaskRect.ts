import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementRect } from "@/types/IElement";

export default class ElementTaskRect extends ElementTaskBase {
  get node() {
    return this.element as IElementRect;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const {
      innerestStrokePathPointsIndex,
      curvePathPoints,
      model: { styles },
    } = this.node;

    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerCurvePathFillWithScale(
        this.canvas,
        curvePathPoints[innerestStrokePathPointsIndex],
        fillStyle,
        styles.strokes[innerestStrokePathPointsIndex],
      );
    });

    curvePathPoints.forEach((curvePoints, index) => {
      CanvasUtils.drawCurvePathStrokeWidthScale(
        this.canvas,
        curvePoints,
        styles.strokes[index],
      );
    });
  }
}
