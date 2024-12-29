import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import RotateSvg from "@/assets/svg/rotate.svg";
import { IRotationModel } from "@/types/IModel";
import { IMaskRotate } from "@/types/IRenderTask";

export default class MaskTaskRotate extends MaskTaskBase implements IMaskRotate {

  get data(): IRotationModel {
    return this.model as IRotationModel;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      const { point: { x, y }, width, height } = this.data;
      await CanvasUtils.drawImgLike(this.canvas, RotateSvg, {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
      }, {
        angle: this.data.angle
      })
    }
  }

}