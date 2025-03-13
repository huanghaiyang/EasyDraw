import { IPoint, ISize } from "@/types";
import { IDrawerHtml } from "@/types/IStageDrawer";
import DrawerBase from "@/modules/stage/drawer/DrawerBase";
import { DefaultFontStyle } from "@/styles/ElementStyles";
import { SelectionStrokeColor } from "@/styles/MaskStyles";
import FontUtils from "@/utils/FontUtils";

const minWidth = 200;
const minHeight = 20;

export default class DrawerHtml extends DrawerBase implements IDrawerHtml {
  // 输入框
  input: HTMLTextAreaElement;
  // 输入框位置
  private _inputPosition: IPoint;

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
    if (this.input) {
      return this.input;
    }
    const input = this._createInputElement(position);
    this._addInputEvents(input);
    this.node.appendChild(input);
    setTimeout(() => {
      input.setSelectionRange(0, 0);
      input.focus();
    }, 0);
    this.input = input;
    return input;
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
            white-space: nowrap;
            pointer-events: auto;
            background: transparent;
            caret-color: #000;
            color: #000;
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
    let { width, height } = FontUtils.measureText(this.input.value, DefaultFontStyle);
    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);
    Object.assign(this.input.style, {
      minWidth: `${width / this.shield.stageScale}px`,
      minHeight: `${height / this.shield.stageScale}px`,
    });
  }

  /**
   * 添加输入框事件
   *
   * @param input
   */
  private _addInputEvents(input: HTMLTextAreaElement): void {
    input.addEventListener("blur", (e) => {
      if (this.input.value) {
        this.emit(
          "input",
          this.input.value,
          DefaultFontStyle,
          {
            width: input.offsetWidth,
            height: input.offsetHeight,
          },
          this._inputPosition,
        );
      }
      this.input.remove();
      this.input = null;
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        this._updateInputStyleWhileInputing();
      }
    });
    input.addEventListener("input", () => {
      this._updateInputStyleWhileInputing();
    });
  }

  /**
   * 创建文本输入框
   */
  private _createInputElement(position: IPoint): HTMLTextAreaElement {
    this._inputPosition = position;
    const strokeWidth = 1 / this.shield.stageScale;
    const input = document.createElement("textarea");

    Object.assign(input.style, {
      top: `${position.y}px`,
      left: `${position.x}px`,
      minWidth: `${minWidth / this.shield.stageScale}px`,
      minHeight: `${minHeight / this.shield.stageScale}px`,
      boxShadow: `0 -${strokeWidth}px 0 0 ${SelectionStrokeColor}, -${strokeWidth}px 0 0 0 ${SelectionStrokeColor}, ${strokeWidth}px 0 0 0 ${SelectionStrokeColor}, 0 ${strokeWidth}px 0 0 ${SelectionStrokeColor}`,
      fontSize: `${DefaultFontStyle.fontSize}px`,
      fontFamily: DefaultFontStyle.fontFamily,
      verticalAlign: DefaultFontStyle.textBaseline,
      textAlign: DefaultFontStyle.textAlign,
    });
    return input;
  }
}
