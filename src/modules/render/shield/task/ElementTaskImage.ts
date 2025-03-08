import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementImage } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class ElementTaskImage extends ElementTaskBase {
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
    } = this.element as IElementImage;

    const arcPoints = ElementUtils.batchCalcStageRelativeArcPoints(arcCoords);
    const rotateBoxPoints = ElementUtils.calcStageRelativePoints(rotateBoxCoords);
    const arcFillPoints = ElementUtils.calcStageRelativeArcPoints(arcFillCoords);

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    let rect = CommonUtils.calcRotateBoxRect(rotateBoxPoints, center);
    rect = CommonUtils.scaleRect(rect, this.element.shield.stageScale);

    // 绘制图片
    CanvasUtils.drawImgLike(this.canvas, this.element.model.data, rect, {
      ...options,
      clipArcPoints: arcFillPoints,
    });

    // 绘制边框
    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(this.canvas, points, rect, styles.strokes[index], options);
    });
  }
}
