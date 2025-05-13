import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { SelectionIndicatorBgStyle, SelectionIndicatorStyle, SelectionIndicatorTextStyle } from "@/styles/MaskStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";
import { range } from "lodash";
import MathUtils from "@/utils/MathUtils";

const Padding = 4;
const RadiusValue = 4;

export default class MaskTaskIndicator extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;
    let { text, point, angle } = this.model;
    let { width, fontBoundingBoxDescent, fontBoundingBoxAscent } = CanvasUtils.measureText(this.canvas.getContext("2d"), text, SelectionIndicatorStyle);
    let height = fontBoundingBoxDescent + fontBoundingBoxAscent + Padding * 2;
    width += Padding * 2;
    width /= CanvasUtils.scale;
    height /= CanvasUtils.scale;
    point = ElementUtils.calcStageRelativePoint(point);
    const coords = CommonUtils.getBoxByCenter(point, { width, height });
    const renderRect = ElementRenderHelper.calcRenderRect(coords, point, CanvasUtils.scale);
    const arcPoints = CanvasUtils.getRadiusRectanglePaths(
      range(0, 4).map(_ => RadiusValue / CanvasUtils.scale),
      width,
      height,
      point,
    );
    const renderOptions = { angle };
    CanvasUtils.drawInnerArcPathFillWithScale(this.canvas, renderRect, arcPoints, SelectionIndicatorBgStyle, renderOptions);
    CanvasUtils.drawCommonRotateTextWithScale(this.canvas, text, MathUtils.translate(point, {x: 0, y: 1}), SelectionIndicatorStyle, SelectionIndicatorTextStyle, renderOptions);
  }
}
