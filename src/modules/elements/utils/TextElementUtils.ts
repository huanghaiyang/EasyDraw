import { TextFontStyle } from "@/styles/ElementStyles";
import { IPoint } from "@/types";
import { TextCursorWidth } from "@/types/constants";
import { RenderRect } from "@/types/IRender";
import ITextData, { ITextCursor, ITextLine, ITextNode, ITextSelection, TextRenderDirection } from "@/types/IText";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { isBoolean, pick } from "lodash";
import { nanoid } from "nanoid";

/**
 * 获取文本光标与文本节点的对应关系，并更新光标位置和宽高
 *
 * @param node 文本节点
 * @param pos 光标位置
 * @returns 光标信息
 */
function getTextCursorNodeAbout(node: ITextNode, pos: TextRenderDirection): Partial<ITextCursor> {
  const { id, x, y, height, width } = node;
  return {
    nodeId: id,
    pos,
    x: x + (pos === TextRenderDirection.RIGHT ? width : 0),
    y,
    width: TextCursorWidth,
    height,
  };
}

/**
 * 获取文本行的头光标信息
 *
 * @param line 文本行
 * @returns 光标信息
 */
function getHeadCursorOfLine(line: ITextLine): Partial<ITextCursor> {
  const { x, y, height } = line;
  return {
    x,
    y,
    width: TextCursorWidth,
    height,
  };
}

/**
 * 尝试将光光标绑定到行末尾的节点上，如果当前行没有节点，则将光标移动到行首位置
 *
 * @param line 文本行
 * @returns 光标信息
 */
function getTextCursorLineAbout(line: ITextLine): Partial<ITextCursor> {
  const { nodes } = line;
  const node = nodes[nodes.length - 1];
  if (node) {
    return getTextCursorNodeAbout(node, TextRenderDirection.RIGHT);
  } else {
    return getHeadCursorOfLine(line);
  }
}

/**
 * 文本工具类
 */
export default class TextElementUtils {
  /**
   * 创建文本数据
   *
   * @param content 文本内容
   * @param fontStyle 文本样式
   * @returns 文本数据
   */
  static createTextData(content: string, fontStyle: TextFontStyle): ITextData {
    fontStyle = pick(fontStyle, ["fontFamily", "fontSize", "fontColor", "fontColorOpacity"]);
    const lines: ITextLine[] = [];

    content.split("\n").forEach(line => {
      const nodes = line.split("").map(char => {
        return {
          content: char,
          id: nanoid(),
          fontStyle,
        };
      });
      lines.push({ nodes });
    });
    return {
      lines,
    };
  }

  /**
   * 获取光标位置
   *
   * @param textData 文本数据
   * @param position 光标位置
   * @param rect 旋转盒模型的rect
   * @param flipX 是否翻转
   * @returns 光标位置
   */
  static retrieveTextCursorAtPosition(textData: ITextData, position: IPoint, rect: Partial<DOMRect>, flipX?: boolean): ITextCursor {
    if (!isBoolean(flipX)) flipX = false;
    const textCursor: ITextCursor = {};
    // 将当前鼠标位置转换为文本坐标系的坐标（文本坐标系是相对于文本的中心节点计算的）
    let [curPoint] = CanvasUtils.transPointsOfBox([position], rect as RenderRect);
    if (flipX) {
      curPoint = MathUtils.calcHorizontalSymmetryPointInRect(curPoint, CommonUtils.centerRectConversion(rect));
    }
    const { lines } = textData;
    let line: ITextLine;
    let lineNumber = -1;
    for (let i = 0; i < lines.length; i++) {
      const curLine = lines[i];
      // 判断当前光标是否在当前文本行内
      if (CommonUtils.isPointInRect(curLine, curPoint)) {
        line = curLine;
        lineNumber = i;
        break;
      }
    }
    if (line) {
      textCursor.lineNumber = lineNumber;
      // 遍历当前文本行的所有节点
      for (let j = 0; j < line.nodes.length; j++) {
        const node = line.nodes[j];
        // 判断当前光标是否在当前节点内
        if (CommonUtils.isPointInRect(node, curPoint)) {
          let pos = TextRenderDirection.LEFT;
          // 判断当前光标是否在当前节点的右侧位置
          if (curPoint.x >= node.x + node.width / 2) {
            pos = TextRenderDirection.RIGHT;
          }
          Object.assign(textCursor, getTextCursorNodeAbout(node, pos));
          break;
        }
      }
      if (!textCursor.nodeId) {
        Object.assign(textCursor, getTextCursorLineAbout(line));
      }
    } else {
      // 如果没有找到，则将光标移动到文本的最后一行
      textCursor.lineNumber = lines.length - 1;
      Object.assign(textCursor, getTextCursorLineAbout(lines[lines.length - 1]));
    }
    textCursor.renderRect = rect;
    return textCursor;
  }

