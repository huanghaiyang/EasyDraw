import { IElementTaskTextSelection } from "@/types/IRenderTask";
import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementText } from "@/types/IElement";
import CanvasUtils from "@/utils/CanvasUtils";
import { TextSelectionFillColor, TextSelectionFillColorOpacity } from "@/styles/MaskStyles";
import ITextData, { ITextCursor, ITextLine } from "@/types/IText";
import { pick } from "lodash";
import { RenderParams } from "@/types/IRender";
import { Direction } from "@/types";

export default class ElementTaskTextSelection extends ElementTaskBase implements IElementTaskTextSelection {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.element) return;

    const { textSelection, isSelectionAvailable, angle, flipX, leanY, actualAngle } = this.element as IElementText;
    if (!isSelectionAvailable) return;

    // 渲染选项
    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const { startCursor, endCursor } = textSelection;
    const { lineNumber: startLineNumber, renderRect } = startCursor;
    const { lineNumber: endLineNumber } = endCursor;

    // 如果是同一行，则仅绘制当前行的选区效果
    if (startLineNumber === endLineNumber) {
      this._drawLineSelection(startCursor, endCursor, options);
    } else {
      const { lines } = this.element.model.data as ITextData;
      if (startLineNumber < endLineNumber) {
        for (let i = startLineNumber; i <= endLineNumber; i++) {
          const line = lines[i];
          const isEmptyLine = line.nodes.length === 0;
          if (isEmptyLine) {
            this._draweEmptyLine(line, renderRect, options);
          } else {
            if (i === startLineNumber) {
              this._drawPartialLine(line, startCursor, Direction.RIGHT, renderRect, options);
            } else if (i === endLineNumber) {
              this._drawPartialLine(line, endCursor, Direction.LEFT, renderRect, options);
            } else {
              this._drawFullLine(line, renderRect, options);
            }
          }
        }
      } else {
        for (let i = startLineNumber; i >= endLineNumber; i--) {
          const line = lines[i];
          const isEmptyLine = line.nodes.length === 0;
          if (isEmptyLine) {
            this._draweEmptyLine(line, renderRect, options);
          } else {
            if (i === startLineNumber) {
              this._drawPartialLine(line, startCursor, Direction.LEFT, renderRect, options);
            } else if (i === endLineNumber) {
              this._drawPartialLine(line, endCursor, Direction.RIGHT, renderRect, options);
            } else {
              this._drawFullLine(line, renderRect, options);
            }
          }
        }
      }
    }
  }

  /**
   * 绘制空行的选区
   *
   * @param line 行
   * @param renderRect 渲染矩形
   * @param options 渲染选项
   */
  private _draweEmptyLine(line: ITextLine, renderRect: Partial<DOMRect>, options: RenderParams): void {
    const { x, y, height } = line;
    const startCursor = {
      x,
      y,
      height,
      renderRect,
    } as ITextCursor;
    const endCursor = {
      x: x + 4 * CanvasUtils.scale,
      y,
      height,
      renderRect,
    } as ITextCursor;
    this._drawLineSelection(startCursor, endCursor, options);
  }

  /**
   * 绘制完整行的选区
   *
   * @param line 行
   * @param renderRect 渲染矩形
   * @param options 渲染选项
   */
  private _drawFullLine(line: ITextLine, renderRect: Partial<DOMRect>, options: RenderParams): void {
    const headCursor: ITextCursor = line.nodes[0];
    this._drawPartialLine(
      line,
      {
        ...pick(headCursor, ["x", "y", "height"]),
        renderRect,
      } as ITextCursor,
      Direction.RIGHT,
      renderRect,
      options,
    );
  }

  /**
   * 绘制部分行的选区
   *
   * @param line 行
   * @param cursor 光标
   * @param direction 方向
   * @param renderRect 渲染矩形
   * @param options 渲染选项
   */
  private _drawPartialLine(line: ITextLine, cursor: ITextCursor, direction: Direction, renderRect: Partial<DOMRect>, options: RenderParams): void {
    if (direction === Direction.LEFT) {
      const headNode = line.nodes[0];
      this._drawLineSelection(
        {
          ...pick(headNode, ["x", "y", "height"]),
          renderRect,
        },
        cursor,
        options,
      );
    } else if (direction === Direction.RIGHT) {
      const tailNode = line.nodes[line.nodes.length - 1];
      this._drawLineSelection(
        cursor,
        {
          x: tailNode.x + tailNode.width,
          ...pick(tailNode, ["y", "height"]),
          renderRect,
        },
        options,
      );
    }
  }

  /**
   * 绘制选区
   * @param startCursor 开始选区光标
   * @param endCursor 结束选区光标
   * @param options 渲染选项
   */
  private _drawLineSelection(startCursor: ITextCursor, endCursor: ITextCursor, options: RenderParams): void {
    const desX = Math.min(startCursor.x, endCursor.x);
    const desY = startCursor.y;
    const desWidth = Math.abs(startCursor.x - endCursor.x);
    const desHeight = startCursor.height;

    CanvasUtils.drawRectFill(
      this.canvas,
      {
        ...startCursor.renderRect,
        desX,
        desY,
        desWidth,
        desHeight,
      },
      {
        color: TextSelectionFillColor,
        colorOpacity: TextSelectionFillColorOpacity,
      },
      {
        ...options,
      },
    );
  }
}
