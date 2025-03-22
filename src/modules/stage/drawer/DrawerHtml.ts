import { IPoint, ISize, TextEditingStates } from "@/types";
import { IDrawerHtml } from "@/types/IStageDrawer";
import DrawerBase from "@/modules/stage/drawer/DrawerBase";
import { DefaultFontStyle } from "@/styles/ElementStyles";
import { SelectionStrokeColor } from "@/styles/MaskStyles";
import FontUtils from "@/utils/FontUtils";
import ColorUtils from "@/utils/ColorUtils";
import { isNumber } from "lodash";

const minWidth = 200;
const minHeight = 20;

export default class DrawerHtml extends DrawerBase implements IDrawerHtml {
  // 输入框
  textEditor: HTMLTextAreaElement;
  // 文本光标
  textCursorEditor: HTMLTextAreaElement;
  // 输入框位置
  private _textEditorPosition: IPoint;
  // 最后一次文本光标编辑的按键码
  private _prevTextCursorKeycode: number = -1;
  // 最后一次文本光标编辑的ctrl键状态
  private _prevTextCursorCtrlKey = false;
  // 最后一次文本光标编辑的selectionStart
  private _prevSelectionStart: number = -1;
  // 最后一次文本光标编辑的selectionEnd
  private _prevSelectionEnd: number = -1;
  // 是否应该触发selectionChanged事件
  private _shouldEmitSelectionChanged = true;

  /**
   * 初始化画布
   *
   * @returns
   */
  initNode(): HTMLDivElement | HTMLCanvasElement {
    this.node = document.createElement("div");
    this.node.id = "html-drawer";
    this.initStyle();
    this._initStyleSheet();
    return this.node;
  }

  /**
   * 更新画布大小
   *
   * @param size
   */
  updateSize(size: ISize): void {
    const { width, height } = size;
    const { stageScale } = this.shield;
    Object.assign(this.node.style, {
      width: `${width / stageScale}px`,
      height: `${height / stageScale}px`,
      transform: `scale(${stageScale})`,
    });
  }

  /**
   * 创建文本输入框
   */
  createTextInput(position: IPoint): HTMLTextAreaElement {
    if (this.textEditor) {
      return this.textEditor;
    }
    const textEditor = this._createInputElement(position);
    this._addInputEvents(textEditor);
    this.node.appendChild(textEditor);
    setTimeout(() => {
      textEditor.setSelectionRange(0, 0);
      textEditor.focus();
    }, 0);
    this.textEditor = textEditor;
    return textEditor;
  }

