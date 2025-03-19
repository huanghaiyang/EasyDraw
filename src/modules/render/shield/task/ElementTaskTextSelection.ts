import { IElementTaskTextSelection } from "@/types/IRenderTask";
import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import { IElementText } from "@/types/IElement";
import CanvasUtils from "@/utils/CanvasUtils";
import { TextSelectionFillColor, TextSelectionFillColorOpacity } from "@/styles/MaskStyles";
import ITextData, { ITextCursor, ITextLine, ITextSelectionNode, TextRenderDirection } from "@/types/IText";
import { pick } from "lodash";
import { RenderParams } from "@/types/IRender";

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

    const { startNode, endNode } = textSelection;
    const { lineNumber: startLineNumber, renderRect } = startNode;
    const { lineNumber: endLineNumber } = endNode;

    // 如果是同一行，则仅绘制当前行的选区效果
    if (startLineNumber === endLineNumber) {
      this._drawLineSelection(startNode, endNode, options);
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
              this._drawPartialLine(line, startNode, TextRenderDirection.RIGHT, renderRect, options);
            } else if (i === endLineNumber) {
              this._drawPartialLine(line, endNode, TextRenderDirection.LEFT, renderRect, options);
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
              this._drawPartialLine(line, startNode, TextRenderDirection.LEFT, renderRect, options);
            } else if (i === endLineNumber) {
              this._drawPartialLine(line, endNode, TextRenderDirection.RIGHT, renderRect, options);
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
    const startSelectionNode = {
      x,
      y,
      height,
      renderRect,
    } as ITextSelectionNode;
    const endSelectionNode = {
      x: x + 4 * CanvasUtils.scale,
      y,
      height,
      renderRect,
    } as ITextSelectionNode;
    this._drawLineSelection(startSelectionNode, endSelectionNode, options);
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
      TextRenderDirection.RIGHT,
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
  private _drawPartialLine(line: ITextLine, cursor: ITextCursor, direction: TextRenderDirection, renderRect: Partial<DOMRect>, options: RenderParams): void {
    if (direction === TextRenderDirection.LEFT) {
      const headNode = line.nodes[0];
      this._drawLineSelection(
        {
          ...pick(headNode, ["x", "y", "height"]),
          renderRect,
        },
        cursor,
        options,
      );
    } else if (direction === TextRenderDirection.RIGHT) {
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
   * @param startSelectionNode 开始选区节点
   * @param endSelectionNode 结束选区节点
   * @param options 渲染选项
   */
  private _drawLineSelection(startSelectionNode: ITextSelectionNode, endSelectionNode: ITextSelectionNode, options: RenderParams): void {
    const desX = Math.min(startSelectionNode.x, endSelectionNode.x);
    const desY = startSelectionNode.y;
    const desWidth = Math.abs(startSelectionNode.x - endSelectionNode.x);
    const desHeight = startSelectionNode.height;

    CanvasUtils.drawRectFill(
      this.canvas,
      {
        ...startSelectionNode.renderRect,
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