  /**
   * 根据节点id获取文本节点的光标信息，此方法用于更新光标位置，例如舞台滚动或者缩放时，需要更新光标位置
   *
   * @param textData 文本数据
   * @param textCursor 文本光标
   * @returns 光标信息
   */
  static getUpdatedTextCursorProps(textData: ITextData, textCursor: ITextCursor): Partial<ITextCursor> {
    const { lines } = textData;
    const { nodeId, pos, lineNumber } = textCursor;
    const line = lines[lineNumber];
    if (line) {
      if (nodeId) {
        const node = line.nodes.find(node => node.id === nodeId);
        if (node) {
          return getTextCursorNodeAbout(node, pos);
        } else {
          return getTextCursorLineAbout(line);
        }
      } else {
        return getTextCursorLineAbout(line);
      }
    }
  }

  /**
   * 判断文本选区是否可用
   *
   * @param selection 文本选区
   * @returns 是否可用
   */
  static isTextSelectionAvailable(selection: ITextSelection): boolean {
    const {
      startCursor: { lineNumber: startLineNumber, nodeId: startNodeId },
      endCursor: { lineNumber: endLineNumber, nodeId: endNodeId },
    } = selection;
    return startLineNumber !== endLineNumber || startNodeId !== endNodeId;
  }

  /**
   * 获取文本数据中的文本内容
   *
   * @param textData 文本数据
   * @returns 文本内容
   */
  static getTextFromTextData(textData: ITextData): string {
    return textData.lines.map(line => line.nodes.map(node => node.content).join("")).join("\n");
  }

  /**
   * 获取给定光标位置的文本节点编号
   *
   * @param textData 文本数据
   * @param cursor 文本光标
   * @returns 文本节点编号
   */
  static getTextNodeNumberAtCursor(cursor: ITextCursor, textData: ITextData): number {
    let result = 0;
    if (!cursor) return result;
    const { lineNumber, nodeId, pos } = cursor;
    const lines = textData.lines;
    for (let i = 0; i <= lineNumber; i++) {
      const line = lines[i];
      if (i < lineNumber) {
        result += line.nodes.length + 1;
      } else if (i === lineNumber) {
        const nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
          result += pos === TextRenderDirection.RIGHT ? nodeIndex + 1 : nodeIndex;
        }
        break;
      } else {
        break;
      }
    }
    return result;
  }

  /**
   * 根据文本节点编号获取文本光标
   *
   * @param textData 文本数据
   * @param nodeNumber 文本节点编号
   * @returns 文本光标
   */
  static getCursorByTextNodeNumber(textData: ITextData, nodeNumber: number): ITextCursor {
    let result: ITextCursor = null;
    const lines = textData.lines;
    if (nodeNumber === 0) {
      return getHeadCursorOfLine(lines[0]);
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNodeNumber = line.nodes.length + 1;
      if (nodeNumber <= lineNodeNumber) {
        const nodeIndex = nodeNumber - 1;
        const node = line.nodes[nodeIndex];
        result = getTextCursorNodeAbout(node, nodeNumber === 0 ? TextRenderDirection.LEFT : TextRenderDirection.RIGHT);
        break;
      }
      nodeNumber -= lineNodeNumber;
    }
    if (!result) {
      result = getTextCursorLineAbout(lines[lines.length - 1]);
    }
    return result;
  }

  /**
   * 标记文本数据中的文本选区
   *
   * @param textData 文本数据
   * @param selectionStart 文本选区起始位置
   * @param selectionEnd 文本选区结束位置
   * @returns 文本数据
   */
  static markTextDataWithSelection(textData: ITextData, selectionStart: number, selectionEnd: number): ITextData {
    const { lines } = textData;
    let currentNodeNumber = selectionStart === selectionEnd ? 1 : 0;
    for (let i = 0; i < lines.length; i++) {
      let allSelected = true;
      const { nodes } = lines[i];
      for (let j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        node.selected = selectionStart <= currentNodeNumber && currentNodeNumber <= selectionEnd;
        if (allSelected && !node.selected) {
          allSelected = false;
        }
        currentNodeNumber++;
        if (currentNodeNumber > selectionEnd) {
          break;
        }
      }
      lines[i].selected = allSelected;
      currentNodeNumber++;
      if (currentNodeNumber > selectionEnd) {
        break;
      }
    }
    return textData;
  }
}
