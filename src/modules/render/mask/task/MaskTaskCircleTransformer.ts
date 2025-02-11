import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { ControllerStyle } from "@/styles/MaskStyles";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskCircleTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.data.point) return;
    const { strokeWidth } = ControllerStyle;
    CanvasUtils.drawCircleStrokeWithScale(
      this.canvas,
      this.data.point,
      this.data.radius,
      Object.assign({}, ControllerStyle, {
        strokeWidth: strokeWidth * this.data.scale,
      }),
    );
  }
}
