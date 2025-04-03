import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import { TransformerSize, ControllerStyle } from "@/styles/MaskStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class MaskTaskTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;
    const { width } = ControllerStyle.strokes[0];
    let { point, leanYAngle, actualAngle } = this.model;
    point = ElementUtils.calcStageRelativePoint(point);

    CanvasUtils.drawPathWithScale(
      this.canvas,
      CommonUtils.getBoxByCenter(
        point,
        {
          width: TransformerSize / CanvasUtils.scale,
          height: TransformerSize / CanvasUtils.scale,
        },
        {
          angle: actualAngle,
          leanYAngle,
        },
      ),
      ControllerStyle,
      ControllerStyle.fills[0],
      {
        ...ControllerStyle.strokes[0],
        width: width / CanvasUtils.scale,
      },
      {
        calcVertices: false,
      },
    );
  }
}