  /**
   * 创建文本光标
   * @param value - 文本内容
   * @param selectionStart - 光标起始位置
   * @param selectionEnd - 光标结束位置
   */
  createTextCursorInput(value: string, selectionStart: number, selectionEnd: number): HTMLTextAreaElement {
    if (!this.textCursorEditor) {
      const textCursorEditor = document.createElement("textarea");
      Object.assign(textCursorEditor.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: `300px`,
        height: `300px`,
      });
      this._addCursorInputEvents(textCursorEditor);
      this.node.appendChild(textCursorEditor);
      this.textCursorEditor = textCursorEditor;
    }
    this.textCursorEditor.value = value;
    this.focusTextCursorInput(selectionStart, selectionEnd);
    return this.textCursorEditor;
  }

  /**
   * 聚焦文本光标
   * @param selectionStart - 光标起始位置
   * @param selectionEnd - 光标结束位置
   */
  focusTextCursorInput(selectionStart?: number, selectionEnd?: number): void {
    if (!this.textCursorEditor) return;
    if (!isNumber(selectionStart)) {
      selectionStart = 0;
    }
    if (!isNumber(selectionEnd)) {
      selectionEnd = 0;
    }
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    this._shouldEmitSelectionChanged = false;
    this.textCursorEditor.selectionStart = start;
    this.textCursorEditor.selectionEnd = end;
    this.textCursorEditor.focus();
  }

  /**
   * 初始化样式表
   */
  private _initStyleSheet(): void {
    const style = document.createElement("style");
    style.innerHTML = `
        #html-drawer {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            transform-origin: top left;
        }
        #html-drawer textarea {
            position: absolute;
            top: 0;
            left: 0;
            min-width: 0;
            min-height: 0;
            overflow: visible;
            padding: 0;
            margin: 0;
            border: none;
            outline: none;
            resize: none;
            word-break: break-word;
            white-space: nowrap;
            pointer-events: auto;
            background: transparent;
            caret-color: #000;
            color: #000;
            box-sizing: border-box;
        }
        #html-drawer textarea::-webkit-scrollbar {
            display: none;
        }
        #html-drawer textarea {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;
    document.head.appendChild(style);
  }

  /**
   * 更新输入框样式
   */
  private _updateInputStyleWhileInputing(): void {
    let { width, height } = FontUtils.measureTextWithSpan(this.textEditor.value, DefaultFontStyle);
    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);
    Object.assign(this.textEditor.style, {
      minWidth: `${width}px`,
      minHeight: `${height}px`,
    });
  }

  /**
   * 添加输入框事件
   *
   * @param textEditor
   */
  private _addInputEvents(textEditor: HTMLTextAreaElement): void {
    textEditor.addEventListener("blur", () => {
      if (this.textEditor.value) {
        this.emit(
          "textInput",
          this.textEditor.value,
          DefaultFontStyle,
          {
            width: textEditor.offsetWidth,
            height: textEditor.offsetHeight,
          },
          this._textEditorPosition,
        );
      }
      this.textEditor.remove();
      this.textEditor = null;
    });
    textEditor.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        this._updateInputStyleWhileInputing();
      }
    });
    textEditor.addEventListener("input", () => {
      this._updateInputStyleWhileInputing();
    });
  }

  /**
   * 获取文本光标属性
   *
   * @param textCursorEditor
   */
  private _getSelectionStates(textCursorEditor: HTMLTextAreaElement): Partial<TextEditingStates> {
    return {
      selectionStart: textCursorEditor.selectionStart,
      selectionEnd: textCursorEditor.selectionEnd,
    };
  }

  /**
   * 发送文本光标值变化事件
   *
   * @param textCursorEditor
   */
  private _emitValueChange(textCursorEditor: HTMLTextAreaElement): void {
    this.emit("textUpdate", textCursorEditor.value, {
      keyCode: this._prevTextCursorKeycode,
      ctrlKey: this._prevTextCursorCtrlKey,
      prevSelectionStart: this._prevSelectionStart,
      prevSelectionEnd: this._prevSelectionEnd,
      ...this._getSelectionStates(textCursorEditor),
    });
  }

  /**
   * 发送文本光标值和选择变化事件
   *
   * @param textCursorEditor
   */
  private _emitSelectionChange(textCursorEditor: HTMLTextAreaElement): void {
    this.emit("textSelectionUpdate", this._getSelectionStates(textCursorEditor));
  }

  /**
   * 添加文本光标事件
   *
   * @param textCursorEditor
   */
  private _addCursorInputEvents(textCursorEditor: HTMLTextAreaElement): void {
    // 失去焦点
    textCursorEditor.addEventListener("blur", () => {
      console.log("blur");
    });
    // 监听文本光标选区变化
    textCursorEditor.addEventListener("selectionchange", () => {
      if (this._shouldEmitSelectionChanged) {
        this._emitSelectionChange(textCursorEditor);
      }
      this._shouldEmitSelectionChanged = true;
    });
    // 监听键盘按键
    textCursorEditor.addEventListener("keydown", e => {
      this._prevTextCursorKeycode = e.keyCode;
      this._prevTextCursorCtrlKey = e.ctrlKey;
      this._prevSelectionStart = textCursorEditor.selectionStart;
      this._prevSelectionEnd = textCursorEditor.selectionEnd;
    });
    // 输入框内容变化
    textCursorEditor.addEventListener("input", () => {
      this._shouldEmitSelectionChanged = false;
      this._emitValueChange(textCursorEditor);
    });
  }

  /**
   * 创建文本输入框
   */
  private _createInputElement(position: IPoint): HTMLTextAreaElement {
    this._textEditorPosition = position;
    const strokeWidth = 1 / this.shield.stageScale;
    const textEditor = document.createElement("textarea");

    Object.assign(textEditor.style, {
      top: `${position.y}px`,
      left: `${position.x}px`,
      minWidth: `${minWidth}px`,
      minHeight: `${minHeight}px`,
      boxShadow: `0 -${strokeWidth}px 0 0 ${SelectionStrokeColor}, -${strokeWidth}px 0 0 0 ${SelectionStrokeColor}, ${strokeWidth}px 0 0 0 ${SelectionStrokeColor}, 0 ${strokeWidth}px 0 0 ${SelectionStrokeColor}`,
      fontSize: `${DefaultFontStyle.fontSize}px`,
      fontFamily: DefaultFontStyle.fontFamily,
      lineHeight: `${DefaultFontStyle.fontLineHeight}`,
      color: ColorUtils.hashToRgba(DefaultFontStyle.fontColor, DefaultFontStyle.fontColorOpacity),
      verticalAlign: DefaultFontStyle.textBaseline,
      textAlign: DefaultFontStyle.textAlign,
    });
    return textEditor;
  }
}
