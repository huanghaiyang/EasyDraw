import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { Direction, ElementStatus, InputCompositionType, IPoint, TextEditingStates } from "@/types";
import ITextData, { ITextCursor, ITextLine, ITextSelection } from "@/types/IText";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { every, isEmpty } from "lodash";
import LodashUtils from "@/utils/LodashUtils";
import CoderUtils from "@/utils/CoderUtils";
import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";
import TextElementUtils from "@/modules/elements/utils/TextElementUtils";
import DOMUtils from "@/utils/DOMUtils";

export default class ElementText extends ElementRect implements IElementText {
  // 文本光标
  private _textCursor: ITextCursor;
  // 文本选区
  private _textSelection: ITextSelection;
  // 光标可见状态
  private _cursorVisibleStatus: boolean;
  // 光标可见计时器
  private _cursorVisibleTimer: number;
  // 上一次标记的光标
  private _prevMarkCursor: ITextCursor;
  // 上一次输入的光标位置
  private _prevInputCursor: ITextCursor;
  // 上一次更新文本的id
  private _prevTextUpdateId: string;

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
    this._markSelection();
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
    // 如果文本组件不包含给定的坐标，那么就将文本光标和选区都设置为空
    if (!this.isContainsCoord(coord)) {
      this._textCursor = null;
      this._textSelection = null;
      this._prevInputCursor = null;
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
      this._prevMarkCursor = this._textSelection?.endCursor || this._textCursor;
    }
    this._markSelection();
    this._prevInputCursor = null;
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
    const { keyCode, ctrlKey, shiftKey, metaKey, altKey } = states;

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
    } else if (CoderUtils.isA(keyCode) && ctrlKey) {
      this._selectAll();
    } else if (CoderUtils.isX(keyCode) && ctrlKey) {
      this._cutSelection(textData);
    } else if (CoderUtils.isC(keyCode) && ctrlKey) {
      this._copySelection(textData);
    } else if (CoderUtils.isV(keyCode) && ctrlKey) {
      this._pasteText(value, textData, states);
    } else if (!shiftKey && !metaKey && !altKey && !ctrlKey) {
      this._updateInput(textData, value, states);
    }
    this.model.data = textData;
    this._rerefreshCursorRenderRect();
    this._markSelection();
  }

  /**
   * 粘贴文本
   *
   * @param value 文本
   * @param textData 文本数据
   * @param states 文本编辑状态
   */
  private _pasteText(value: string, textData: ITextData, states: TextEditingStates): void {
    // 如果选区有效，那么就先删除选区中的文本节点
    if (this.isSelectionAvailable) {
      this._deleteAtCursor(textData);
    }
    this._prevInputCursor = this._textCursor;
    this._insertText(textData, value, states);
  }

  /**
   * 复制选区
   *
   * @param textData 文本数据
   */
  private _doSelectionCopy(textData: ITextData): void {
    const selectedNodes = TextElementUtils.pickSelectedContent(textData);
    DOMUtils.copyValueToClipboard(JSON.stringify(selectedNodes));
  }

  /**
   * 复制选区
   *
   * @param textData 文本数据
   */
  private _copySelection(textData: ITextData): void {
    if (this.isSelectionAvailable) {
      this._doSelectionCopy(textData);
    }
  }

  /**
   * 剪切选区
   *
   * @param textData 文本数据
   */
  private _cutSelection(textData: ITextData): void {
    if (this.isSelectionAvailable) {
      this._doSelectionCopy(textData);
      this._deleteAtCursor(textData);
    }
  }

  /**
   * 更新文本输入
   *
   * @param textData 文本数据
   * @param value 文本
   * @param states 文本编辑状态
   */
  private _updateInput(textData: ITextData, value: string, states: TextEditingStates): void {
    // 如果选区有效，那么就先删除选区中的文本节点
    if (this.isSelectionAvailable) {
      this._deleteAtCursor(textData);
    }
    const { updateId, compositionType } = states;
    // 上一次输入时的光标位置，如果是连续输入，则光标位置不变化
    // 如果是compositionend，那么就重置光标位置
    if (!this._prevInputCursor || compositionType === InputCompositionType.END || this._prevTextUpdateId !== updateId) {
      this._prevInputCursor = this._textCursor;
    }
    // 如果相同，表示连续输入，需要将上一次插入的节点删除，重新插入新的文本节点
    if (this._prevTextUpdateId === updateId) {
      // 光标位置还原
      this._textCursor = this._prevInputCursor;
      // 删除更新ID相同的节点
      this._deleteNodesByUpdateId(textData, updateId);
    }
    // 插入文本，批量生成文本节点
    this._insertText(textData, value, states);
    // 更新标记id
    this._prevTextUpdateId = updateId;
  }

  /**
   * 删除文本节点
   *
   * @param textData 文本数据
   * @param updateId 更新ID
   */
  private _deleteNodesByUpdateId(textData: ITextData, updateId: string): void {
    textData.lines = textData.lines
      .map(line => {
        const prevNodeLength = line.nodes.length;
        // 如果行中没有节点，那么就直接返回
        if (prevNodeLength > 0) {
          // 如果行中存在节点，那么就删除更新ID相同的节点
          line.nodes = line.nodes.filter(node => node.updateId !== updateId);
          // 如果删除节点后，行中没有节点，那么就返回null，否则返回行
          const afterNodeLength = line.nodes.length;
          if (prevNodeLength > afterNodeLength) {
            // 行中没有节点表示行应该被删除
            if (afterNodeLength === 0) return null;
            return line;
          }
        }
        return line;
      })
      .filter(line => line !== null) as ITextLine[];
  }

  /**
   * 插入文本
   *
   * @param textData 文本数据
   * @param value 文本
   * @param states 文本编辑状态
   */
  private _insertText(textData: ITextData, value: string, states?: TextEditingStates): void {
    if (isEmpty(value)) return;
    // 参考文本节点，此节点的样式将被应用到新插入的文本节点上
    const { textNode: anchorTextNode, lineNumber: prevLineNumber, isHead } = TextElementUtils.getAnchorNodeByCursor(textData, this._prevInputCursor);
    // 获取参考文本节点的样式
    const fontStyle = TextElementUtils.getStyleByNodeIfy(this.model, anchorTextNode);
    // 生成新插入的文本节点
    const nodes = value.split("").map(char => {
      const node = TextElementUtils.createTextNode(char, fontStyle);
      if (states && states.updateId) {
        node.updateId = states.updateId;
      }
      return node;
    });
    // 默认头部插入
    let anchorTextNodeIndex: number = 0;
    // 如果不是向行首插入，则需要找到插入位置
    if (!isHead) {
      // 找到插入位置
      anchorTextNodeIndex = textData.lines[prevLineNumber].nodes.findIndex(node => node.id === anchorTextNode.id);
      // 向后移动一位
      anchorTextNodeIndex = anchorTextNodeIndex + 1;
    }
    // 插入文本节点
    textData.lines[prevLineNumber].nodes.splice(anchorTextNodeIndex, 0, ...nodes);
    // 更新光标位置
    this._textCursor = TextElementUtils.getCursorOfNode(nodes[nodes.length - 1], Direction.RIGHT, prevLineNumber);
  }

  /**
   * 选中所有文本
   */
  private _selectAll(): void {
    const textData = this.model.data as ITextData;
    const startCursor = TextElementUtils.getCursorOfLineHead(textData.lines[0], 0);
    const endCursor = TextElementUtils.getCursorOfLineEnd(textData.lines[textData.lines.length - 1], textData.lines.length - 1);
    this._textSelection = { startCursor, endCursor };
    this._textCursor = startCursor;
  }

  /**
   * 标记文本选区
   */
  private _markSelection(): void {
    TextElementUtils.markTextUnselected(this.model.data as ITextData);

    if (this.isSelectionAvailable) {
      TextElementUtils.markTextSelected(this.model.data as ITextData, this._textSelection);
    }
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

    // 如果选区可用，则根据shiftKey来确定移动方向
    if (this.isSelectionAvailable) {
      if (!shiftKey) {
        // 如果没有shiftKey，则将光标移动到选区的最左侧位置
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

    let { nodeId, lineNumber, pos } = prevTextCursor;
    const line = textData.lines[lineNumber];
    const prevLineNumber = lineNumber - 1;
    const nextLineNumber = lineNumber + 1;
    const prevLine = textData.lines[prevLineNumber];
    const nextLine = textData.lines[nextLineNumber];
    let textCursor: ITextCursor;

    if (direction === Direction.TOP) {
      if (prevLineNumber >= 0) {
        textCursor = TextElementUtils.getClosestNodeCursorOfLine(prevLine, this._prevMarkCursor, prevLineNumber);
      }
    } else if (direction === Direction.BOTTOM) {
      if (nextLineNumber < textData.lines.length) {
        textCursor = TextElementUtils.getClosestNodeCursorOfLine(nextLine, this._prevMarkCursor, nextLineNumber);
      }
    } else {
      // 如果光标在节点后面，则将光标移动到节点后面
      if (line.nodes.length) {
        let nodeIndex: number = -1;
        // 如果有节点id，则获取节点索引
        if (nodeId) {
          nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
        } else {
          // 表示当前光标在行首，所以将当前节点索引设置为0
          nodeIndex = 0;
          // 将pos设置为LEFT
          pos = Direction.LEFT;
        }
        // 根据方向和位置，计算光标位置
        switch (direction) {
          case Direction.LEFT:
            // 如果pos是RIGHT，则表示光标在当前节点的右侧
            if (pos === Direction.RIGHT) {
              // 将光标从节点的右侧移动到左侧
              textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex], Direction.LEFT, lineNumber);
            } else if (nodeIndex > 0) {
              // 将光标移动到前一个节点的左侧
              textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex - 1], Direction.LEFT, lineNumber);
            } else if (prevLineNumber >= 0) {
              // 将光标移动到前一行的末尾
              textCursor = TextElementUtils.getCursorOfLineEnd(prevLine, prevLineNumber);
            }
            break;
          case Direction.RIGHT:
            if (pos === Direction.LEFT) {
              // 将光标从节点的左侧移动到右侧
              textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex], Direction.RIGHT, lineNumber);
            } else if (nodeIndex < line.nodes.length - 1) {
              // 将光标移动到后一个节点的右侧
              textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex + 1], Direction.RIGHT, lineNumber);
            } else if (nextLineNumber <= textData.lines.length - 1) {
              // 将光标移动到后一行的开头
              textCursor = TextElementUtils.getCursorOfLineStart(nextLine, nextLineNumber);
            }
            break;
        }
      } else {
        switch (direction) {
          case Direction.LEFT:
            if (prevLineNumber >= 0) {
              // 将光标移动到前一行的末尾
              textCursor = TextElementUtils.getCursorOfLineEnd(prevLine, prevLineNumber);
            }
            break;
          case Direction.RIGHT:
            if (nextLineNumber <= textData.lines.length - 1) {
              // 将光标移动到后一行的开头
              textCursor = TextElementUtils.getCursorOfLineStart(nextLine, nextLineNumber);
            }
            break;
        }
      }
    }
    if (textCursor) {
      if (shiftKey) {
        this._textSelection = {
          startCursor: this._textCursor,
          endCursor: textCursor,
        };
      } else {
        this._textCursor = textCursor;
        this._textSelection = null;
      }
      if (![Direction.TOP, Direction.BOTTOM].includes(direction)) {
        this._prevMarkCursor = this._textSelection?.endCursor || this._textCursor;
      }
    }
    this._prevInputCursor = null;
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
      const [minCursor, maxCursor] = TextElementUtils.sortCursors(textData, [this._textSelection.startCursor, this._textSelection.endCursor]);
      const { nodeId, lineNumber: minLineNumber, pos } = minCursor;
      let textCursor = minCursor;
      const line = textData.lines[minLineNumber];
      const nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
      // 如果光标在节点的左侧，表示当前节点不属于被删除的,则将光标移动到前一个节点的右侧
      if (pos === Direction.LEFT) {
        if (nodeIndex === 0) {
          textCursor = TextElementUtils.getCursorOfLineHead(line, minLineNumber);
        } else {
          textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex - 1], Direction.RIGHT, minLineNumber);
        }
      }
      this._textCursor = textCursor;
      let { lineNumber: maxLineNumber } = maxCursor;
      // 被删除的总行数
      const deleteTotaldLineNumber = maxLineNumber - minLineNumber - 1;
      // 如果选区跨越多行
      if (deleteTotaldLineNumber > 0) {
        // 将中间行删除
        textData.lines.splice(minLineNumber + 1, deleteTotaldLineNumber);
        // 更新maxLineNumber
        maxLineNumber -= deleteTotaldLineNumber;
        // 合并行
        TextElementUtils.margeNodesOfLine(textData, minLineNumber, maxLineNumber);
      } else {
        if (minLineNumber === maxLineNumber) {
          TextElementUtils.deleteSelectedNodesOfLine(textData.lines[minLineNumber]);
        } else {
          TextElementUtils.margeNodesOfLine(textData, minLineNumber, maxLineNumber);
        }
      }
    } else {
      const { nodeId, lineNumber, pos } = this._textCursor;
      // 获取前一行行号
      const prevLineNumber = lineNumber - 1;
      // 如果光标是在节点后面，则删除光标前面的文本节点
      if (nodeId) {
        const line = textData.lines[lineNumber];
        // 获取节点在当前行的索引
        const nodeIndex = line.nodes.findIndex(node => node.id === nodeId);

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
              prevLine.nodes.push(...line.nodes);
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
            line.nodes.splice(nodeIndex - 1, 1);
            // 更新光标位置
            this._textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex - 1], Direction.LEFT, lineNumber);
          }
        } else {
          // 删除光标绑定的文本节点
          line.nodes.splice(nodeIndex, 1);
          // 更新光标位置
          if (nodeIndex === 0) {
            this._textCursor = TextElementUtils.getCursorOfLineStart(line, lineNumber);
          } else {
            this._textCursor = TextElementUtils.getCursorOfNode(line.nodes[nodeIndex - 1], Direction.RIGHT, lineNumber);
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
    }
    this._textSelection = {
      startCursor: this._textCursor,
      endCursor: null,
    };
    this._prevMarkCursor = this._textCursor;
    this._prevInputCursor = null;
  }
}
