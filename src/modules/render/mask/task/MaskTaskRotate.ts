import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import RotateSvg from "@/assets/svg/rotate.svg";
import { IRotationModel } from "@/types/IModel";

export default class MaskTaskRotate extends MaskTaskBase {
  get data(): IRotationModel {
    return this.model as IRotationModel;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      let {
        point: { x, y },
        width,
        height,
        scale,
      } = this.data;
      await CanvasUtils.drawImgLike(
        this.canvas,
        RotateSvg,
        {
          x: (x - (width * scale) / 2) / scale,
          y: (y - (height * scale) / 2) / scale,
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
