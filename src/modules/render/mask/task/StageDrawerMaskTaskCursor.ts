import { IStageDrawerMaskTaskCursor, IStageDrawerMaskTaskCursorObj } from "@/types";
import StageDrawerMaskTaskBase from "@/modules/render/mask/task/StageDrawerMaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { CursorCanvasSize } from "@/types/constants";
import CursorUtils from "@/utils/CursorUtils";

export default class StageDrawerMaskTaskCursor extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskCursor {

  get data(): IStageDrawerMaskTaskCursorObj {
    return this.obj as IStageDrawerMaskTaskCursorObj;
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