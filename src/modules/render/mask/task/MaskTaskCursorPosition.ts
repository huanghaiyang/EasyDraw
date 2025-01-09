import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IMaskCursorPositionModel } from "@/types/IModel";
import { IMaskCursorPosition } from "@/types/IRenderTask";
import { DefaultCursorPositionStyle } from "@/types/MaskStyles";

export default class MaskTaskCursorPosition extends MaskTaskBase implements IMaskCursorPosition {

  get data(): IMaskCursorPositionModel {
    return this.model as IMaskCursorPositionModel;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      await CanvasUtils.drawRotateTextWithScale(this.canvas, this.data.text, this.data.point, DefaultCursorPositionStyle)
    }
  }

}