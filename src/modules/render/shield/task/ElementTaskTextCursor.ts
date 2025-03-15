import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementText } from "@/types/IElement";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import { IElementTaskCursor } from "@/types/IRenderTask";
import { IPoint } from "@/types";

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

    const rect = ElementTaskHelper.getRotateBoxRect(this.element);
    const textCursor = ElementTaskHelper.getCursorPositionOfTextElement(this.element as IElementText, this.cursor, rect);
  }
}
