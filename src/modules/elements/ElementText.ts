import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { ElementStatus, IPoint } from "@/types";
import ITextData, { ITextCursor } from "@/types/IText";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementText extends ElementRect implements IElementText {
  // 文本光标
  private _textCursor: ITextCursor;

  get editingEnable(): boolean {
    return true;
  }

  get textCursor(): ITextCursor {
    return this._textCursor;
  }

  // 是否启用控制器
  get transformersEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get cornerEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  _setIsEditing(value: boolean): void {
    super._setIsEditing(value);
    this._textCursor = null;
  }

  /**
   * 舞台状态变化
   */
  onStageChanged(): void {
    super.onStageChanged();
    if (this._textCursor) {
      const updatedProps = ElementTaskHelper.getUpdatedTextCursorProps(this.model.data as ITextData, this._textCursor);
      Object.assign(this._textCursor, updatedProps);
      this._textCursor.rotateBoxRect = ElementTaskHelper.calculateRotatedBoxRect(this);
    }
  }

  /**
   * 给定坐标获取文本光标
   *
   * @param coord 坐标
   * @returns 文本光标
   */
  hitCursor(coord: IPoint): ITextCursor {
    if (!this.isContainsCoord(coord)) {
      this._textCursor = null;
    } else {
      const point = ElementUtils.calcStageRelativePoint(coord);
      const rect = ElementTaskHelper.calculateRotatedBoxRect(this);
      this._textCursor = ElementTaskHelper.retrieveTextCursorAtPosition(this.model.data as ITextData, CommonUtils.scalePoint(point, this.shield.stageScale), rect);
    }
    return this._textCursor;
  }
}
