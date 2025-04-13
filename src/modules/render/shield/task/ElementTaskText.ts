import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementRect } from "@/types/IElement";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import CanvasUtils from "@/utils/CanvasUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import ITextData from "@/types/IText";
import { RenderRect } from "@/types/IRender";
import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";

export default class ElementTaskText extends ElementTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    ElementTaskHelper.drawArcRect(this.element as IElementRect, this.canvas);

    const {
      model: {
        styles: {
          fontStyler,
          fontSize,
          fontFamily,
          textAlign,
          textVerticalAlign,
          textBaseline,
          fontColor,
          fontColorOpacity,
          fontLineHeight,
          fontLetterSpacing,
          textDecoration,
          textDecorationColor,
          textDecorationOpacity,
          textDecorationThickness,
          paragraphSpacing,
        },
        data,
      },
      angle,
      flipX,
      leanY,
      actualAngle,
      unLeanBoxCoords,
    } = this.element;

    // 渲染选项
    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    // 计算未倾斜的描边舞台坐标
    const unLeanBoxPoints = ElementUtils.calcStageRelativePoints(unLeanBoxCoords);
    // 计算渲染盒模型的画布坐标
    const renderRect = ElementRenderHelper.calcElementRenderRect(this.element) as RenderRect;

    // 绘制文本
    CanvasUtils.drawRotateTextWithScale(
      this.canvas,
      data as ITextData,
      unLeanBoxPoints,
      renderRect,
      {
        fontStyler,
        fontSize,
        fontFamily,
        textAlign,
        textVerticalAlign,
        textBaseline,
        fontColor,
        fontColorOpacity,
        fontLineHeight,
        fontLetterSpacing,
        textDecoration,
        textDecorationColor,
        textDecorationOpacity,
        textDecorationThickness,
        paragraphSpacing,
      },
      options,
    );
  }
}
