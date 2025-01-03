import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import SplitV from "@/assets/svg/split-v.svg";
import { IIconModel } from "@/types/IModel";
import { IMaskBorderTransformerCursor } from "@/types/IRenderTask";

export default class MaskTaskBorderTransformerCursor extends MaskTaskBase implements IMaskBorderTransformerCursor {

  get data(): IIconModel {
    return this.model as IIconModel;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      const { point: { x, y }, width, height } = this.data;
      await CanvasUtils.drawImgLike(this.canvas, SplitV, {
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