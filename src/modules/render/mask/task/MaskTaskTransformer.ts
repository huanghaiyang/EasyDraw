import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import { TransformerSize, ControllerStyle } from "@/types/MaskStyles";

export default class MaskTaskTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = ControllerStyle;
    CanvasUtils.drawPathWithScale(this.canvas, CommonUtils.get4BoxPoints(this.data.point, {
      width: TransformerSize * this.data.scale,
      height: TransformerSize * this.data.scale
    }, { angle: this.data.angle }), Object.assign({}, ControllerStyle, {
      strokeWidth: strokeWidth * this.data.scale
    }), {
      calcVertices: false
    });
  }
}