import ElementUtils from "@/modules/elements/utils/ElementUtils";
import IElement, { IElementRect } from "@/types/IElement";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";

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

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const arcPoints = ElementUtils.batchCalcStageRelativeArcPoints(arcCoords);
    const arcFillPoints = ElementUtils.calcStageRelativeArcPoints(arcFillCoords);

    const rect = ElementTaskHelper.getRotateBoxRect(element);
    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerArcPathFillWithScale(canvas, rect, arcFillPoints, fillStyle, options);
    });

    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(canvas, points, rect, styles.strokes[index], options);
    });
  }

  /**
   * 获取旋转盒模型的rect
   *
   * @param element
   * @returns
   */
  static getRotateBoxRect(element: IElement): Partial<DOMRect> {
    const { rotateBoxCoords, center } = element;
    let rect = CommonUtils.calcRotateBoxRect(rotateBoxCoords, center);
    rect = CommonUtils.scaleRect(rect, element.shield.stageScale);
    return rect;
  }
}
