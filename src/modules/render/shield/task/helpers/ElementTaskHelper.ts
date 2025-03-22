import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IElementRect } from "@/types/IElement";
import { RenderRect } from "@/types/IRender";
import CanvasUtils from "@/utils/CanvasUtils";

export default class ElementTaskHelper {
  /**
   * 绘制
   *
   * @param element
   * @param canvas
   */
  static draw(element: IElementRect, canvas: HTMLCanvasElement): void {
    const {
      arcCoords,
      arcFillCoords,
      model: { styles },
      angle,
      flipX,
      leanY,
      actualAngle,
    } = element;
    // 渲染选项
    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };
    // 计算弧线的舞台坐标
    const arcPoints = ElementUtils.batchCalcStageRelativeArcPoints(arcCoords);
    // 计算弧线填充的舞台坐标
    const arcFillPoints = ElementUtils.calcStageRelativeArcPoints(arcFillCoords);
    // 计算渲染盒子的画布坐标
    const rect = ElementRenderHelper.calcElementRenderRect(element) as RenderRect;
    // 绘制填充
    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerArcPathFillWithScale(canvas, rect, arcFillPoints, fillStyle, options);
    });
    // 绘制边框
    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(canvas, points, rect, styles.strokes[index], options);
    });
  }
}
