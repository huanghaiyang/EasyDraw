import { FontStyle, TextFontStyle } from "@/styles/ElementStyles";
import { Direction, IPoint } from "@/types";
import { TextCursorWidth } from "@/types/constants";
import { ElementObject } from "@/types/IElement";
import { RenderRect } from "@/types/IRender";
import ITextData, { IMixinText, ITextCursor, ITextLine, ITextNode, ITextSelection } from "@/types/IText";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";
import LodashUtils from "@/utils/LodashUtils";
import MathUtils from "@/utils/MathUtils";
import { every, isBoolean, pick } from "lodash";
import { nanoid } from "nanoid";

/**
 * 获取文本光标与文本节点的对应关系，并更新光标位置和宽高
 *
 * @param node 文本节点
 * @param pos 光标位置
 * @returns 光标信息
 */
function getCursorPropsOfNode(node: ITextNode, pos: Direction): Partial<ITextCursor> {
  const { id, x, y, height, width } = node;
  return {
    nodeId: id,
    pos,
    x: x + (pos === Direction.RIGHT ? width : 0),
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
function getCursorPropsOfLineHead(line: ITextLine): Partial<ITextCursor> {
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
function getCursorPropsOfLineEnd(line: ITextLine): Partial<ITextCursor> {
  const { nodes } = line;
  const node = nodes[nodes.length - 1];
  if (node) {
    return getCursorPropsOfNode(node, Direction.RIGHT);
  } else {
    return getCursorPropsOfLineHead(line);
  }
}

/**
 * 文本工具类
 */
export default class TextElementUtils {
  /**
   * 创建文本节点
   *
   * @param value 值
   * @param style 样式
   * @returns 文本节点
   */
  static createTextNode(value: string, style: FontStyle): ITextNode {
    return {
      id: nanoid(),
      content: value,
      fontStyle: style,
    };
  }

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
        return TextElementUtils.createTextNode(char, fontStyle);
      });
      lines.push({ nodes, isTailBreak: true });
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
  static getTextCursorAtPosition(textData: ITextData, position: IPoint, rect: Partial<DOMRect>, flipX?: boolean): ITextCursor {
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
          let pos = Direction.LEFT;
          // 判断当前光标是否在当前节点的右侧位置
          if (curPoint.x >= node.x + node.width / 2) {
            pos = Direction.RIGHT;
          }
          Object.assign(textCursor, getCursorPropsOfNode(node, pos));
          break;
        }
      }
      if (!textCursor.nodeId) {
        Object.assign(textCursor, getCursorPropsOfLineEnd(line));
      }
    } else {
      // 如果没有找到，则将光标移动到文本的最后一行
      textCursor.lineNumber = lines.length - 1;
      Object.assign(textCursor, getCursorPropsOfLineEnd(lines[lines.length - 1]));
    }
    textCursor.renderRect = rect;
    return textCursor;
  }

  /**
   * 获取文本行尾光标信息
   *
   * @param line 文本行
   * @param lineNumber 行号
   * @returns 光标信息
   */
  static getCursorOfLineEnd(line: ITextLine, lineNumber: number): ITextCursor {
    const { nodes } = line;
    let cursor: ITextCursor;
    if (nodes.length > 0) {
      const node = nodes[nodes.length - 1];
      cursor = getCursorPropsOfNode(node, Direction.RIGHT);
    } else {
      cursor = getCursorPropsOfLineHead(line);
    }
    cursor.lineNumber = lineNumber;
    return cursor;
  }

  /**
   * 获取文本行首光标信息
   *
   * @param line 文本行
   * @param lineNumber 行号
   * @returns 光标信息
   */
  static getCursorOfLineStart(line: ITextLine, lineNumber: number): ITextCursor {
    let cursor: ITextCursor;
    if (line.nodes.length === 0) {
      cursor = getCursorPropsOfLineHead(line);
    } else {
      cursor = getCursorPropsOfNode(line.nodes[0], Direction.LEFT);
    }
    cursor.lineNumber = lineNumber;
    return cursor;
  }

  /**
   * 获取文本行首光标信息
   *
   * @param line 文本行
   * @param lineNumber 行号
   * @returns 光标信息
   */
  static getCursorOfLineHead(line: ITextLine, lineNumber: number): ITextCursor {
    const cursor = getCursorPropsOfLineHead(line);
    cursor.lineNumber = lineNumber;
    return cursor;
  }

  /**
   * 获取文本节点的光标信息
   *
   * @param node 文本节点
   * @param pos 光标位置
   * @param lineNumber 行号
   * @returns 光标信息
   */
  static getCursorOfNode(node: ITextNode, pos: Direction, lineNumber: number): ITextCursor {
    const cursor = getCursorPropsOfNode(node, pos);
    cursor.lineNumber = lineNumber;
    return cursor;
  }

  /**
   * 根据节点id获取文本节点的光标信息，此方法用于更新光标位置，例如舞台滚动或者缩放时，需要更新光标位置
   *
   * @param textData 文本数据
   * @param textCursor 文本光标
   * @returns 光标信息
   */
  static getUpdatedCursorProps(textData: ITextData, textCursor: ITextCursor): Partial<ITextCursor> {
    const { lines } = textData;
    const { nodeId, pos, lineNumber } = textCursor;
    const line = lines[lineNumber];
    if (line) {
      if (nodeId) {
        const node = line.nodes.find(node => node.id === nodeId);
        if (node) {
          return getCursorPropsOfNode(node, pos);
        } else {
          return getCursorPropsOfLineEnd(line);
        }
      } else {
        return getCursorPropsOfLineHead(line);
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
      startCursor: { lineNumber: startLineNumber, nodeId: startNodeId, pos: startPos },
      endCursor: { lineNumber: endLineNumber, nodeId: endNodeId, pos: endPos },
    } = selection;
    return startLineNumber !== endLineNumber || startNodeId !== endNodeId || startPos !== endPos;
  }

  /**
   * 获取文本节点
   *
   * @param textData 文本数据
   * @param nodeId 节点id
   * @returns 文本节点
   */
  static getTextNodeById(textData: ITextData, nodeId: string): ITextNode | undefined {
    const { lines } = textData;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const node = line.nodes.find(node => node.id === nodeId);
      if (node) {
        return node;
      }
    }
    return undefined;
  }

  /**
   * 获取文本节点的索引
   *
   * @param textData 文本数据
   * @param nodeId 节点id
   * @returns 节点索引
   */
  static getTextNodeIndex(textData: ITextData, nodeId: string): number {
    const { lines } = textData;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        return nodeIndex;
      }
    }
    return -1;
  }

  static sortCursors(textData: ITextData, cursors: ITextCursor[]): ITextCursor[] {
    const result = [...cursors];
    // 先按行号，再按节点索引，最后按照位置排序
    return result.sort((a, b) => {
      if (a.lineNumber !== b.lineNumber) {
        return a.lineNumber - b.lineNumber;
      }
      if (a.nodeId !== b.nodeId) {
        return TextElementUtils.getTextNodeIndex(textData, a.nodeId) - TextElementUtils.getTextNodeIndex(textData, b.nodeId);
      }
      return a.pos - b.pos;
    });
  }

  /**
   * 判断两个光标是否相等(是否在同一个位置)
   *
   * @param cursorA 光标A
   * @param cursorB 光标B
   * @returns 是否相等
   */
  static isCursorEqual(cursorA: ITextCursor, cursorB: ITextCursor): boolean {
    return cursorA.lineNumber === cursorB.lineNumber && cursorA.nodeId === cursorB.nodeId && cursorA.pos === cursorB.pos;
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
   * 标记文本未选中
   *
   * @param textData 文本数据
   */
  static markTextUnselected(textData: ITextData): void {
    textData.lines.forEach(line => {
      line.nodes.forEach(node => {
        node.selected = false;
      });
      line.selected = false;
    });
  }

  /**
   * 标记文本行是否选中
   *
   * @param line 文本行
   */
  static setLineSelectedIfy(line: ITextLine): void {
    if (every(line.nodes, node => node.selected)) {
      line.selected = true;
    }
  }

  /**
   * 标记文本节点是否选中
   *
   * @param line 文本行
   * @param startIndex 开始节点索引
   * @param endIndex 结束节点索引
   */
  static setNodeSelected(line: ITextLine, startIndex: number, endIndex: number): void {
    if (startIndex <= endIndex) {
      for (let i = startIndex; i <= endIndex; i++) {
        line.nodes[i].selected = true;
      }
    } else {
      for (let i = startIndex; i >= endIndex; i--) {
        line.nodes[i].selected = true;
      }
    }
  }

  /**
   * 行右选
   *
   * @param line 文本行
   * @param nodeId 节点id
   * @param pos 光标位置
   */
  static rightSelectOfLine(line: ITextLine, nodeId: string, pos: Direction): void {
    let nodeIndex: number = -1;
    if (nodeId) {
      nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
      // 光标在当前节点的右侧，表示不包含当前节点
      if (pos === Direction.RIGHT) {
        // 表示光标定位到了行尾，没有包含任何文本节点
        if (nodeIndex === line.nodes.length - 1) {
          return;
        }
        // 表示选区不包含当前节点，但是包含当前节点的右侧节点
        nodeIndex++;
      }
    } else {
      nodeIndex = 0;
    }
    // 根据给定范围，设置选中状态
    TextElementUtils.setNodeSelected(line, nodeIndex, line.nodes.length - 1);
  }

  /**
   * 行左选
   *
   * @param line 文本行
   * @param nodeId 节点id
   * @param pos 光标位置
   */
  static leftSelectOfLine(line: ITextLine, nodeId: string, pos: Direction): void {
    let nodeIndex: number = -1;
    if (nodeId) {
      nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
      // 光标在当前节点的左侧，表示不包含当前节点
      if (pos === Direction.LEFT) {
        // 表示光标定位到了行首，没有包含任何文本节点
        if (nodeIndex === 0) {
          return;
        }
        // 表示选区不包含当前节点，但是包含当前节点的左侧节点
        nodeIndex--;
      }
    } else {
      nodeIndex = 0;
    }
    // 根据给定范围，设置选中状态
    TextElementUtils.setNodeSelected(line, 0, nodeIndex);
  }

  /**
   * 行部分选
   *
   * @param line 文本行
   * @param startNodeId 起始节点id
   * @param startPos 起始位置
   * @param endNodeId 结束节点id
   * @param endPos 结束位置
   */
  static partialSelectOfLine(line: ITextLine, startNodeId: string, startPos: Direction, endNodeId: string, endPos: Direction): void {
    let startNodeIndex = -1;
    if (startNodeId) {
      startNodeIndex = line.nodes.findIndex(node => node.id === startNodeId);
    } else {
      startNodeIndex = 0;
    }
    // 结束节点索引
    let endNodeIndex = line.nodes.findIndex(node => node.id === endNodeId);
    // 如果起始节点索引小于结束节点索引，表示选区是从左到右
    if (startNodeIndex < endNodeIndex) {
      // 如果起始位置在节点的右侧，则当前节点不选中
      if (startPos === Direction.RIGHT) {
        startNodeIndex++;
      }
      // 如果结束位置在节点的左侧，则当前节点不选中
      if (endPos === Direction.LEFT) {
        endNodeIndex--;
      }
    } else {
      // 起始节点索引大于结束节点索引，表示选区是从右到左
      // 如果起始位置在节点的左侧，则当前节点不选中
      if (startPos === Direction.LEFT) {
        startNodeIndex--;
      }
      // 如果结束位置在节点的右侧，则当前节点不选中
      if (endPos === Direction.RIGHT) {
        endNodeIndex++;
      }
    }
    TextElementUtils.setNodeSelected(line, startNodeIndex, endNodeIndex);
  }

  /**
   * 标记文本选区
   *
   * @param textData 文本数据
   * @param selection 文本选区
   */
  static markTextSelected(textData: ITextData, selection: ITextSelection): void {
    const { lines } = textData;
    let { startCursor, endCursor } = selection;
    const { lineNumber: startLineNumber, nodeId: startNodeId, pos: startPos } = startCursor;
    const { lineNumber: endLineNumber, nodeId: endNodeId, pos: endPos } = endCursor;

    // 如果起始行号等于结束行号，表示选区在同一行
    if (startLineNumber === endLineNumber) {
      TextElementUtils.partialSelectOfLine(lines[startLineNumber], startNodeId, startPos, endNodeId, endPos);
      TextElementUtils.setLineSelectedIfy(lines[startLineNumber]);
    } else {
      // 起始行号小于结束行号，表示选区是从上到下，从左到右
      if (startLineNumber < endLineNumber) {
        for (let i = startLineNumber; i <= endLineNumber; i++) {
          const line = lines[i];
          const isEmptyLine = line.nodes.length === 0;
          if (isEmptyLine) {
            line.selected = true;
          } else {
            if (i === startLineNumber) {
              TextElementUtils.rightSelectOfLine(line, startNodeId, startPos);
            } else if (i === endLineNumber) {
              TextElementUtils.leftSelectOfLine(line, endNodeId, endPos);
            } else {
              TextElementUtils.setNodeSelected(line, 0, line.nodes.length - 1);
            }
            TextElementUtils.setLineSelectedIfy(line);
          }
        }
      } else {
        // 起始行号大于结束行号，表示选区是从上到下，从右到左
        for (let i = startLineNumber; i >= endLineNumber; i--) {
          const line = lines[i];
          const isEmptyLine = line.nodes.length === 0;
          if (isEmptyLine) {
            line.selected = true;
          } else {
            if (i === startLineNumber) {
              TextElementUtils.leftSelectOfLine(line, startNodeId, startPos);
            } else if (i === endLineNumber) {
              TextElementUtils.rightSelectOfLine(line, endNodeId, endPos);
            } else {
              TextElementUtils.setNodeSelected(line, 0, line.nodes.length - 1);
            }
            TextElementUtils.setLineSelectedIfy(line);
          }
        }
      }
    }
  }

  /**
   * 合并文本行的节点
   *
   * @param textData 文本数据
   * @param minLineNumber 最小行号
   * @param maxLineNumber 最大行号
   */
  static margeNodesOfLine(textData: ITextData, minLineNumber: number, maxLineNumber: number): void {
    // 将maxLineNumber行的节点合并到minLineNumber行
    const maxLine = textData.lines[maxLineNumber];
    const minLine = textData.lines[minLineNumber];
    // 删除选中的节点
    maxLine.nodes = maxLine.nodes.filter(node => !node.selected);
    minLine.nodes = minLine.nodes.filter(node => !node.selected);
    // 合并节点
    minLine.nodes.push(...maxLine.nodes);
    // 删除maxLineNumber行
    textData.lines.splice(maxLineNumber, 1);
  }

  /**
   * 删除文本行的选中节点
   *
   * @param line 文本行
   */
  static deleteSelectedNodesOfLine(line: ITextLine): void {
    line.nodes = line.nodes.filter(node => !node.selected);
  }

  /**
   * 获取文本行的最后一个节点
   *
   * @param textData 文本数据
   * @param lineNumber 行号
   * @returns 节点
   */
  static getTailNodeOfLine(textData: ITextData, lineNumber: number): ITextNode {
    if (0 <= lineNumber && lineNumber < textData.lines.length) {
      const line = textData.lines[lineNumber];
      return line.nodes[line.nodes.length - 1];
    }
    return null;
  }

  /**
   * 获取文本行的最后一个节点，如果是强制换行的行，则返回null
   *
   * @param textData 文本数据
   * @param lineNumber 行号
   * @returns 节点
   */
  static getTailNodeOfLineIfNotBreak(textData: ITextData, lineNumber: number): ITextNode {
    if (0 <= lineNumber && lineNumber < textData.lines.length) {
      const line = textData.lines[lineNumber];
      if (line.isTailBreak) {
        return null;
      }
      return line.nodes[line.nodes.length - 1];
    }
    return null;
  }

  /**
   * 获取文本行中最接近文本光标位置的节点,如果光标在文本行的最前面，则查找上一行的最后一个节点，如果上一行是强制换行的行，则返回null
   *
   * @param textData 文本数据
   * @param textCursor 文本光标
   * @returns 节点
   */
  static getAnchorNodeByCursor(
    textData: ITextData,
    textCursor: ITextCursor,
  ): {
    textNode: ITextNode;
    lineNumber: number;
    isHead: boolean;
  } {
    const { lineNumber, nodeId, pos } = textCursor;
    let textNode: ITextNode;
    let nodeLineNumber: number = lineNumber;
    let isHead = false;

    if (nodeId) {
      const line = textData.lines[lineNumber];
      const nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
      textNode = line.nodes[nodeIndex];
      if (pos === Direction.LEFT) {
        if (nodeIndex > 0) {
          textNode = line.nodes[nodeIndex - 1];
        } else {
          isHead = true;
        }
      }
    } else {
      isHead = true;
    }
    return {
      textNode,
      lineNumber: nodeLineNumber,
      isHead,
    };
  }

  /**
   * 获取文本行中最接近文本光标位置的节点的光标信息
   *
   * @param line 文本行
   * @param textCursor 文本光标
   * @param lineNumber 行号
   * @returns 光标信息
   */
  static getClosestNodeCursorOfLine(line: ITextLine, textCursor: ITextCursor, lineNumber: number): ITextCursor {
    if (textCursor.lineNumber === lineNumber) {
      return textCursor;
    }
    if (line.nodes.length > 0) {
      let xMinNode: ITextNode;
      for (let j = 0; j < line.nodes.length; j++) {
        const node = line.nodes[j];
        if (node.x + node.width <= textCursor.x) {
          xMinNode = node;
        }
      }
      if (xMinNode) {
        return TextElementUtils.getCursorOfNode(xMinNode, Direction.RIGHT, lineNumber);
      }
    }
    return TextElementUtils.getCursorOfLineStart(line, lineNumber);
  }

  /**
   * 获取文本数据中最接近文本光标位置的节点的光标信息
   *
   * @param textData 文本数据
   * @param textCursor 文本光标
   * @param direction 方向
   * @returns 光标信息
   */
  static getClosestNodeCursor(textData: ITextData, textCursor: ITextCursor, direction: Direction): ITextCursor {
    const { lines } = textData;
    const { lineNumber } = textCursor;
    if (direction === Direction.TOP) {
      if (lineNumber > 0) {
        return TextElementUtils.getClosestNodeCursorOfLine(lines[lineNumber - 1], textCursor, lineNumber - 1);
      }
    } else {
      if (lineNumber < lines.length - 1) {
        return TextElementUtils.getClosestNodeCursorOfLine(lines[lineNumber + 1], textCursor, lineNumber + 1);
      }
    }
    return textCursor;
  }

  /**
   * 获取节点的样式
   *
   * @param model 元素模型
   * @param node 节点
   * @returns 样式
   */
  static getStyleByNodeIfy(model: ElementObject, node: ITextNode): FontStyle {
    if (node) return LodashUtils.jsonClone(node.fontStyle) as FontStyle;
    const { fontSize, fontFamily, fontColor, fontColorOpacity, fontLineHeight } = model.styles;
    return {
      fontSize,
      fontFamily,
      fontColor,
      fontColorOpacity,
      fontLineHeight,
    };
  }

  /**
   * 获取选中的文本节点
   *
   * @param textData 文本数据
   * @returns 选中的文本节点
   */
  static pickSelectedContent(textData: ITextData): IMixinText[] {
    const { lines } = textData;
    const result: IMixinText[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.selected) {
        result.push(line);
      } else {
        const nodes = line.nodes.filter(node => node.selected);
        if (nodes.length > 0) {
          result.push(...nodes);
        }
      }
    }
    return result;
  }
}
