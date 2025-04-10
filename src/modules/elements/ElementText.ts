/**
 * TODO
 *
 * 1. 光标可以在节点的左侧或者右侧，导致对光标的处理更为复杂，需要优化
 */
import { ElementObject, IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import { Direction, ElementStatus, InputCompositionType, IPoint, ShieldDispatcherNames, TextEditingStates } from "@/types";
import ITextData, { ITextCursor, ITextLine, ITextNode, ITextSelection, TextEditorOperations, TextEditorPressTypes, TextUpdateResult } from "@/types/IText";
import CommonUtils from "@/utils/CommonUtils";
import { isEmpty } from "lodash";
import LodashUtils from "@/utils/LodashUtils";
import CoderUtils from "@/utils/CoderUtils";
import ElementRenderHelper from "@/modules/elements/utils/ElementRenderHelper";
import TextElementUtils from "@/modules/elements/utils/TextElementUtils";
import DOMUtils from "@/utils/DOMUtils";
import { FontStyle, FontStyleSet } from "@/styles/ElementStyles";
import TextUtils from "@/utils/TextUtils";
import IUndoRedo from "@/types/IUndoRedo";
import { ICommandTextEditorObject, ITextEditorCommandPayload, TextEeditorCommandTypes } from "@/types/ICommand";
import UndoRedo from "@/modules/base/UndoRedo";
import IStageShield from "@/types/IStageShield";
import TextEditorUpdatedCommand from "@/modules/command/text/TextEditorUpdatedCommand";
import { nanoid } from "nanoid";
import { RenderRect } from "@/types/IRender";
import MathUtils from "@/utils/MathUtils";

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
  private _prevMarkCursor: ITextCursor | null;
  // 上一次输入的光标位置
  private _prevInputCursor: ITextCursor | null;
  // 上一次更新文本的id
  private _textUpdateId: string;
  // 上一次是否重新计算了文本行
  private _prevTextLinesReflowed: boolean = false;
  // 撤销回退
  private _undoRedo: IUndoRedo<ITextEditorCommandPayload, boolean>;
  // 用以维护文本修改前的数据，包含文本内容，光标以及选区
  private _undoCommandObject: ICommandTextEditorObject | null;
  // 上一次操作类型
  private _editorOperation: TextEditorOperations = TextEditorOperations.NONE;
  // 上一次选区移动的id
  private _selectionMoveId: string | null;
  // 是否选区移动
  private _isSelectionMoved: boolean = false;
  // 字体大小
  private _fontSize: number | null;
  // 字体
  private _fontFamily: string | null;
  // 字体颜色
  private _fontColor: string | null;
  // 字体颜色透明度
  private _fontColorOpacity: number | null;
  // 字体间距
  private _fontLetterSpacing: number | null;
  // 字体大小混合
  private _fontSizeMixin: boolean = false;
  // 字体混合
  private _fontFamilyMixin: boolean = false;
  // 字体颜色混合
  private _fontColorMixin: boolean = false;
  // 字体颜色透明度混合
  private _fontColorOpacityMixin: boolean = false;
  // 字体间距混合
  private _fontLetterSpacingMixin: boolean = false;

  get fontEnable(): boolean {
    return true;
  }

  get fontInputEnable(): boolean {
    return true;
  }

  get fontLineHeightInputEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get fontLetterSpacingInputEnable(): boolean {
    return true;
  }

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
    return TextElementUtils.isTextSelectionAvailable(this._textSelection);
  }

  get isCursorVisible(): boolean {
    return !!this._textCursor && !this.isSelectionAvailable && this._cursorVisibleStatus;
  }

  // 是否启用控制器
  get transformersEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get cornersInputEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get cornersEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get text(): string {
    return TextElementUtils.getTextFromTextData(this.model.data as ITextData);
  }

  get fontSize(): number | null {
    return this._fontSize;
  }

  get fontFamily(): string | null {
    return this._fontFamily;
  }

  get fontColor(): string | null {
    return this._fontColor;
  }

  get fontColorOpacity(): number | null {
    return this._fontColorOpacity;
  }

  get fontLetterSpacing(): number | null {
    return this._fontLetterSpacing;
  }

  get fontSizeMixin(): boolean {
    return this._fontSizeMixin;
  }

  get fontFamilyMixin(): boolean {
    return this._fontFamilyMixin;
  }

  get fontColorMixin(): boolean {
    return this._fontColorMixin;
  }

  get fontColorOpacityMixin(): boolean {
    return this._fontColorOpacityMixin;
  }

  get fontLetterSpacingMixin(): boolean {
    return this._fontLetterSpacingMixin;
  }

  get textHeight(): number {
    return this._calcTextRenderHeight();
  }

  constructor(model: ElementObject, shield: IStageShield) {
    super(model, shield);
    this._undoRedo = new UndoRedo();
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
    this._undoCommandObject = null;
    this._editorOperation = TextEditorOperations.NONE;
    this._textUpdateId = null;
    this._prevInputCursor = null;
    this._prevTextLinesReflowed = false;
    this._selectionMoveId = null;
    this._isSelectionMoved = false;
    this._toggleCursorVisibleTimer(value);
    if (value) {
      this._selectAll();
    } else {
      this._undoRedo.clear();
    }
    this._markSelection();
    this._checkFontStyleChangedByCursor();
  }

  /**
   * 选中状态变化
   *
   * @param value 选中状态
   */
  _setIsSelected(value: boolean): void {
    super._setIsSelected(value);
    if (value) {
      this._updateFontStyleByTextData(false, false, true);
    }
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
    this.refreshTextCursors();
  }

  /**
   * 字体变化
   */
  onFontFamilyChanged(): void {
    this._updateFontStyleByTextData(this.isSelectionAvailable, false, true);
    super.onFontFamilyChanged();
  }

  /**
   * 字号变化
   */
  onFontSizeChanged(): void {
    this._updateFontStyleByTextData(this.isSelectionAvailable, false, true);
    super.onFontSizeChanged();
  }

  /**
   * 颜色变化
   */
  onFontColorChanged(): void {
    this._updateFontStyleByTextData(this.isSelectionAvailable, false, true);
    super.onFontColorChanged();
  }

  /**
   * 颜色透明度变化
   */
  onFontColorOpacityChanged(): void {
    this._updateFontStyleByTextData(this.isSelectionAvailable, false, true);
    super.onFontColorOpacityChanged();
  }

  /**
   * 给定坐标获取文本光标
   *
   * @param coord 坐标
   * @param isSelectionMove 是否是选区移动
   */
  refreshTextCursorAtPosition(coord: IPoint, isSelectionMove?: boolean): void {
    this._isSelectionMoved = isSelectionMove || false;
    if (!isSelectionMove) {
      this._undoCommandObject = this._getTextEditorCommandObject({ dataExclude: true });
      this._selectionMoveId = null;
    }
    // 计算旋转盒模型的rect
    const renderRect = ElementRenderHelper.calcElementRenderRect(this) as RenderRect;
    // 转换为组件内的坐标
    const point = ElementRenderHelper.convertCoordInRect(coord, this, renderRect);
    // 获取文本光标
    const textCursor = TextElementUtils.getTextCursorAtPosition(this.model.data as ITextData, point);
    // 如果文本光标存在，那么就更新选区和光标状态
    if (textCursor) {
      if (isSelectionMove) {
        // 判断选区的起始光标位置是否与当前的光标位置相同,对于英文连字渲染情况，例如[Te]渲染时，[T]和[e]会相互重叠一部分,光标在中间，既可以属于[T]，也可以属于[e]
        if (!TextElementUtils.isCursorAtSamePosition(this._textSelection.startCursor, textCursor, this.model.data as ITextData)) {
          this._textSelection.endCursor = textCursor;
        } else {
          this._textSelection.endCursor = null;
        }
        this._cursorVisibleStatus = false;
        this._editorOperation = TextEditorOperations.MOVE_SELECTION;
        if (!this._selectionMoveId) {
          this._selectionMoveId = nanoid();
          this._undoCommandObject = this._getTextEditorCommandObject({ dataExclude: true });
        }
      } else {
        this._textCursor = textCursor;
        this._textSelection = {
          startCursor: textCursor,
          endCursor: null,
        };
        this._editorOperation = TextEditorOperations.MOVE_CURSOR;
      }
      this._cursorVisibleStatus = true;
      this._clearCursorVisibleTimer();
      this._startCursorVisibleTimer();
      this._prevMarkCursor = this._textSelection?.endCursor || this._textCursor;
    }
    this._markSelection();
    this._checkFontStyleChangedByCursor();
    this._prevInputCursor = null;
    this._addCursorUpdateCommand();
  }

  /**
   * 刷新文本光标
   */
  refreshTextCursors(): void {
    if (!this.isEditing) return;
    this._updateCursor(this._textCursor);
    this._updateCursor(this._textSelection?.endCursor);
  }

  /**
   * 更新文本光标
   *
   * @param textCursor 文本光标
   * @param textSelection 文本选区
   */
  updateTextCursors(textCursor?: ITextCursor, textSelection?: ITextSelection): void {
    this._textCursor = textCursor;
    this._textSelection = textSelection;
  }

  /**
   * 更新文本
   *
   * @param value 文本
   * @param states 文本编辑状态
   */
  async updateText(value: string, states: TextEditingStates): Promise<TextUpdateResult> {
    if (this._isSelectionMoved) return;
    const textData = LodashUtils.jsonClone(this.model.data as ITextData);
    const { keyCode, ctrlKey, shiftKey, metaKey, altKey, updateId } = states;
    let changed = false;
    let reflow = false;
    let noUsed = false;
    if (CoderUtils.isArrowLeft(keyCode)) {
      this._moveCursorTo(Direction.LEFT, states);
    } else if (CoderUtils.isArrowRight(keyCode)) {
      this._moveCursorTo(Direction.RIGHT, states);
    } else if (CoderUtils.isArrowUp(keyCode)) {
      this._moveCursorTo(Direction.TOP, states);
    } else if (CoderUtils.isArrowDown(keyCode)) {
      this._moveCursorTo(Direction.BOTTOM, states);
    } else if (CoderUtils.isA(keyCode) && ctrlKey) {
      this._selectAll();
    } else if (CoderUtils.isC(keyCode) && ctrlKey) {
      this._copySelection(textData);
    } else {
      reflow = true;
      if (CoderUtils.isDeleterKey(keyCode)) {
        // 删除
        changed = this._deleteAtCursor(textData, true);
      } else if (CoderUtils.isEnter(keyCode)) {
        // 换行
        changed = this._insertNewLine(textData);
      } else if (CoderUtils.isX(keyCode) && ctrlKey) {
        // 剪切
        changed = this._cutSelection(textData);
      } else if (CoderUtils.isV(keyCode) && ctrlKey) {
        // 粘贴
        changed = this._pasteText(value, textData, states);
      } else if (CoderUtils.isZ(keyCode) && ctrlKey) {
        // 撤销
        const tailUndoCommand = this._undoRedo.tailUndoCommand;
        if (tailUndoCommand) {
          await this._undoRedo.undo();
          this._editorOperation = TextEditorOperations.UNDO;
          if (![TextEditorOperations.MOVE_CURSOR, TextEditorOperations.MOVE_SELECTION].includes(tailUndoCommand.payload.operation)) {
            reflow = true;
          }
        }
      } else if (CoderUtils.isY(keyCode) && ctrlKey) {
        // 回退
        const tailRedoCommand = this._undoRedo.tailRedoCommand;
        if (tailRedoCommand) {
          await this._undoRedo.redo();
          this._editorOperation = TextEditorOperations.REDO;
          if (![TextEditorOperations.MOVE_CURSOR, TextEditorOperations.MOVE_SELECTION].includes(tailRedoCommand.payload.operation)) {
            reflow = true;
          }
        }
      } else if (!shiftKey && !metaKey && !altKey && !ctrlKey) {
        // 普通按键
        changed = this._updateInput(textData, value, states);
        if (changed) {
          this._editorOperation = TextEditorOperations.INPUT;
        }
      } else {
        // 其他快捷键不支持
        reflow = false;
        noUsed = true;
      }
      if (changed) {
        this.model.data = textData;
      }
    }
    if (!noUsed) {
      this._markSelection();
      this._checkFontStyleChangedByCursor();
    }
    this._textUpdateId = updateId;
    return { changed, reflow };
  }

  /**
   * 插入新行
   *
   * @param textData 文本数据
   */
  private _insertNewLine(textData: ITextData): boolean {
    this._undoCommandObject = this._getTextEditorCommandObject();
    if (this.isSelectionAvailable) {
      this._deleteAtCursor(textData);
    }
    const { lineNumber, nodeId, pos } = this._textCursor;
    const nextLineNumber = lineNumber + 1;
    const line = textData.lines[lineNumber];
    const { isTailBreak } = line;
    let nodeIndex = 0;
    if (nodeId) {
      nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
      // 光标在节点右侧表示不包含此节点
      if (pos === Direction.RIGHT) {
        nodeIndex++;
      }
    }
    // 如果光标位置不是在行尾，则需要将光标后的文本节点移动到新行
    if (nodeIndex <= line.nodes.length - 1) {
      const anchorTextNode = line.nodes[nodeIndex];
      // 样式以当前节点的样式为准
      const fontStyle = TextElementUtils.getStyleByNodeIfy(this.model, anchorTextNode, line);
      const restNodes = line.nodes.slice(nodeIndex);
      Object.assign(line, {
        nodes: line.nodes.slice(0, nodeIndex),
        isTailBreak: true,
      });
      // 如果当前行是尾部强制换行
      if (isTailBreak) {
        // 插入新行，且新行是尾部强制换行
        textData.lines.splice(nextLineNumber, 0, {
          nodes: restNodes,
          isTailBreak: true,
          fontStyle,
        });
      } else {
        // 将剩余的文本节点插入到下一行的开头
        const nextLine = textData.lines[nextLineNumber];
        nextLine.nodes.splice(0, 0, ...restNodes);
      }
    } else {
      // 如果光标位置在行尾，则直接在新行添加空行
      textData.lines.splice(nextLineNumber, 0, {
        nodes: [],
        isTailBreak: true,
        fontStyle: TextElementUtils.getStyleOfLineEnd(this.model, line),
      });
    }
    this._textCursor = TextElementUtils.getCursorOfLineStart(textData.lines[nextLineNumber], nextLineNumber);
    this._textSelection = {
      startCursor: this._textCursor,
      endCursor: null,
    };
    this._prevMarkCursor = this._textCursor;
    this._prevInputCursor = null;
    this._editorOperation = TextEditorOperations.INSERT_NEWLINE;
    return true;
  }

  /**
   * 粘贴文本
   *
   * @param value 文本
   * @param textData 文本数据
   * @param states 文本编辑状态
   */
  private _pasteText(value: string, textData: ITextData, states: TextEditingStates): boolean {
    if (value.length === 0) return false;
    this._undoCommandObject = this._getTextEditorCommandObject();
    // 如果选区有效，那么就先删除选区中的文本节点
    if (this.isSelectionAvailable) {
      this._deleteAtCursor(textData);
    }
    this._prevInputCursor = this._textCursor;
    // 尝试解析文本节点
    const textLines = TextElementUtils.parseTextLines(value);
    if (textLines && textLines.length > 0) {
      // 如果是混合文本，那么就直接插入节点
      this._insertTextLines(textData, textLines);
    } else {
      // 如果是单行就直接插入，如果是多行则需要先转换为textLine后再插入
      if (!TextUtils.isMultiLine(value)) {
        // 直接插入文本
        this._insertText(textData, value, states);
      } else {
        // 获取光标位置的样式
        const fontStyle = this._getFontStyleAtInputCursor();
        // 创建文本行
        const textLines = TextElementUtils.createTextLines(value, fontStyle);
        // 插入文本行
        this._insertTextLines(textData, textLines);
      }
    }
    this._editorOperation = TextEditorOperations.PASTE_TEXT;
    return true;
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
      this._editorOperation = TextEditorOperations.COPY_SELECTION;
    }
  }

  /**
   * 剪切选区
   *
   * @param textData 文本数据
   */
  private _cutSelection(textData: ITextData): boolean {
    if (!this.isSelectionAvailable) return false;
    this._undoCommandObject = this._getTextEditorCommandObject();
    this._doSelectionCopy(textData);
    this._deleteAtCursor(textData);
    this._editorOperation = TextEditorOperations.CUT_SELECTION;
    return true;
  }

  /**
   * 更新文本输入
   *
   * @param textData 文本数据
   * @param value 文本
   * @param states 文本编辑状态
   */
  private _updateInput(textData: ITextData, value: string, states: TextEditingStates): boolean {
    if (!this._prevInputCursor) {
      this._undoCommandObject = this._getTextEditorCommandObject();
    }
    // 如果选区有效，那么就先删除选区中的文本节点
    if (this.isSelectionAvailable) {
      this._deleteAtCursor(textData);
    }
    const { updateId, compositionType } = states;
    // 上一次输入时的光标位置，如果是连续输入，则光标位置不变化
    // 如果是compositionend，那么就重置光标位置
    if (!this._prevInputCursor || compositionType === InputCompositionType.END || this._textUpdateId !== updateId) {
      this._prevInputCursor = this._textCursor;
    }
    // 如果相同，表示连续输入，需要将上一次插入的节点删除，重新插入新的文本节点
    if (this._textUpdateId === updateId) {
      // 光标位置还原
      this._textCursor = this._prevInputCursor;
      // 删除更新ID相同的节点
      this._deleteNodesByUpdateId(textData, updateId);
    }
    // 插入文本，批量生成文本节点
    this._insertText(textData, value, states);
    // 更新标记光标
    this._prevMarkCursor = this._textCursor;
    return true;
  }

  /**
   * 删除文本节点
   *
   * @param textData 文本数据
   * @param updateId 更新ID
   */
  private _deleteNodesByUpdateId(textData: ITextData, updateId: string): void {
    textData.lines = textData.lines.map(line => {
      const prevNodeLength = line.nodes.length;
      // 如果行中没有节点，那么就直接返回
      if (prevNodeLength > 0) {
        // 如果行中存在节点，那么就删除更新ID相同的节点
        line.nodes = line.nodes.filter(node => node.updateId !== updateId);
      }
      return line;
    });
  }

  /**
   * 插入混合文本
   *
   * @param textData 文本数据
   * @param textLines 文本行
   */
  private _insertTextLines(textData: ITextData, textLines: ITextLine[]): void {
    if (textLines.length === 0) return;
    // 参考文本节点，此节点的样式将被应用到新插入的文本节点上
    let { textNode: anchorTextNode, lineNumber: anchorLineNumber, isHead } = TextElementUtils.getAnchorNodeByCursor(textData, this._prevInputCursor);
    // 起始插入行
    const startLine = textData.lines[anchorLineNumber];
    // 默认起始插入位置
    let anchorTextNodeIndex: number = 0;
    // 如果光标不在行首，那么需要找到插入位置
    if (!isHead) {
      // 计算插入位置
      anchorTextNodeIndex = startLine.nodes.findIndex(node => node.id === anchorTextNode.id);
      // 向后移动一位
      anchorTextNodeIndex = anchorTextNodeIndex + 1;
    }
    // 截取光标之后的节点
    let splittedNodes: ITextNode[] = [];
    // 截取光标之后的节点
    splittedNodes = startLine.nodes.slice(anchorTextNodeIndex);
    splittedNodes = TextElementUtils.batchCloneTextNodes(splittedNodes);
    // 起始行仅保留光标之前的节点
    startLine.nodes = startLine.nodes.slice(0, anchorTextNodeIndex);
    // 待插入的第一行
    const firstTextLine = textLines[0];
    // 待插入的第一行是否是整行
    const firstTextLineIsFull = firstTextLine.isFull;
    // 待插入的最后一行是否是整行
    const tailTextLineIsFull = textLines[textLines.length - 1].isFull;
    // 如果起始行没有节点，那么就将待插入的第一行替换掉起始行
    if (startLine.nodes.length === 0) {
      // 替换掉起始行
      textData.lines.splice(anchorLineNumber, 1, firstTextLine);
      // 标记尾部换行
      firstTextLine.isTailBreak = true;
    } else {
      // 待插入的第一行是满行，那么就将待插入的第一行插入到起始行之后
      if (firstTextLineIsFull) {
        // 下移一行进行插入
        anchorLineNumber++;
        textData.lines.splice(anchorLineNumber, 0, firstTextLine);
      } else {
        // 否则将待插入的第一行的节点插入到起始行
        startLine.nodes.push(...firstTextLine.nodes);
      }
    }
    delete textData.lines[anchorLineNumber].isFull;
    // 更新光标位置
    this._textCursor = TextElementUtils.getCursorOfLineEnd(textData.lines[anchorLineNumber], anchorLineNumber);
    // 行号+1
    anchorLineNumber++;

    // 将中间的文本行直接插入
    if (textLines.length > 1) {
      // 中间文本行
      const otherLines = textLines.slice(1, textLines.length);
      // 插入中间文本行
      textData.lines.splice(anchorLineNumber, 0, ...otherLines);
      // 删除中间文本行的isFull字段
      for (const line of otherLines) {
        delete line.isFull;
      }
      // 行号+插入的行数
      anchorLineNumber += otherLines.length;
      // 更新光标位置
      this._textCursor = TextElementUtils.getCursorOfLineEnd(textData.lines[anchorLineNumber - 1], anchorLineNumber - 1);
    }

    // 如果存在剩余的节点
    if (splittedNodes.length > 0) {
      // 如果最后一行是整行，那么就将剩余的节点插入到新的一行
      if (tailTextLineIsFull) {
        textData.lines.splice(anchorLineNumber, 0, { nodes: splittedNodes, isTailBreak: true });
      } else {
        // 否则将剩余的节点插入到最后一行
        textData.lines[anchorLineNumber - 1].nodes.push(...splittedNodes);
      }
    }
  }

  /**
   * 获取光标位置的字体样式
   *
   * @returns 字体样式
   */
  private _getFontStyleAtInputCursor(): FontStyle {
    const { textNode: anchorTextNode, lineNumber: anchorLineNumber } = TextElementUtils.getAnchorNodeByCursor(this.model.data as ITextData, this._prevInputCursor);
    const line = (this.model.data as ITextData).lines[anchorLineNumber];
    return TextElementUtils.getStyleByNodeIfy(this.model, anchorTextNode, line);
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
    const { textNode: anchorTextNode, lineNumber: anchorLineNumber, isHead } = TextElementUtils.getAnchorNodeByCursor(textData, this._prevInputCursor);
    // 获取参考文本节点的样式
    const fontStyle = this._getFontStyleAtInputCursor();
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
      anchorTextNodeIndex = textData.lines[anchorLineNumber].nodes.findIndex(node => node.id === anchorTextNode.id);
      // 向后移动一位
      anchorTextNodeIndex = anchorTextNodeIndex + 1;
    }
    // 插入文本节点
    textData.lines[anchorLineNumber].nodes.splice(anchorTextNodeIndex, 0, ...nodes);
    // 更新光标位置
    this._textCursor = TextElementUtils.getCursorOfNode(nodes[nodes.length - 1], Direction.RIGHT, anchorLineNumber);
  }

  /**
   * 选中所有文本
   */
  private _selectAll(): void {
    this._undoCommandObject = this._getTextEditorCommandObject({ dataExclude: true });
    const textData = this.model.data as ITextData;
    const startCursor = TextElementUtils.getCursorOfLineHead(textData.lines[0], 0);
    const endCursor = TextElementUtils.getCursorOfLineEnd(textData.lines[textData.lines.length - 1], textData.lines.length - 1);
    this._textSelection = { startCursor, endCursor };
    this._textCursor = startCursor;
    this._editorOperation = TextEditorOperations.SELECT_ALL;
    this._addCursorUpdateCommand();
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
   * 根据光标位置更新字体样式
   */
  private _checkFontStyleChangedByCursor(): void {
    let fontStyleSet: FontStyleSet;
    if (this.isSelectionAvailable) {
      fontStyleSet = TextElementUtils.getStyleSetOfTextData(this.model.data as ITextData, true);
    } else if (this._textCursor) {
      fontStyleSet = TextElementUtils.getStyleSetByCursor(this._textCursor, this.model.data as ITextData);
    }
    if (fontStyleSet) {
      this._checkFontStyleChanged(fontStyleSet);
    }
  }

  /**
   * 根据文本数据更新字体样式
   *
   * @param useSelection 是否使用选区
   * @param eventEmit 是否触发事件
   * @param propsUpdate 是否更新属性
   */
  private _updateFontStyleByTextData(useSelection: boolean, eventEmit: boolean = true, propsUpdate?: boolean): void {
    const fontStyleSet = TextElementUtils.getStyleSetOfTextData(this.model.data as ITextData, useSelection);
    this._checkFontStyleChanged(fontStyleSet, eventEmit, propsUpdate);
  }

  /**
   * 字体样式变更通知
   *
   * @param fontStyleSet
   * @param eventEmit 是否触发事件
   * @param propsUpdate 是否更新属性
   */
  private _checkFontStyleChanged(fontStyleSet: FontStyleSet, eventEmit: boolean = true, propsUpdate?: boolean): void {
    const moreThanOne = (set: Set<any>) => set.size > 1;
    const { fontSizes, fontFamilies, fontColors, fontColorOpacities, fontLetterSpacings } = fontStyleSet;
    const fontSizeMixin = moreThanOne(fontSizes);
    const fontFamilyMixin = moreThanOne(fontFamilies);
    const fontColorMixin = moreThanOne(fontColors);
    const fontColorOpacityMixin = moreThanOne(fontColorOpacities);
    const fontLetterSpacingMixin = moreThanOne(fontLetterSpacings);

    const fontSize = fontSizeMixin ? null : fontSizes.values().next().value;
    const fontFamily = fontFamilyMixin ? null : fontFamilies.values().next().value;
    const fontColor = fontColorMixin ? null : fontColors.values().next().value;
    const fontColorOpacity = fontColorOpacityMixin ? null : fontColorOpacities.values().next().value;
    const fontLetterSpacing = fontLetterSpacingMixin ? null : fontLetterSpacings.values().next().value;

    if (propsUpdate) {
      this._fontSizeMixin = fontSizeMixin;
      this._fontFamilyMixin = fontFamilyMixin;
      this._fontColorMixin = fontColorMixin;
      this._fontColorOpacityMixin = fontColorOpacityMixin;
      this._fontLetterSpacingMixin = fontLetterSpacingMixin;

      this._fontSize = fontSize;
      this._fontFamily = fontFamily;
      this._fontColor = fontColor;
      this._fontColorOpacity = fontColorOpacity;
      this._fontLetterSpacing = fontLetterSpacing;
    }

    if (eventEmit) {
      this.emitPropChanged(ShieldDispatcherNames.fontSizeChanged, [fontSize]);
      this.emitPropChanged(ShieldDispatcherNames.fontFamilyChanged, [fontFamily]);
      this.emitPropChanged(ShieldDispatcherNames.fontColorChanged, [fontColor]);
      this.emitPropChanged(ShieldDispatcherNames.fontColorOpacityChanged, [fontColorOpacity]);
      this.emitPropChanged(ShieldDispatcherNames.fontLetterSpacingChanged, [fontLetterSpacing]);
      this.emitPropChanged(ShieldDispatcherNames.fontSizeMixinChanged, [fontSizeMixin]);
      this.emitPropChanged(ShieldDispatcherNames.fontFamilyMixinChanged, [fontFamilyMixin]);
      this.emitPropChanged(ShieldDispatcherNames.fontColorMixinChanged, [fontColorMixin]);
      this.emitPropChanged(ShieldDispatcherNames.fontColorOpacityMixinChanged, [fontColorOpacityMixin]);
      this.emitPropChanged(ShieldDispatcherNames.fontLetterSpacingMixinChanged, [fontLetterSpacingMixin]);
    }
  }

  /**
   * 移动光标
   *
   * @param direction 方向
   * @param states 文本编辑状态
   */
  private _moveCursorTo(direction: Direction, states: TextEditingStates): void {
    this._undoCommandObject = this._getTextEditorCommandObject({ dataExclude: true });
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
        this._editorOperation = TextEditorOperations.MOVE_CURSOR;
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
      // 如果是第一行，则光标直接移动到行首
      if (lineNumber === 0) {
        textCursor = TextElementUtils.getCursorOfLineStart(line, lineNumber);
      } else if (prevLineNumber >= 0) {
        // 否则移动到前一行的标记位置
        textCursor = TextElementUtils.getClosestNodeCursorOfLine(prevLine, this._prevMarkCursor, prevLineNumber);
      }
    } else if (direction === Direction.BOTTOM) {
      // 如果是最后一行，则光标直接移动到行尾
      if (lineNumber === textData.lines.length - 1) {
        textCursor = TextElementUtils.getCursorOfLineEnd(line, lineNumber);
      } else if (nextLineNumber < textData.lines.length) {
        // 否则移动到后一行的标记位置
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
              // 判断前一行是否是强制末尾换行
              if (prevLine.isTailBreak || prevLine.nodes.length === 0) {
                // 将光标移动到前一行的末尾
                textCursor = TextElementUtils.getCursorOfLineEnd(prevLine, prevLineNumber);
              } else {
                // 将光标移动到前一行的最后一个节点的左侧
                textCursor = TextElementUtils.getCursorOfNode(prevLine.nodes[prevLine.nodes.length - 1], Direction.LEFT, prevLineNumber);
              }
            }
            break;
          case Direction.RIGHT:
            // 如果当前光标在最后一个节点上，且当前行不是强制末尾换行，那么无论光标在节点的左侧还是右侧，都将光标移动到后一行的开头
            if ((nodeIndex === line.nodes.length - 1 || (nodeIndex === line.nodes.length - 2 && pos === Direction.RIGHT)) && !line.isTailBreak) {
              textCursor = TextElementUtils.getCursorOfLineStart(nextLine, nextLineNumber);
            } else if (pos === Direction.LEFT) {
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
        this._editorOperation = TextEditorOperations.MOVE_SELECTION;
      } else {
        this._textCursor = textCursor;
        this._textSelection = null;
        this._editorOperation = TextEditorOperations.MOVE_CURSOR;
      }
      if (![Direction.TOP, Direction.BOTTOM].includes(direction)) {
        this._prevMarkCursor = this._textSelection?.endCursor || this._textCursor;
      }
    }
    this._prevInputCursor = null;
    this._addCursorUpdateCommand();
  }

  /**
   * 获取文本编辑器命令对象
   *
   * @param options
   * @param options.dataExclude 是否排除文本数据
   * @returns 文本编辑器命令对象
   */
  private _getTextEditorCommandObject(options?: { dataExclude?: boolean }): ICommandTextEditorObject {
    return {
      textData: options?.dataExclude ? null : LodashUtils.jsonClone(this.model.data as ITextData),
      textCursor: LodashUtils.jsonClone(this._textCursor),
      textSelection: LodashUtils.jsonClone(this._textSelection),
    };
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
  private _deleteAtCursor(textData: ITextData, saveBeforeDelete?: boolean): boolean {
    if (saveBeforeDelete) {
      this._undoCommandObject = this._getTextEditorCommandObject();
    }
    // 是否实际删除了文本内容
    let result: boolean = true;
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
      this._editorOperation = TextEditorOperations.DELETE_SELECTION;
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
            } else {
              // 光标在第一行的行首，表示没有实际内容可以删除
              result = false;
              this._undoCommandObject = null;
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
      if (result) {
        this._editorOperation = TextEditorOperations.DELETE_PREV;
      }
    }
    this._textSelection = {
      startCursor: this._textCursor,
      endCursor: null,
    };
    this._prevMarkCursor = this._textCursor;
    this._prevInputCursor = null;
    return result;
  }

  /**
   * 重新排版文本
   *
   * @param force 是否强制重新排版
   * @returns 是否重新排版了文本
   */
  reflowText(force?: boolean): boolean {
    this._prevTextLinesReflowed = this._doReflowTextLines(!this._prevTextLinesReflowed || force);
    return this._prevTextLinesReflowed;
  }

  /**
   * 重新计算文本行
   *
   * @param force 是否强制重新计算
   * @returns 是否重新计算了文本行
   */
  private _doReflowTextLines(force: boolean = false): boolean {
    const textData = this.model.data as ITextData;
    // 舞台缩放系数
    const scale = this.shield.stageScale;
    // 未自动换行之前的文本行
    const noneAutoWrapTextLines = TextElementUtils.restoreTextLines(textData.lines);
    // 未自动换行之前的文本行的最大宽度
    const maxWidth = TextElementUtils.calcMaxLineWidth(noneAutoWrapTextLines, scale);
    // 如果文本行的最大宽度大于元素的宽度,则重新计算文本行
    const reflowed = maxWidth >= this.width || force;
    if (reflowed) {
      // 重新计算文本行
      const textLines = TextElementUtils.calcReflowTextLines(noneAutoWrapTextLines, this.width, scale);
      // 更新文本行
      textData.lines = textLines;
    }
    return reflowed;
  }

  /**
   * 计算文本宽度
   *
   * @returns 文本宽度
   */
  private _calcTextRenderWidth(): number {
    return Math.ceil(TextElementUtils.calcMaxLineWidthByNodes((this.model.data as ITextData).lines, this.shield.stageScale));
  }

  /**
   * 计算文本高度
   *
   * @returns 文本高度
   */
  private _calcTextRenderHeight(): number {
    return Math.ceil(TextElementUtils.calcTextRenderHeight((this.model.data as ITextData).lines, this.shield.stageScale));
  }

  /**
   * 重新计算组件尺寸以及坐标
   *
   * 注意此方法仅可以在组件刚创建时调用，因为对于width\height\coords\boxCoords的处理都没有考虑组件倾斜的情况
   */
  reCalcSizeAndCoords(): void {
    const width = this._calcTextRenderWidth();
    const height = this._calcTextRenderHeight();
    this.model.width = width;
    this.model.height = height;
    this.model.coords = CommonUtils.getBoxByLeftTop(this.model.coords[0], { width, height });
    this.model.boxCoords = CommonUtils.getBoxByLeftTop(this.model.boxCoords[0], { width, height });
  }

  /**
   * 组件形变时重新计算文本行
   */
  onTransforming(): void {
    super.onTransforming();
    this.reflowText();
  }

  /**
   * 编辑抬起
   *
   * @param pressType - 按压类型
   */
  onEditorPressChange(pressType: TextEditorPressTypes) {
    switch (pressType) {
      case TextEditorPressTypes.PRESS_UP: {
        this._selectionMoveId = null;
        this._isSelectionMoved = false;
        break;
      }
      default:
        break;
    }
  }

  /**
   * 设置字体
   *
   * @param value 字体
   */
  setFontFamily(value: string): void {
    const textData = this.model.data as ITextData;
    let isSelectionAvailable = this.isSelectionAvailable;
    if (!isSelectionAvailable) {
      super.setFontFamily(value);
    }
    textData.lines.forEach(line => {
      if (line.selected || !isSelectionAvailable) {
        line.fontStyle = Object.assign({}, line.fontStyle || {}, { fontFamily: value });
      }
      line.nodes.forEach(node => {
        if (node.selected || !isSelectionAvailable) {
          node.fontStyle.fontFamily = value;
        }
      });
    });
  }

  /**
   * 设置字体大小
   *
   * @param value 字体大小
   */
  setFontSize(value: number): void {
    const textData = this.model.data as ITextData;
    let isSelectionAvailable = this.isSelectionAvailable;
    if (!isSelectionAvailable) {
      super.setFontSize(value);
    }
    textData.lines.forEach(line => {
      if (line.selected || !isSelectionAvailable) {
        line.fontStyle = Object.assign({}, line.fontStyle || {}, { fontSize: value });
      }
      line.nodes.forEach(node => {
        if (node.selected || !isSelectionAvailable) {
          node.fontStyle.fontSize = value;
        }
      });
    });
  }

  /**
   * 设置字体颜色
   *
   * @param value 字体颜色
   */
  setFontColor(value: string): void {
    const textData = this.model.data as ITextData;
    let isSelectionAvailable = this.isSelectionAvailable;
    if (!isSelectionAvailable) {
      super.setFontColor(value);
    }
    textData.lines.forEach(line => {
      if (line.selected || !isSelectionAvailable) {
        line.fontStyle = Object.assign({}, line.fontStyle || {}, { fontColor: value });
      }
      line.nodes.forEach(node => {
        if (node.selected || !isSelectionAvailable) {
          node.fontStyle.fontColor = value;
        }
      });
    });
  }

  /**
   * 设置字体透明度

   * @param value 字体透明度
   */
  setFontColorOpacity(value: number): void {
    const textData = this.model.data as ITextData;
    let isSelectionAvailable = this.isSelectionAvailable;
    if (!isSelectionAvailable) {
      super.setFontColorOpacity(value);
    }
    textData.lines.forEach(line => {
      if (line.selected || !isSelectionAvailable) {
        line.fontStyle = Object.assign({}, line.fontStyle || {}, { fontColorOpacity: value });
      }
      line.nodes.forEach(node => {
        if (node.selected || !isSelectionAvailable) {
          node.fontStyle.fontColorOpacity = value;
        }
      });
    });
  }

  /**
   * 设置字间距
   *
   * @param value 字间距
   */
  setFontLetterSpacing(value: number): void {
    const textData = this.model.data as ITextData;
    let isSelectionAvailable = this.isSelectionAvailable;
    if (!isSelectionAvailable) {
      super.setFontLetterSpacing(value);
    }
    textData.lines.forEach(line => {
      if (line.selected || !isSelectionAvailable) {
        line.fontStyle = Object.assign({}, line.fontStyle || {}, { fontLetterSpacing: value });
      }
      line.nodes.forEach(node => {
        if (node.selected || !isSelectionAvailable) {
          node.fontStyle.fontLetterSpacing = value;
        }
      });
    });
  }

  /**
   * 刷新组件原始数据
   */
  refreshOriginalElementProps(): void {
    super.refreshOriginalElementProps();
    this._originalData = LodashUtils.jsonClone(this.model.data);
  }

  /**
   * 将组件原始数据转换为json
   *
   * 文本组件在形变时会重新计算文本行，因此需要将文本数据也转换为json
   *
   * @returns
   */
  async toOriginalTransformJson(): Promise<ElementObject> {
    const result = await super.toOriginalTransformJson();
    result.data = this._originalData;
    return result as ElementObject;
  }

  /**
   * 将组件形变之后的数据转换为json
   *
   * 文本组件在形变时会重新计算文本行，因此需要将文本数据也转换为json
   *
   * @returns
   */
  async toTransformJson(): Promise<ElementObject> {
    const result = await super.toTransformJson();
    result.data = LodashUtils.jsonClone(this.model.data);
    return result as ElementObject;
  }

  /**
   * 将组件字体样式数据转换为json
   *
   * 文本组件在形变时会重新计算文本行，因此需要将文本数据也转换为json
   *
   * @returns
   */
  async toFontStyleJson(): Promise<ElementObject> {
    const result = await super.toFontStyleJson();
    result.data = LodashUtils.jsonClone(this.model.data);
    return result as ElementObject;
  }

  /**
   * 文本重新排版时触发
   *
   * @param changed 是否是因为文本内容变化才重新排版
   */
  onTextReflowed(changed?: boolean): void {
    if (changed) {
      this._addUpdateCommand();
    }
  }

  /**
   * 添加重做和撤销命令
   */
  private _addUpdateCommand(): void {
    let shouldUpdate: boolean = false;
    const tailUndoCommand = this._undoRedo.tailUndoCommand;
    if (tailUndoCommand) {
      const {
        payload: { operation },
      } = tailUndoCommand;
      shouldUpdate =
        (this._editorOperation === TextEditorOperations.DELETE_PREV && operation === TextEditorOperations.DELETE_PREV) ||
        (this._editorOperation === TextEditorOperations.INPUT && operation === TextEditorOperations.INPUT);
    }
    if (shouldUpdate) {
      tailUndoCommand.payload.rData = this._getTextEditorCommandObject();
    } else {
      const command = new TextEditorUpdatedCommand(
        {
          type: TextEeditorCommandTypes.TextUpdated,
          operation: this._editorOperation,
          updateId: this._textUpdateId,
          uData: this._undoCommandObject,
          rData: this._getTextEditorCommandObject(),
        },
        this,
      );
      this._undoRedo.add(command);
    }
  }

  /**
   * 添加文本光标更新命令
   */
  private _addCursorUpdateCommand(): void {
    let shouldUpdate: boolean = false;
    const tailUndoCommand = this._undoRedo.tailUndoCommand;
    if (tailUndoCommand) {
      const {
        payload: {
          operation,
          uData: { textCursor, textSelection },
        },
      } = tailUndoCommand;
      shouldUpdate =
        (this._editorOperation === TextEditorOperations.MOVE_CURSOR &&
          operation === TextEditorOperations.MOVE_CURSOR &&
          TextElementUtils.isCursorAtSamePosition(this._textCursor, textCursor, this.model.data as ITextData)) ||
        (this._editorOperation === TextEditorOperations.MOVE_SELECTION &&
          operation === TextEditorOperations.MOVE_SELECTION &&
          TextElementUtils.isSelectionEqualWithStart(this._textSelection, textSelection, this.model.data as ITextData));
    }
    if (shouldUpdate) {
      tailUndoCommand.payload.rData = this._getTextEditorCommandObject({ dataExclude: true });
    } else {
      const command = new TextEditorUpdatedCommand(
        {
          type: TextEeditorCommandTypes.CursorSelectionUpdated,
          operation: this._editorOperation,
          updateId: this._textUpdateId,
          uData: this._undoCommandObject,
          rData: this._getTextEditorCommandObject({ dataExclude: true }),
        },
        this,
      );
      this._undoRedo.add(command);
    }
  }

  /**
   * 给定坐标是否在文本区域内
   *
   * @param coord 点
   * @returns 是否在文本区域内
   */
  private _isTextNodesContainsCoord(coord: IPoint): boolean {
    const textData = this.model.data as ITextData;
    if (textData.lines.length === 0) return false;
    const point = ElementRenderHelper.convertCoordInRect(coord, this, ElementRenderHelper.calcElementRenderRect(this) as RenderRect);
    return textData.lines.some(line => {
      return line.nodes.some(node => {
        return !CoderUtils.isSpace(node.content) && CommonUtils.isPointInRect(node, point);
      });
    });
  }

  /**
   * 判断给定坐标是否在文本实际渲染区域内
   *
   * @param coord 点
   * @returns 是否在文本区域内
   */
  private _isTextContainsCoord(coord: IPoint): boolean {
    const coords = this._getTextRotateRenderCoords();
    return MathUtils.isPointInPolygonByRayCasting(coord, coords);
  }

  /**
   * 计算文本实际渲染区域的坐标
   *
   * @returns 坐标
   */
  private _getTextRenderCoords(): IPoint[] {
    const textHeight = this._calcTextRenderHeight();
    return this._getTextCoordsByHeight(textHeight);
  }

  /**
   * 给定文本高度计算文本实际渲染区域的坐标
   *
   * @param textHeight 文本高度
   * @returns 坐标
   */
  private _getTextCoordsByHeight(textHeight: number): IPoint[] {
    let { x, y, width, height } = this.model;
    x = x - width / 2;
    y = y - height / 2;
    // 计算实际渲染区域的盒子坐标
    return CommonUtils.getBoxByLeftTop({ x, y }, { width, height: textHeight });
  }

  /**
   * 计算文本实际渲染区域的坐标(旋转\倾斜后)
   *
   * @returns 坐标
   */
  private _getTextRotateRenderCoords(): IPoint[] {
    const coords = this._getTextRenderCoords();
    // 计算旋转后的盒子坐标
    return MathUtils.batchTransWithCenter(coords, this.angles, this.centerCoord);
  }

  /**
   * 判定文本渲染区域是否与给定的区域相交
   *
   * @param coords
   * @returns
   */
  private _isTextPolygnOverlap(coords: IPoint[]): boolean {
    const renderCoords = this._getTextRotateRenderCoords();
    // 判断给定的坐标是否与渲染区域相交
    return MathUtils.isPolygonsOverlap(renderCoords, coords);
  }

  /**
   * 判断给定坐标是否在组件内
   *
   * @param coord
   * @returns
   */
  isContainsCoord(coord: IPoint): boolean {
    if (this.isSelected || this.strokeEffective) {
      return super.isContainsCoord(coord) || this._isTextContainsCoord(coord) || this._isTextNodesContainsCoord(coord);
    }
    return this._isTextNodesContainsCoord(coord);
  }

  /**
   * 判断当前组件是否与给定的多边形相交
   *
   * @param coords
   * @returns
   */
  isPolygonOverlap(coords: IPoint[]): boolean {
    if (this.isSelected || this.strokeEffective) {
      return super.isPolygonOverlap(coords) || this._isTextPolygnOverlap(coords);
    }
    return this._isTextPolygnOverlap(coords);
  }

  /**
   * 判断当前组件是否与给定的多边形相交
   *
   * @param coords
   * @returns
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return super.isModelPolygonOverlap(coords) || MathUtils.isPolygonsOverlap(this._getTextRotateRenderCoords(), coords);
  }
}
