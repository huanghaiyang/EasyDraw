import { IPoint, ISize } from "@/types";
import { IDrawerHtml } from "@/types/IStageDrawer";
import DrawerBase from "@/modules/stage/drawer/DrawerBase";
import { DefaultFontStyle } from "@/styles/ElementStyles";
import { SelectionStrokeColor } from "@/styles/MaskStyles";
import FontUtils from "@/utils/FontUtils";
import ColorUtils from "@/utils/ColorUtils";

const minWidth = 200;
const minHeight = 20;

export default class DrawerHtml extends DrawerBase implements IDrawerHtml {
  // 输入框
  textEditor: HTMLTextAreaElement;
  // 输入框位置
  private _textEditorPosition: IPoint;

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
          "input",
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
    textEditor.addEventListener("textEditor", () => {
      this._updateInputStyleWhileInputing();
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
