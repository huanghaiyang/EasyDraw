import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementRect } from "@/types/IElement";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import CanvasUtils from "@/utils/CanvasUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import ITextData from "@/types/IText";

export default class ElementTaskText extends ElementTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    ElementTaskHelper.draw(this.element as IElementRect, this.canvas);

    const {
      model: {
        styles: { fontSize, fontFamily, textAlign, textBaseline, fontColor, fontColorOpacity, fontLineHeight },
        data,
      },
      angle,
      flipX,
      leanY,
      actualAngle,
      unLeanBoxCoords,
    } = this.element;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const unLeanBoxPoints = ElementUtils.calcStageRelativePoints(unLeanBoxCoords);
    const rect = ElementTaskHelper.getRotateBoxRect(this.element);

    CanvasUtils.drawRotateTextWithScale(
      this.canvas,
      data as ITextData,
      unLeanBoxPoints,
      rect,
      {
        fontSize,
        fontFamily,
        textAlign,
        textBaseline,
        fontColor,
        fontColorOpacity,
        fontLineHeight,
      },
      options,
    );
  }
}
