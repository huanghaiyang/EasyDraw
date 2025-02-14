import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementReact } from "@/types/IElement";

export default class ElementTaskRect extends ElementTaskBase {
  get node() {
    return this.element as IElementReact;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const {
      innerestStrokePathPointsIndex,
      strokePathPoints,
      model: { styles },
    } = this.node;

    CanvasUtils.drawInnerPathFillWithScale(
      this.canvas,
      strokePathPoints[innerestStrokePathPointsIndex],
      styles,
      styles.strokes[innerestStrokePathPointsIndex],
    );

    strokePathPoints.forEach((points, index) => {
      CanvasUtils.drawPathStrokeWidthScale(
        this.canvas,
        points,
        styles.strokes[index],
      );
    });
  }
}
