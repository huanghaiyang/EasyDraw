import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementRect } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class ElementTaskRect extends ElementTaskBase {
  get node() {
    return this.element as IElementRect;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
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
    } = this.node;

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
    rect = CommonUtils.scaleRect(rect, this.node.shield.stageScale);

    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerArcPathFillWithScale(this.canvas, rect, arcFillPoints, fillStyle, options);
    });

    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(this.canvas, points, rect, styles.strokes[index], options);
    });
  }
}
