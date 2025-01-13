import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import { IMaskModel } from "@/types/IModel";
import { IMaskTransformer } from "@/types/IRenderTask";
import { DefaultTransformerValue, DefaultControllerStyle } from "@/types/MaskStyles";

export default class MaskTaskTransformer extends MaskTaskBase implements IMaskTransformer {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = DefaultControllerStyle;
    CanvasUtils.drawPathWithScale(this.canvas, CommonUtils.get4BoxPoints(this.data.point, {
      width: DefaultTransformerValue * this.data.scale,
      height: DefaultTransformerValue * this.data.scale
    }, { angle: this.data.angle }), Object.assign({}, DefaultControllerStyle, {
      strokeWidth: strokeWidth * this.data.scale
    }));
  }
}