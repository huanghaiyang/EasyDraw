import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CursorUtils from "@/utils/CursorUtils";
import { IMaskCursorModel } from "@/types/IModel";
import { IMaskCursor } from "@/types/IRenderTask";
import { CursorSize } from "@/types/MaskStyles";

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
        x: this.data.point.x - CursorSize / 2,
        y: this.data.point.y - CursorSize / 2,
        width: CursorSize,
        height: CursorSize,
      })
    }
  }

}