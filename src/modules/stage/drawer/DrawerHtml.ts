import { InputCompositionType, IPoint, ISize } from "@/types";
import { IDrawerHtml } from "@/types/IStageDrawer";
import DrawerBase from "@/modules/stage/drawer/DrawerBase";
import { DefaultFontStyle } from "@/styles/ElementStyles";
import { SelectionStrokeColor } from "@/styles/MaskStyles";
import FontUtils from "@/utils/FontUtils";
import ColorUtils from "@/utils/ColorUtils";
import { nanoid } from "nanoid";
import CoderUtils from "@/utils/CoderUtils";
import EventUtils from "@/utils/EventUtils";

const minWidth = 200;
const minHeight = 20;

export default class DrawerHtml extends DrawerBase implements IDrawerHtml {
  // 输入框
  textEditor: HTMLTextAreaElement;
  // 文本光标
  textCursorEditor: HTMLTextAreaElement;
  // 输入框位置
  private _textEditorPosition: IPoint;
  // 文本更新ID
  private _textEditorUpdateId: string;
  // 最后一次文本光标编辑的按键码
  private _prevTextCursorKeycode: number = -1;
  // 最后一次文本光标编辑的ctrl键状态
  private _prevTextCursorCtrlKey = false;
  // 最后一次文本光标编辑的shift键状态
  private _prevTextCursorShiftKey = false;

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
   */
  createTextCursorInput(): HTMLTextAreaElement {
    if (!this.textCursorEditor) {
      const textCursorEditor = document.createElement("textarea");
      textCursorEditor.id = "text-cursor-editor";
      this._addCursorInputEvents(textCursorEditor);
      this.node.appendChild(textCursorEditor);
      this.textCursorEditor = textCursorEditor;
    }
    this._resetTextCursorInput();
    return this.textCursorEditor;
  }

  /**
   * 重置文本内容
   */
  _resetTextCursorInput(): void {
    if (this.textCursorEditor) {
      this.textCursorEditor.value = "";
      this._textEditorUpdateId = nanoid();
    }
  }

  /**
   * 聚焦文本光标
   */
  focusTextCursorInput(): void {
    if (!this.textCursorEditor) return;
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
        #text-cursor-editor {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          caret-color: transparent;
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
   * 文本更新
   */
  private _emitTextCursorUpdate(): void {
    this.emit("textUpdate", this.textCursorEditor.value, {
      keyCode: this._prevTextCursorKeycode,
      ctrlKey: this._prevTextCursorCtrlKey,
      shiftKey: this._prevTextCursorShiftKey,
      updateId: this._textEditorUpdateId,
    });
  }

  /**
   * 添加文本光标事件
   *
   * @param textCursorEditor
   */
  private _addCursorInputEvents(textCursorEditor: HTMLTextAreaElement): void {
    // 监听键盘按键
    textCursorEditor.addEventListener("keydown", e => {
      const { keyCode, ctrlKey, shiftKey, metaKey, altKey } = e;
      this._prevTextCursorKeycode = keyCode;
      this._prevTextCursorCtrlKey = ctrlKey;
      this._prevTextCursorShiftKey = shiftKey;
      if (
        ctrlKey ||
        shiftKey ||
        metaKey ||
        altKey ||
        CoderUtils.isDeleterKey(keyCode) ||
        CoderUtils.isArrowLeft(keyCode) ||
        CoderUtils.isArrowRight(keyCode) ||
        CoderUtils.isArrowUp(keyCode) ||
        CoderUtils.isArrowDown(keyCode) ||
        CoderUtils.isEnter(keyCode) ||
        (ctrlKey && CoderUtils.isA(keyCode)) ||
        (ctrlKey && CoderUtils.isX(keyCode)) ||
        (ctrlKey && CoderUtils.isC(keyCode)) ||
        (ctrlKey && CoderUtils.isV(keyCode)) ||
        (ctrlKey && CoderUtils.isZ(keyCode)) ||
        (ctrlKey && CoderUtils.isY(keyCode))
      ) {
        if (!CoderUtils.isV(keyCode)) {
          EventUtils.stopPP(e);
          this._resetTextCursorInput();
          this._emitTextCursorUpdate();
          requestAnimationFrame(() => {
            this.focusTextCursorInput();
          });
        }
      }
    });
    // 监听粘贴事件
    textCursorEditor.addEventListener("paste", e => {
      EventUtils.stopPP(e);
      const text = e.clipboardData.getData("text/plain");
      this.textCursorEditor.value = text;
      this._prevTextCursorKeycode = 86;
      this._emitTextCursorUpdate();
      this._resetTextCursorInput();
      requestAnimationFrame(() => {
        this.focusTextCursorInput();
      });
    });
    textCursorEditor.addEventListener("input", () => {
      this._emitTextCursorUpdate();
    });
    textCursorEditor.addEventListener("compositionstart", () => {
      this._resetTextCursorInput();
    });
    textCursorEditor.addEventListener("compositionend", () => {
      this.emit("textUpdate", "", {
        compositionType: InputCompositionType.END,
      });
      requestAnimationFrame(() => {
        this.focusTextCursorInput();
      });
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
