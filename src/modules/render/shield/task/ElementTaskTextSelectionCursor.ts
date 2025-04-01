import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementText } from "@/types/IElement";
import { IElementTaskTextSelectionCursor } from "@/types/IRenderTask";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import { TextSelectionCursorType } from "@/types/IText";

export default class ElementTaskTextSelectionCursor extends ElementTaskBase implements IElementTaskTextSelectionCursor {
  cursorType: TextSelectionCursorType;

  constructor(element: IElementText, canvas: HTMLCanvasElement, cursorType: TextSelectionCursorType) {
    super(element, canvas);
    this.cursorType = cursorType;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;
    const { textSelection } = this.element as IElementText;
    const cursor = textSelection[this.cursorType === TextSelectionCursorType.START ? "startCursor" : "endCursor"];
    ElementTaskHelper.drawTextCursor(this.element as IElementText, this.canvas, cursor);
  }
}
