import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementRect } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";

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
      angle,
      flipX,
      leanY,
      actualAngle,
      rotateBoxPoints,
      center,
    } = this.node;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };
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
