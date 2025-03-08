import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import RotateSvg from "@/assets/svg/rotate.svg";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IRotationModel } from "@/types/IModel";

export default class MaskTaskRotate extends MaskTaskBase {
  get svg() {
    return RotateSvg;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;
    let { point, width, height, scale } = this.model as IRotationModel;
    point = ElementUtils.calcStageRelativePoint(point);

    await CanvasUtils.drawImgLike(
      this.canvas,
      this.svg,
      {
        x: (point.x - (width * scale) / 2) / scale,
        y: (point.y - (height * scale) / 2) / scale,
        width,
        height,
      },
      {
        angle: this.model.angle,
      },
    );
  }
}
