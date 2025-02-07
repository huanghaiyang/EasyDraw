import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import { TransformerSize, ControllerStyle } from "@/styles/MaskStyles";

export default class MaskTaskTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { strokeWidth } = ControllerStyle;
    const { scale, point, leanYAngle, actualAngle } = this.data;
    CanvasUtils.drawPathWithScale(
      this.canvas,
      CommonUtils.get4BoxPoints(
        point,
        {
          width: TransformerSize * scale,
          height: TransformerSize * scale,
        },
        {
          angle: actualAngle,
          leanYAngle,
        }
      ),
      Object.assign({}, ControllerStyle, {
        strokeWidth: strokeWidth * scale,
      }),
      {
        calcVertices: false,
      }
    );
  }
}
