import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { ControllerStyle } from "@/styles/MaskStyles";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskCircleTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.data.point) return;
    const strokeStyle = { ...ControllerStyle.strokes[0] };
    const fillStyle = { ...ControllerStyle.fills[0] };
    const { width } = strokeStyle;

    CanvasUtils.drawCircleFillWithScale(
      this.canvas,
      this.data.point,
      this.data.radius,
      Object.assign({}, fillStyle, {
        width: width * this.data.scale,
      }),
    );

    CanvasUtils.drawCircleStrokeWithScale(
      this.canvas,
      this.data.point,
      this.data.radius,
      Object.assign({}, strokeStyle, {
        width: width * this.data.scale,
      }),
    );
  }
}
