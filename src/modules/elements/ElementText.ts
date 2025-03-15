import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { ElementStatus, IPoint } from "@/types";
import { ITextCursor } from "@/types/IText";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class ElementText extends ElementRect implements IElementText {
  get editingEnable(): boolean {
    return true;
  }
  // 文本光标
  private _textCursor: ITextCursor;

  get textCursor(): ITextCursor {
    return this._textCursor;
  }

  // 是否启用控制器
  get transformersEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  /**
   * 给定坐标获取文本光标
   *
   * @param coord 坐标
   * @returns 文本光标
   */
  hitCursor(coord: IPoint): ITextCursor {
    const point = ElementUtils.calcStageRelativePoint(coord);
    const rect = ElementTaskHelper.getRotateBoxRect(this);
    this._textCursor = ElementTaskHelper.getCursorPositionOfTextElement(this, point, rect);
    return this._textCursor;
  }
}
