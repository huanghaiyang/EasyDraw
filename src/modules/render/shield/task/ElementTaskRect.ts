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
      curvePoints,
      curveFillPoints,
      model: { styles },
    } = this.node;

    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerCurvePathFillWithScale(
        this.canvas,
        curveFillPoints,
        fillStyle,
      );
    });

    curvePoints.forEach((points, index) => {
      CanvasUtils.drawCurvePathStrokeWidthScale(
        this.canvas,
        points,
        styles.strokes[index],
      );
    });
  }
}
