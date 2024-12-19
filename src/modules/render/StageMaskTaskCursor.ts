import { IStageMaskTaskCursor, IStageMaskTaskCursorObj } from "@/types";
import StageMaskTaskBase from "@/modules/render/StageMaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { CursorCanvasSize } from "@/types/constants";
import CursorUtils from "@/utils/CursorUtils";

export default class StageMaskTaskCursor extends StageMaskTaskBase implements IStageMaskTaskCursor {

  get data() {
    return this.obj as IStageMaskTaskCursorObj;
  }

  /**
   * 运行绘制任务
   */
  async run(): Promise<void> {
    const canvas = this.getCanvas();
    if (canvas) {
      await CanvasUtils.drawImgLike(canvas, CursorUtils.getCursorSvg(this.data.creatorCategory), {
        x: this.data.point.x - CursorCanvasSize / 2,
        y: this.data.point.y - CursorCanvasSize / 2,
        width: CursorCanvasSize,
        height: CursorCanvasSize,
      })
    }
  }

}