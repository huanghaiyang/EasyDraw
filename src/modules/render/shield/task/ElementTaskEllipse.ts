import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementEllipse } from "@/types/IElement";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementTaskEllipse extends ElementTaskBase {
  get node() {
    return this.element as IElementEllipse;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const {
      innermostStrokePointsIndex,
      unLeanStrokePoints,
      model: {
        styles,
        styles: { strokes },
      },
      center,
      angle,
      flipX,
      leanY,
      actualAngle,
    } = this.node;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const innermostStrokePoints =
      unLeanStrokePoints[innermostStrokePointsIndex];
    const rect = CommonUtils.getRect(innermostStrokePoints);

    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawEllipseFillWithScale(
        this.canvas,
        center,
        {
          rx: rect.width / 2,
          ry: rect.height / 2,
        },
        fillStyle,
        rect,
        options,
      );
    });

    unLeanStrokePoints.forEach((points, index) => {
      const rect = CommonUtils.getRect(points);
      CanvasUtils.drawEllipseStrokeWithScale(
        this.canvas,
        center,
        {
          rx: rect.width / 2,
          ry: rect.height / 2,
        },
        strokes[index],
        rect,
        options,
      );
    });
  }
}
