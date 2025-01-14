import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { IMaskCircleTransformer } from "@/types/IRenderTask";
import { ControllerStyle } from "@/types/MaskStyles";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskCircleTransformer extends MaskTaskBase implements IMaskCircleTransformer {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.data.point) return;
    const { strokeWidth } = ControllerStyle;
    CanvasUtils.drawCircleStrokeWithScale(this.canvas, this.data.point, this.data.radius, Object.assign({}, ControllerStyle, {
      strokeWidth: strokeWidth * this.data.scale
    }));
  }
}