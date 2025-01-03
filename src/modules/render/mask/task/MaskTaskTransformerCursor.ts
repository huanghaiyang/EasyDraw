import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import ResizeV from "@/assets/svg/resize-v.svg";
import { IIconModel } from "@/types/IModel";
import { IMaskTransformerCursor } from "@/types/IRenderTask";

export default class MaskTaskTransformerCursor extends MaskTaskBase implements IMaskTransformerCursor {

  get data(): IIconModel {
    return this.model as IIconModel;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      const { point: { x, y }, width, height } = this.data;
      await CanvasUtils.drawImgLike(this.canvas, ResizeV, {
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