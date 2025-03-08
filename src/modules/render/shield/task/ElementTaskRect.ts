import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IElementRect } from "@/types/IElement";

export default class ElementTaskRect extends ElementTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    const {
      arcCoords,
      arcFillCoords,
      model: { styles },
      angle,
      flipX,
      leanY,
      actualAngle,
      rotateBoxCoords,
      center,
    } = this.element as IElementRect;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const arcPoints = ElementUtils.batchCalcStageRelativeArcPoints(arcCoords);
    const rotateBoxPoints = ElementUtils.calcStageRelativePoints(rotateBoxCoords);
    const arcFillPoints = ElementUtils.calcStageRelativeArcPoints(arcFillCoords);

    let rect = CommonUtils.calcRotateBoxRect(rotateBoxPoints, center);
    rect = CommonUtils.scaleRect(rect, this.element.shield.stageScale);

    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerArcPathFillWithScale(this.canvas, rect, arcFillPoints, fillStyle, options);
    });

    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(this.canvas, points, rect, styles.strokes[index], options);
    });
  }
}
