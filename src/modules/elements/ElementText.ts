import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { ElementStatus, IPoint } from "@/types";
import ITextData, { ITextCursor, ITextSelection } from "@/types/IText";
import ElementTaskHelper from "@/modules/render/shield/task/helpers/ElementTaskHelper";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { every } from "lodash";

export default class ElementText extends ElementRect implements IElementText {
  // 文本光标
  private _textCursor: ITextCursor;
  // 文本选区
  private _textSelection: ITextSelection;

  get editingEnable(): boolean {
    return true;
  }

  get textCursor(): ITextCursor {
    return this._textCursor;
  }

  get textSelection(): ITextSelection {
    return this._textSelection;
  }

  get isSelectionAvailable(): boolean {
    return !!this._textSelection && every(this._textSelection, node => !!node);
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
    this._textSelection = null;
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
   * @param isSelectionMove 是否是选区移动
   */
  retrieveTextCursor(coord: IPoint, isSelectionMove?: boolean): void {
    // 如果文本组件不包含给定的坐标，那么就将文本光标和选区都设置为空
    if (!this.isContainsCoord(coord)) {
      this._textCursor = null;
      this._textSelection = null;
      return;
    }
    // 如果文本组件是旋转或者倾斜的，那么就需要将给定的鼠标坐标，反向旋转倾斜，这样才可以正确计算出文本光标
    coord = MathUtils.transWithCenter(coord, this.angles, this.centerCoord, true);
    // 转换为舞台坐标
    const point = ElementUtils.calcStageRelativePoint(coord);
    // 计算旋转盒模型的rect
    const rect = ElementTaskHelper.calcElementRenderRect(this);
    // 获取文本光标
    const textCursor = ElementTaskHelper.retrieveTextCursorAtPosition(this.model.data as ITextData, CommonUtils.scalePoint(point, this.shield.stageScale), rect, this.flipX);
    // 更新选区
    if (isSelectionMove) {
      this._textSelection.endNode = textCursor;
    } else {
      this._textCursor = textCursor;
      this._textSelection = {
        startNode: textCursor,
        endNode: null,
      };
    }
  }
}
