import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import RotateSvg from "@/assets/svg/rotate.svg";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IRotationModel } from "@/types/IModel";
import { RenderRect } from "@/types/IRender";

export default class MaskTaskRotate extends MaskTaskBase {
  get svg() {
    return RotateSvg;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;
    let { point, width, height } = this.model as IRotationModel;
    point = ElementUtils.calcStageRelativePoint(point);

    await CanvasUtils.drawImgLike(
      this.canvas,
      this.svg,
      {
        x: (point.x - width / CanvasUtils.scale / 2) * CanvasUtils.scale,
        y: (point.y - height / CanvasUtils.scale / 2) * CanvasUtils.scale,
        width,
        height,
      } as RenderRect,
      {
        angle: this.model.angle,
      },
    );
  }
}
