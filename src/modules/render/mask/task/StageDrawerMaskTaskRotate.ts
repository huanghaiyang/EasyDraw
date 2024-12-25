import { IStageDrawerMaskTaskRotate, IStageDrawerMaskTaskRotateModel } from "@/types";
import StageDrawerMaskTaskBase from "@/modules/render/mask/task/StageDrawerMaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import RotateSvg from "@/assets/svg/rotate.svg";

export default class StageDrawerMaskTaskRotate extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskRotate {

  get data(): IStageDrawerMaskTaskRotateModel {
    return this.model as IStageDrawerMaskTaskRotateModel;
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