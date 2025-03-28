import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementText } from "@/types/IElement";
import { IElementTaskCursor } from "@/types/IRenderTask";
import ElementTaskHelper from "./helpers/ElementTaskHelper";

export default class ElementTaskTextCursor extends ElementTaskBase implements IElementTaskCursor {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;
    ElementTaskHelper.drawTextCursor(this.element as IElementText, this.canvas, (this.element as IElementText).textCursor);
  }
}
