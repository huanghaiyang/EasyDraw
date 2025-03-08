import ElementUtils from "@/modules/elements/utils/ElementUtils";
import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { ControllerStyle } from "@/styles/MaskStyles";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskCircleTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;

    let { point } = this.model;

    if (!point) return;
    let { radius } = this.model;
    const strokeStyle = { ...ControllerStyle.strokes[0] };
    const fillStyle = { ...ControllerStyle.fills[0] };
    radius /= CanvasUtils.scale;
    point = ElementUtils.calcStageRelativePoint(point);

    CanvasUtils.drawEllipseFillWithScale(
      this.canvas,
      point,
      {
        rx: radius,
        ry: radius,
      },
      fillStyle,
    );

    CanvasUtils.drawEllipseStrokeWithScale(
      this.canvas,
      point,
      {
        rx: radius,
        ry: radius,
      },
      strokeStyle,
    );
  }
}
