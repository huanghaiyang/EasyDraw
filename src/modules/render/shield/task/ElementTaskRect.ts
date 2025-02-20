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
      arcPoints,
      arcFillPoints,
      model: { styles },
    } = this.node;

    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerArcPathFillWithScale(
        this.canvas,
        arcFillPoints,
        fillStyle,
      );
    });

    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(
        this.canvas,
        points,
        styles.strokes[index],
      );
    });
  }
}
