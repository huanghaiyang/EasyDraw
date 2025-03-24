import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementImage } from "@/types/IElement";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { RenderRect } from "@/types/IRender";
import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";

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

    // 计算弧线的舞台坐标
    const arcPoints = ElementUtils.batchCalcStageRelativeArcPoints(arcCoords);
    // 计算弧线填充的舞台坐标
    const arcFillPoints = ElementUtils.calcStageRelativeArcPoints(arcFillCoords);

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    // 计算渲染盒模型的画布坐标
    const rect = ElementRenderHelper.calcElementRenderRect(this.element) as RenderRect;

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
