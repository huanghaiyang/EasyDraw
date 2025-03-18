import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { ElementStatus, IPoint } from "@/types";
import ITextData, { ITextCursor } from "@/types/IText";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";

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
      this._textCursor.renderRect = ElementTaskHelper.calcElementRenderRect(this);
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
      // 如果文本组件是旋转或者倾斜的，那么就需要将给定的鼠标坐标，反向旋转倾斜，这样才可以正确计算出文本光标
      coord = MathUtils.transWithCenter(coord, this.angles, this.centerCoord, true);
      // 转换为舞台坐标
      const point = ElementUtils.calcStageRelativePoint(coord);
      // 计算旋转盒模型的rect
      const rect = ElementTaskHelper.calcElementRenderRect(this);
      // 获取文本光标
      this._textCursor = ElementTaskHelper.retrieveTextCursorAtPosition(this.model.data as ITextData, CommonUtils.scalePoint(point, this.shield.stageScale), rect);
    }
    return this._textCursor;
  }
}
