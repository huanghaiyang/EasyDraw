import ElementUtils from "@/modules/elements/utils/ElementUtils";
import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementTaskEllipse extends ElementTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    const {
      innermostStrokeCoordIndex,
      unLeanStrokeCoords,
      model: {
        styles,
        styles: { strokes },
      },
      center,
      angle,
      flipX,
      leanY,
      actualAngle,
    } = this.element;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const unLeanStrokePoints = ElementUtils.batchCalcStageRelativePoints(unLeanStrokeCoords);
    const innermostStrokePoints = unLeanStrokePoints[innermostStrokeCoordIndex];
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
