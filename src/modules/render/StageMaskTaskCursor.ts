import { CreatorCategories, IStageMaskTaskCursor, IStageMaskTaskCursorObj } from "@/types";
import CrossSvg from '@/assets/Cross.svg';
import StageMaskTaskBase from "@/modules/render/StageMaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { CursorCanvasSize } from "@/types/constants";

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
      await CanvasUtils.drawImgLike(canvas, this.getCreatorIcon(), {
        x: this.data.point.x - CursorCanvasSize / 2,
        y: this.data.point.y - CursorCanvasSize / 2,
        width: CursorCanvasSize,
        height: CursorCanvasSize,
      })
    }
  }

  /**
   * 获取图标
   * 
   * @returns 
   */
  getCreatorIcon(): string {
    switch (this.data.creatorCategory) {
      case CreatorCategories.shapes:
        return CrossSvg;
      default:
        return CrossSvg;
    }
  }

}