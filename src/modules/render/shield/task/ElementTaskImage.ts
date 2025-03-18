import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementImage } from "@/types/IElement";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import { RenderRect } from "@/types/IRender";

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
    } = this.element as IElementImage;

    const arcPoints = ElementUtils.batchCalcStageRelativeArcPoints(arcCoords);
    const arcFillPoints = ElementUtils.calcStageRelativeArcPoints(arcFillCoords);

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const rect = ElementTaskHelper.calcElementRenderRect(this.element) as RenderRect;

    // 绘制图片
    CanvasUtils.drawImgLike(this.canvas, this.element.model.data as string, rect, {
      ...options,
      clipArcPoints: arcFillPoints,
    });

    // 绘制边框
    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(this.canvas, points, rect, styles.strokes[index], options);
    });
  }
}
