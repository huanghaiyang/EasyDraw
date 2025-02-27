import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import RotateSvg from "@/assets/svg/rotate.svg";
import { IRotationModel } from "@/types/IModel";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class MaskTaskRotate extends MaskTaskBase {
  get data(): IRotationModel {
    return this.model as IRotationModel;
  }

  get svg() {
    return RotateSvg;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      let { point, width, height, scale } = this.data;
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
          angle: this.data.angle,
        },
      );
    }
  }
}
