import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { Direction, ElementStatus, IPoint, TextEditingStates } from "@/types";
import ITextData, { ITextCursor, ITextSelection } from "@/types/IText";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { every } from "lodash";
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
   * 更新光标
   *
   * @param cursor 文本光标
   */
  private _updateCursor(cursor: ITextCursor): void {
    if (!cursor) return;
    const updatedProps = TextElementUtils.getUpdatedCursorProps(this.model.data as ITextData, cursor);
    if (updatedProps) {
      Object.assign(cursor, updatedProps);
    }
  }

  /**
   * 舞台状态变化
   */
  onStageChanged(): void {
    super.onStageChanged();
    if (this._textCursor) {
      this._updateCursor(this._textCursor);
      this._rerefreshCursorRenderRect();
    }
  }

  /**
   * 给定坐标获取文本光标
   *
   * @param coord 坐标
   * @param isSelectionMove 是否是选区移动
   */
  refreshTextCursorAtPosition(coord: IPoint, isSelectionMove?: boolean): void {
    TextElementUtils.markTextUnselected(this.model.data as ITextData);
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
    const textCursor = TextElementUtils.getTextCursorAtPosition(this.model.data as ITextData, CommonUtils.scalePoint(point, this.shield.stageScale), rect, this.flipX);
    // 如果文本光标存在，那么就更新选区和光标状态
    if (textCursor) {
      if (isSelectionMove) {
        this._textSelection.endCursor = textCursor;
        this._cursorVisibleStatus = false;
        TextElementUtils.markTextSelected(this.model.data as ITextData, this._textSelection);
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
   * 刷新文本光标
   */
  refreshTextCursors(): void {
    this._updateCursor(this._textCursor);
    this._updateCursor(this._textSelection?.endCursor);
    this._rerefreshCursorRenderRect();
  }

  /**
   * 更新文本
   *
   * @param value 文本
   * @param states 文本编辑状态
   */
  updateText(value: string, states: TextEditingStates): void {
    console.log("updateText", value, states);
    const textData = LodashUtils.jsonClone(this.model.data as ITextData);
    const { keyCode } = states;
    // 如果是删除键，则删除光标所在的文本节点
    if (CoderUtils.isDeleterKey(keyCode)) {
      this._deleteAtCursor(textData);
    } else if (CoderUtils.isArrowLeft(keyCode)) {
      this._moveCursorTo(Direction.LEFT, states);
    } else if (CoderUtils.isArrowRight(keyCode)) {
      this._moveCursorTo(Direction.RIGHT, states);
    } else if (CoderUtils.isArrowUp(keyCode)) {
      this._moveCursorTo(Direction.TOP, states);
    } else if (CoderUtils.isArrowDown(keyCode)) {
      this._moveCursorTo(Direction.BOTTOM, states);
    }
    this.model.data = textData;
    this._rerefreshCursorRenderRect();
  }

  /**
   * 移动光标
   *
   * @param direction 方向
   * @param states 文本编辑状态
   */
  private _moveCursorTo(direction: Direction, states: TextEditingStates): void {
    const textData = this.model.data as ITextData;
    const { shiftKey } = states;
    let prevTextCursor = this._textCursor;
    if (this.isSelectionAvailable) {
      if (!shiftKey) {
        const [minCursor, maxCursor] = TextElementUtils.sortCursors(textData, [this._textSelection.startCursor, this._textSelection.endCursor]);
        switch (direction) {
          case Direction.LEFT:
          case Direction.TOP:
            this._textCursor = minCursor;
            break;
          case Direction.RIGHT:
          case Direction.BOTTOM:
            this._textCursor = maxCursor;
            break;
        }
        this._textSelection = null;
        TextElementUtils.markTextUnselected(textData);
        return;
      }
      prevTextCursor = this._textSelection.endCursor;
    }
    const { nodeId, lineNumber, pos } = prevTextCursor;
    let textCursor: ITextCursor;
    const line = textData.lines[lineNumber];
    // 如果光标在节点后面，则将光标移动到节点后面
    if (nodeId) {
      const nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
      switch (direction) {
        case Direction.LEFT:
          if (pos === Direction.RIGHT) {
            textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex], Direction.LEFT, lineNumber);
          } else if (nodeIndex > 0) {
            textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex - 1], Direction.LEFT, lineNumber);
          } else if (lineNumber > 0) {
            textCursor = TextElementUtils.getCursorOfLineEnd(textData.lines[lineNumber - 1], lineNumber - 1);
          }
          break;
        case Direction.RIGHT:
          if (pos === Direction.LEFT) {
            textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex], Direction.RIGHT, lineNumber);
          } else if (nodeIndex < line.nodes.length - 1) {
            textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex + 1], Direction.RIGHT, lineNumber);
          } else if (lineNumber < textData.lines.length - 1) {
            textCursor = TextElementUtils.getCursorOfLineStart(textData.lines[lineNumber + 1], lineNumber + 1);
          }
          break;
        case Direction.TOP:
          break;
        case Direction.BOTTOM:
          break;
      }
    } else {
      switch (direction) {
        case Direction.LEFT:
          if (lineNumber > 0) {
            textCursor = TextElementUtils.getCursorOfLineEnd(textData.lines[lineNumber - 1], lineNumber - 1);
          }
          break;
        case Direction.RIGHT:
          if (lineNumber < textData.lines.length - 1) {
            textCursor = TextElementUtils.getCursorOfLineStart(textData.lines[lineNumber + 1], lineNumber + 1);
          }
          break;
        case Direction.TOP:
          break;
        case Direction.BOTTOM:
          break;
      }
    }
    if (textCursor) {
      if (shiftKey) {
        this._textSelection = {
          startCursor: this._textCursor,
          endCursor: textCursor,
        };
        TextElementUtils.markTextSelected(textData, this._textSelection);
      } else {
        this._textCursor = textCursor;
        this._textSelection = null;
      }
    }
  }
  /**
   * 刷新光标渲染矩形
   */
  private _rerefreshCursorRenderRect(): void {
    const rect = ElementRenderHelper.calcElementRenderRect(this);
    if (this._textCursor) {
      this._textCursor.renderRect = rect;
    }
    if (this._textSelection && this._textSelection.endCursor) {
      this._textSelection.endCursor.renderRect = rect;
    }
  }

  /**
   * 删除光标所在的文本节点
   *
   * 注意：
   * 1. 非选区时，尽量将光标绑定到节点的右侧
   * 2. 如果是选区，则起始光标需要绑定到节点的左侧，结束光标需要绑定到节点的右侧
   *
   * @param textData 文本数据
   */
  private _deleteAtCursor(textData: ITextData) {
    // 如果选区可用，则删除选区中的文本节点
    if (this.isSelectionAvailable) {
      textData.lines = textData.lines.filter(line => !line.selected);
      textData.lines.forEach(line => {
        line.nodes = line.nodes.filter(node => !node.selected);
      });
    } else {
      const { nodeId, lineNumber, pos } = this._textCursor;
      // 获取前一行行号
      const prevLineNumber = lineNumber - 1;
      // 如果光标是在节点后面，则删除光标前面的文本节点
      if (nodeId) {
        const nodeIndex = textData.lines[lineNumber].nodes.findIndex(node => node.id === nodeId);

        // 光标在节点的左侧
        if (pos === Direction.LEFT) {
          // 表示光标在第一个节点上,且不是第一行,则删除当前行,并将其内容与前一行合并
          if (nodeIndex === 0) {
            if (lineNumber !== 0) {
              // 获取前一行
              const prevLine = textData.lines[prevLineNumber];
              // 获取前一行的节点数量
              const prevLineNodeSize = prevLine.nodes.length;
              // 将当前行的内容与前一行合并
              prevLine.nodes.push(...textData.lines[lineNumber].nodes);
              // 删除当前行
              textData.lines.splice(lineNumber, 1);
              // 如果前一行有节点,则将光标移动到前一行的末尾,否则将光标移动到前一行的开头
              if (prevLineNodeSize > 0) {
                // 获取前一行的最后一个节点
                const node = prevLine.nodes[prevLineNodeSize - 1];
                // 将光标移动到前一行的末尾
                this._textCursor = TextElementUtils.getCursorOfNode(node, Direction.RIGHT, prevLineNumber);
              } else {
                // 将光标移动到前一行的开头
                this._textCursor = TextElementUtils.getCursorOfLineStart(prevLine, prevLineNumber);
              }
            }
          } else {
            // 删除光标前面的文本节点
            textData.lines[lineNumber].nodes.splice(nodeIndex - 1, 1);
            // 更新光标位置
            this._textCursor = TextElementUtils.getCursorOfNode(textData.lines[lineNumber].nodes[nodeIndex - 1], Direction.LEFT, lineNumber);
          }
        } else {
          // 删除光标绑定的文本节点
          textData.lines[lineNumber].nodes.splice(nodeIndex, 1);
          // 更新光标位置
          if (nodeIndex === 0) {
            this._textCursor = TextElementUtils.getCursorOfLineStart(textData.lines[lineNumber], lineNumber);
          } else {
            this._textCursor = TextElementUtils.getCursorOfNode(textData.lines[lineNumber].nodes[nodeIndex - 1], Direction.RIGHT, lineNumber);
          }
        }
      } else {
        if (textData.lines.length === 1) {
          // 如果只有一行，则清空文本数据
          textData.lines[0].nodes = [];
          // 将光标移动到第一行的开头
          this._textCursor = TextElementUtils.getCursorOfLineStart(textData.lines[0], 0);
        } else {
          // 光标所在的是空行，则删除空行
          textData.lines.splice(this._textCursor.lineNumber, 1);
          // 如果不是第一行，则将光标移动到前一行的末尾
          if (lineNumber !== 0) {
            this._textCursor = TextElementUtils.getCursorOfLineEnd(textData.lines[prevLineNumber], prevLineNumber);
          }
        }
      }
      this._textSelection = {
        startCursor: this._textCursor,
        endCursor: null,
      };
    }
  }
}
