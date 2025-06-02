import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import { TransformerSize } from "@/styles/MaskStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class MaskTaskTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;
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
      this.styles.fills[0],
      this.styles.strokes[0],
      {
        calcVertices: false,
      },
    );
  }
}
