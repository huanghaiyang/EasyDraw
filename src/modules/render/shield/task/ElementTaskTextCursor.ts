import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementText } from "@/types/IElement";
import { IElementTaskCursor } from "@/types/IRenderTask";
import { IPoint } from "@/types";
import CanvasUtils from "@/utils/CanvasUtils";
import CursorTextSvg from "@/assets/svg/cursor-text.svg";

export default class ElementTaskText extends ElementTaskBase implements IElementTaskCursor {
  cursor: IPoint;

  constructor(element: IElementText, params?: any) {
    super(element, params);
    this.cursor = params.cursor as IPoint;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;
    const { textCursor, angle, flipX, leanY, actualAngle } = this.element as IElementText;
    if (!textCursor) return;
    const { x: desX, y: desY, width: desWidth, height: desHeight, renderRect } = textCursor;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };
    // 绘制图片
    CanvasUtils.drawImgLike(
      this.canvas,
      CursorTextSvg,
      {
        ...renderRect,
        desX,
        desY,
        desWidth,
        desHeight,
      },
      {
        ...options,
      },
    );
  }
}
