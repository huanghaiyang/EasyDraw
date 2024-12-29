import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { CursorCanvasSize } from "@/types/Constants";
import CursorUtils from "@/utils/CursorUtils";
import { IMaskCursorModel } from "@/types/IModel";
import { IMaskCursor } from "@/types/IRenderTask";

export default class MaskTaskCursor extends MaskTaskBase implements IMaskCursor {

  get data(): IMaskCursorModel {
    return this.model as IMaskCursorModel;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      await CanvasUtils.drawImgLike(this.canvas, CursorUtils.getCursorSvg(this.data.creatorCategory), {
        x: this.data.point.x - CursorCanvasSize / 2,
        y: this.data.point.y - CursorCanvasSize / 2,
        width: CursorCanvasSize,
        height: CursorCanvasSize,
      })
    }
  }

}