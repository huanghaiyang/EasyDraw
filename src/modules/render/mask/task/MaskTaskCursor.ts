import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import CursorUtils from "@/utils/CursorUtils";
import { IMaskCursorModel } from "@/types/IModel";
import { IMaskCursor } from "@/types/IRenderTask";
import { DefaultCursorSize } from "@/types/MaskStyles";

export default class MaskTaskCursor extends MaskTaskBase implements IMaskCursor {

  get data(): IMaskCursorModel {
    return this.model as IMaskCursorModel;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    if (this.canvas) {
      const { point: { x, y }, scale } = this.data;
      const width = DefaultCursorSize;
      const height = DefaultCursorSize;
      await CanvasUtils.drawImgLike(this.canvas, CursorUtils.getCursorSvg(this.data.creatorCategory), {
        x: (x - width * scale / 2) / scale,
        y: (y - height * scale / 2) / scale,
        width,
        height,
      })
    }
  }

}