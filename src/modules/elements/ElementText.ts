import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { ElementStatus, IPoint, TextEditingStates } from "@/types";
import ITextData, { ITextCursor, ITextSelection } from "@/types/IText";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { every, isString } from "lodash";
import LodashUtils from "@/utils/LodashUtils";
import CoderUtils from "@/utils/CoderUtils";
import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";
import TextElementUtils from "@/modules/elements/utils/TextElementUtils";

export default class ElementText extends ElementRect implements IElementText {
  // 文本光标
  private _textCursor: ITextCursor;
  // 文本选区
  private _textSelection: ITextSelection;
  // 光标可见状态
  private _cursorVisibleStatus: boolean;
  // 光标可见计时器
  private _cursorVisibleTimer: number;

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
    return !!this._textSelection && every(this._textSelection, node => !!node) && TextElementUtils.isTextSelectionAvailable(this._textSelection);
  }

  get isCursorVisible(): boolean {
    return !!this._textCursor && !this.isSelectionAvailable && this._cursorVisibleStatus;
  }

  // 是否启用控制器
  get transformersEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get cornerEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get text(): string {
    return TextElementUtils.getTextFromTextData(this.model.data as ITextData);
  }

  /**
   * 设置编辑状态
   *
   * @param value 编辑状态
   */
  _setIsEditing(value: boolean): void {
    super._setIsEditing(value);
    this._textCursor = null;
    this._textSelection = null;
    this._cursorVisibleStatus = false;
    this._toggleCursorVisibleTimer(value);
  }

  /**
   * 切换光标可见状态计时
   */
  private _toggleCursorVisibleTimer(value: boolean): void {
    if (value) {
      this._startCursorVisibleTimer();
    } else {
      this._clearCursorVisibleTimer();
    }
  }

  /**
   * 开始光标可见状态计时
   */
  private _startCursorVisibleTimer(): void {
    if (this._cursorVisibleTimer) return;
    this._cursorVisibleTimer = setInterval(() => {
      this._cursorVisibleStatus = !this._cursorVisibleStatus;
    }, 400);
  }

  /**
   * 清除光标可见状态计时
   */
  private _clearCursorVisibleTimer(): void {
    if (this._cursorVisibleTimer) {
      clearInterval(this._cursorVisibleTimer);
      this._cursorVisibleTimer = null;
    }
  }

  /**
   * 舞台状态变化
   */
  onStageChanged(): void {
    super.onStageChanged();
    if (this._textCursor) {
      const updatedProps = TextElementUtils.getUpdatedTextCursorProps(this.model.data as ITextData, this._textCursor);
      Object.assign(this._textCursor, updatedProps);
      this._textCursor.renderRect = ElementRenderHelper.calcElementRenderRect(this);
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
    const rect = ElementRenderHelper.calcElementRenderRect(this);
    // 获取文本光标
    const textCursor = TextElementUtils.retrieveTextCursorAtPosition(this.model.data as ITextData, CommonUtils.scalePoint(point, this.shield.stageScale), rect, this.flipX);
    // 如果文本光标存在，那么就更新选区和光标状态
    if (textCursor) {
      if (isSelectionMove) {
        this._textSelection.endCursor = textCursor;
        this._cursorVisibleStatus = false;
      } else {
        this._textCursor = textCursor;
        this._textSelection = {
          startCursor: textCursor,
          endCursor: null,
        };
      }
      this._cursorVisibleStatus = true;
      this._clearCursorVisibleTimer();
      this._startCursorVisibleTimer();
    }
  }

  /**
   * 更新文本
   *
   * @param value 文本
   * @param states 文本编辑状态
   */
  updateText(value: string, states: TextEditingStates): void {
    console.log("updateText", value, states);
    if (isString(value)) {
      const textData = LodashUtils.jsonClone(this.model.data as ITextData);
      const { keyCode } = states;
      if (CoderUtils.isDeleterKey(keyCode)) {
        textData.lines = textData.lines.filter(line => !line.selected);
        textData.lines.forEach(line => {
          line.nodes = line.nodes.filter(node => !node.selected);
        });
      }
      this.model.data = textData;
    }
  }
}
