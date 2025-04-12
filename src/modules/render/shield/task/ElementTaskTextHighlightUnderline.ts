import { IElementTaskTextHighlightUnderline } from "@/types/IRenderTask";
import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementText } from "@/types/IElement";
import CanvasUtils from "@/utils/CanvasUtils";
import ITextData, { ITextLine } from "@/types/IText";
import { RenderParams, RenderRect } from "@/types/IRender";
import { TextUnderLineColor, TextUnderLineColorOpacity, TextUnderLineWidth } from "@/styles/MaskStyles";
import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";

export default class ElementTaskTextHighlightUnderline extends ElementTaskBase implements IElementTaskTextHighlightUnderline {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    const {
      angle,
      flipX,
      leanY,
      actualAngle,
      model: { data },
    } = this.element as IElementText;

    // 渲染选项
    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const renderRect = ElementRenderHelper.calcElementRenderRect(this.element) as RenderRect;

    (data as ITextData).lines.forEach(textLine => {
      this._drawUnderline(textLine, renderRect, options);
    });
  }

  /**
   * 绘制下划线
   * @param textLine 文本行
   * @param renderRect 渲染矩形
   * @param options 渲染选项
   */
  private _drawUnderline(textLine: ITextLine, renderRect: RenderRect, options: RenderParams): void {
    const { nodes = [] } = textLine;
    if (nodes.length) {
      const { x, baseline } = nodes[0];
      const { x: dx, width: dWidth } = nodes[nodes.length - 1];
      CanvasUtils.drawLineInRenderRect(
        this.canvas,
        { ...renderRect, desX: x, desY: baseline, desWidth: dx + dWidth - x },
        {
          color: TextUnderLineColor,
          colorOpacity: TextUnderLineColorOpacity,
          width: TextUnderLineWidth,
        },
        options,
      );
    }
  }
}
