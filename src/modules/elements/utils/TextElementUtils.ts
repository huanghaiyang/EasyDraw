import { FontStyle, FontStyleSet, TextFontStyle } from "@/styles/ElementStyles";
import { Direction, IPoint } from "@/types";
import { TextCursorWidth } from "@/types/constants";
import { ElementObject } from "@/types/IElement";
import ITextData, { ITextCursor, ITextLine, ITextNode, ITextSelection } from "@/types/IText";
import CommonUtils from "@/utils/CommonUtils";
import LodashUtils from "@/utils/LodashUtils";
import { pick, every } from "lodash";
import { nanoid } from "nanoid";

/**
 * 获取文本光标与文本节点的对应关系，并更新光标位置和宽高
 *
 * @param node 文本节点
 * @param pos 光标位置
 * @param lineNumber 行号
 * @returns 光标信息
 */
function getCursorPropsOfNode(node: ITextNode, pos: Direction, lineNumber: number): Partial<ITextCursor> {
  const { id, x, y, height, width } = node;
  return {
    nodeId: id,
    pos,
    lineNumber,
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
 * @param lineNumber 行号
 * @returns 光标信息
 */
function getCursorPropsOfLineHead(line: ITextLine, lineNumber: number): Partial<ITextCursor> {
  const { x, y, height } = line;
  return {
    lineNumber,
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
 * @param lineNumber 行号
 * @returns 光标信息
 */
function getCursorPropsOfLineEnd(line: ITextLine, lineNumber: number): Partial<ITextCursor> {
  const { nodes } = line;
  const node = nodes[nodes.length - 1];
  if (node) {
    return getCursorPropsOfNode(node, Direction.RIGHT, lineNumber);
  } else {
    return getCursorPropsOfLineHead(line, lineNumber);
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
   * @param fontStyle 样式
   * @returns 文本节点
   */
  static createTextNode(value: string, fontStyle: FontStyle): ITextNode {
    return {
      id: nanoid(),
      content: value,
      fontStyle,
    };
  }

  /**
   * 创建文本行
   *
   * @param content 文本内容
   * @param fontStyle 文本样式
   * @returns 文本行
   */
  static createTextLines(content: string, fontStyle: TextFontStyle): ITextLine[] {
    const lines: ITextLine[] = [];
    content.split("\n").forEach(line => {
      const nodes = line.split("").map(char => {
        return TextElementUtils.createTextNode(char, { ...fontStyle });
      });
      lines.push({ nodes, isTailBreak: true, fontStyle: { ...fontStyle } });
    });
    return lines;
  }

  /**
   * 创建文本数据

   * @param content 文本内容
   * @param fontStyle 文本样式
   * @returns 文本数据
   */
  static createTextData(content: string, fontStyle: TextFontStyle): ITextData {
    fontStyle = pick(fontStyle, ["fontFamily", "fontSize", "fontColor", "fontColorOpacity"]);
    const lines: ITextLine[] = this.createTextLines(content, fontStyle);
    return {
      lines,
    };
  }

  /**
   * 获取光标位置
   *
   * @param textData 文本数据
   * @param point 光标位置
   * @returns 光标位置
   */
  static getTextCursorAtPosition(textData: ITextData, point: IPoint): ITextCursor {
    const textCursor: ITextCursor = {};
    const { lines } = textData;
    let line: ITextLine;
    let lineNumber = -1;
    for (let i = 0; i < lines.length; i++) {
      const curLine = lines[i];
      // 判断当前光标是否在当前文本行内
      if (CommonUtils.isPointInRect(curLine, point)) {
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
        if (CommonUtils.isPointInRect(node, point)) {
          let pos = Direction.LEFT;
          // 判断当前光标是否在当前节点的右侧位置
          if (point.x >= node.x + node.width / 2) {
            pos = Direction.RIGHT;
          }
          Object.assign(textCursor, getCursorPropsOfNode(node, pos, lineNumber));
          break;
        }
      }
      if (!textCursor.nodeId) {
        Object.assign(textCursor, getCursorPropsOfLineEnd(line, lineNumber));
      }
    } else {
      lineNumber = lines.length - 1;
      // 如果没有找到，则将光标移动到文本的最后一行
      textCursor.lineNumber = lineNumber;
      Object.assign(textCursor, getCursorPropsOfLineEnd(lines[lineNumber], lineNumber));
    }
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
      cursor = getCursorPropsOfNode(node, Direction.RIGHT, lineNumber);
    } else {
      cursor = getCursorPropsOfLineHead(line, lineNumber);
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
      cursor = getCursorPropsOfLineHead(line, lineNumber);
    } else {
      cursor = getCursorPropsOfNode(line.nodes[0], Direction.LEFT, lineNumber);
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
    const cursor = getCursorPropsOfLineHead(line, lineNumber);
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
    const cursor = getCursorPropsOfNode(node, pos, lineNumber);
    cursor.lineNumber = lineNumber;
    return cursor;
  }

  /**
   * 根据节点id查找文本行
   *
   * @param textData 文本数据
   * @param nodeId 节点id
   * @returns 文本行
   */
  static getLineByNodeId(textData: ITextData, nodeId: string): number {
    const { lines } = textData;
    return lines.findIndex(line => line.nodes.some(node => node.id === nodeId));
  }

  /**
   * 给定文本行和光标，获取更新后的光标信息
   *
   * @param line 文本行
   * @param lineNumber 行号
   * @param textCursor 文本光标
   * @param pos 光标位置
   * @returns 更新后的光标信息
   */
  static getUpdatedCursorPropsOfLine(line: ITextLine, lineNumber: number, textCursor: ITextCursor, pos: Direction): Partial<ITextCursor> {
    if (!line) return;
    const { nodeId } = textCursor;
    let node: ITextNode;
    if (nodeId) node = line.nodes.find(node => node.id === nodeId);
    if (node) return getCursorPropsOfNode(node, pos, lineNumber);
    return getCursorPropsOfLineHead(line, lineNumber);
  }

  /**
   * 根据节点id获取文本节点的光标信息，此方法用于更新光标位置，例如舞台滚动或者缩放时，需要更新光标位置
   *
   * @param textData 文本数据
   * @param textCursor 文本光标
   * @returns 光标信息
   */
  static getUpdatedCursorProps(textData: ITextData, textCursor: ITextCursor): Partial<ITextCursor> {
    let { pos, nodeId, lineNumber } = textCursor;
    if (nodeId) {
      lineNumber = TextElementUtils.getLineByNodeId(textData, nodeId);
    }
    if (lineNumber === -1) return;
    return TextElementUtils.getUpdatedCursorPropsOfLine(textData.lines[lineNumber], lineNumber, textCursor, pos);
  }

  /**
   * 判断文本选区是否可用
   *
   * @param selection 文本选区
   * @returns 是否可用
   */
  static isTextSelectionAvailable(selection: ITextSelection): boolean {
    if (!selection) return false;
    const { startCursor, endCursor } = selection;
    if (!startCursor || !endCursor) return false;
    const { lineNumber: startLineNumber, nodeId: startNodeId, pos: startPos } = startCursor;
    const { lineNumber: endLineNumber, nodeId: endNodeId, pos: endPos } = endCursor;
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
      const nodeIndex = TextElementUtils.getTextNodeIndexOfLine(line, nodeId);
      if (nodeIndex !== -1) {
        return nodeIndex;
      }
    }
    return -1;
  }

  /**
   * 获取文本行中节点的索引
   *
   * @param textLine 文本行
   * @param nodeId 节点id
   * @returns 节点索引
   */
  static getTextNodeIndexOfLine(textLine: ITextLine, nodeId: string): number {
    return textLine.nodes.findIndex(node => node.id === nodeId);
  }

  /**
   * 对光标进行排序
   *
   * @param textData 文本数据
   * @param cursors 光标数组
   * @returns 排序后的光标数组
   */
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
   * 判断给定的两个光标是否指向的是同一个位置
   *
   * @param cursorA 光标A
   * @param cursorB 光标B
   * @param textData 文本数据
   * @returns 是否指向同一个位置
   */
  static isCursorAtSamePosition(cursorA: ITextCursor, cursorB: ITextCursor, textData?: ITextData): boolean {
    if (TextElementUtils.isCursorEqual(cursorA, cursorB)) return true;
    if ((!cursorA && !!cursorB) || (!cursorB && !!cursorA)) return false;
    if (textData) {
      const { nodeId: aNodeId, lineNumber: aLineNumber, pos: aPos } = cursorA;
      const { nodeId: bNodeId, lineNumber: bLineNumber, pos: bPos } = cursorB;
      if (aLineNumber === bLineNumber) {
        const aNodeIndex = TextElementUtils.getTextNodeIndexOfLine(textData.lines[aLineNumber], aNodeId);
        const bNodeIndex = TextElementUtils.getTextNodeIndexOfLine(textData.lines[bLineNumber], bNodeId);
        if (aNodeIndex !== -1 && bNodeIndex !== -1) {
          if (aNodeIndex + 1 === bNodeIndex && aPos === Direction.RIGHT && bPos === Direction.LEFT) return true;
          if (aNodeIndex - 1 === bNodeIndex && aPos === Direction.LEFT && bPos === Direction.RIGHT) return true;
        }
      }
    }
    return false;
  }

  /**
   * 判断两个光标是否相等(是否在同一个位置)
   *
   * @param cursorA 光标A
   * @param cursorB 光标B
   * @returns 是否相等
   */
  static isCursorEqual(cursorA: ITextCursor, cursorB: ITextCursor): boolean {
    return !!cursorA && !!cursorB && cursorA.lineNumber === cursorB.lineNumber && cursorA.nodeId === cursorB.nodeId && cursorA.pos === cursorB.pos;
  }

  /**
   * 判断两个选区是否相等(只比较开始位置)
   *
   * @param selectionA 选区A
   * @param selectionB 选区B
   * @param textData 文本数据
   * @returns 是否相等
   */
  static isSelectionEqualWithStart(selectionA: ITextSelection, selectionB: ITextSelection, textData?: ITextData): boolean {
    return !!selectionA && !!selectionB && !!selectionA.startCursor && !!selectionB.startCursor && TextElementUtils.isCursorAtSamePosition(selectionA.startCursor, selectionB.startCursor, textData);
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
   * 创建新的字体样式集合
   * @returns 字体样式集合
   */
  static newFontStyleSet(): FontStyleSet {
    return {
      fontFamilies: new Set(),
      fontSizes: new Set(),
      fontColors: new Set(),
      fontColorOpacities: new Set(),
    };
  }

  /**
   * 解析样式并缓存
   *
   * @param fontStyle
   * @param result
   */
  static cacheStyleSet(fontStyle: FontStyle, result: FontStyleSet): void {
    if (!fontStyle) return;

    if (fontStyle.fontFamily) {
      result.fontFamilies.add(fontStyle.fontFamily);
    }
    if (fontStyle.fontSize) {
      result.fontSizes.add(fontStyle.fontSize);
    }
    if (fontStyle.fontColor) {
      result.fontColors.add(fontStyle.fontColor);
    }
    if (fontStyle.fontColorOpacity) {
      result.fontColorOpacities.add(fontStyle.fontColorOpacity);
    }
  }

  /**
   * 缓存文本节点样式
   *
   * @param node
   * @param result
   */
  static cacheStyleSetOfNode(node: ITextNode, result: FontStyleSet): void {
    const { fontStyle } = node;
    TextElementUtils.cacheStyleSet(fontStyle, result);
  }

  /**
   * 获取文本节点的样式
   *
   * @param node
   * @returns
   */
  static getStyleSetOfNode(node: ITextNode): FontStyleSet {
    const result: FontStyleSet = TextElementUtils.newFontStyleSet();
    TextElementUtils.cacheStyleSetOfNode(node, result);
    return result;
  }

  /**
   * 获取文本节点的字体样式
   *
   * @param nodes 文本节点数组
   * @returns 字体样式
   */
  static getStyleSetOfNodes(nodes: ITextNode[]): FontStyleSet {
    const result: FontStyleSet = TextElementUtils.newFontStyleSet();
    for (let i = 0; i < nodes.length; i++) {
      TextElementUtils.cacheStyleSetOfNode(nodes[i], result);
    }
    return result;
  }

  /**
   * 获取文本数据中的字体样式
   *
   * @param textData 文本数据
   * @returns 字体样式
   */
  static getStyleSetOfTextData(textData: ITextData, selected?: boolean): FontStyleSet {
    const result: FontStyleSet = {
      fontFamilies: new Set(),
      fontSizes: new Set(),
      fontColors: new Set(),
      fontColorOpacities: new Set(),
    };
    textData.lines.forEach(line => {
      line.nodes.forEach(node => {
        if (!selected || (selected && node.selected)) {
          TextElementUtils.cacheStyleSetOfNode(node, result);
        }
      });
    });
    return result;
  }

  /**
   * 给定光标，获取参考节点或行
   *
   * @param cursor
   * @param textData
   * @returns
   */
  static getReferByCursor(cursor: ITextCursor, textData: ITextData): ITextNode | ITextLine {
    const { lineNumber, nodeId, pos } = cursor;
    const line = textData.lines[lineNumber];
    if (!nodeId) return line;
    const nodeIndex = line.nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex !== -1) {
      const node = line.nodes[nodeIndex];
      if (nodeIndex === 0 || pos === Direction.RIGHT) {
        return node;
      }
      return line.nodes[nodeIndex - 1];
    }
    return line;
  }

  /**
   * 给定光标，返回参考样式
   *
   * @param cursor
   * @param textData
   * @returns
   */
  static getReferFontStyleByCursor(cursor: ITextCursor, textData: ITextData): FontStyle {
    const refer = TextElementUtils.getReferByCursor(cursor, textData);
    if (refer) return refer.fontStyle;
  }

  /**
   * 给定光标，返回参考样式集合
   *
   * @param cursor
   * @param textData
   * @returns
   */
  static getStyleSetByCursor(cursor: ITextCursor, textData: ITextData): FontStyleSet {
    const style = TextElementUtils.getReferFontStyleByCursor(cursor, textData);
    const result: FontStyleSet = TextElementUtils.newFontStyleSet();
    TextElementUtils.cacheStyleSet(style, result);
    return result;
  }

  /**
   * 标记文本节点为未选中状态
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
    } else if (startNodeIndex > endNodeIndex) {
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
   * 获取元素模型的样式
   *
   * @param model 元素模型
   * @returns 样式
   */
  static getFontStyleOfModel(model: ElementObject): FontStyle {
    return pick(model.styles, ["fontSize", "fontFamily", "fontColor", "fontColorOpacity", "fontLineHeight"]);
  }

  /**
   * 获取节点的样式
   *
   * 1. 如果节点有样式，则返回节点的样式
   * 2. 如果行有样式，则返回行的样式
   * 3. 否则返回元素模型的样式
   *
   * @param model 元素模型
   * @param node 节点
   * @param line 行
   * @returns 样式
   */
  static getStyleByNodeIfy(model: ElementObject, node: ITextNode, line?: ITextLine): FontStyle {
    if (node && node.fontStyle) return LodashUtils.jsonClone(node.fontStyle) as FontStyle;
    if (line && line.fontStyle) return LodashUtils.jsonClone(line.fontStyle) as FontStyle;
    return TextElementUtils.getFontStyleOfModel(model);
  }

  /**
   * 获取行尾节点的样式
   *
   * 1. 如果行尾有节点，则返回节点的样式
   * 2. 如果行尾没有节点且行有样式，则返回行的样式
   * 3. 如果行尾没有节点且行没有样式，则返回元素模型的样式
   *
   * @param model 元素模型
   * @param line 文本行
   * @returns 样式
   */
  static getStyleOfLineEnd(model: ElementObject, line: ITextLine): FontStyle {
    const { nodes, fontStyle } = line;
    if (nodes.length) {
      return TextElementUtils.getStyleByNodeIfy(model, nodes[nodes.length - 1]);
    }
    if (fontStyle) return LodashUtils.jsonClone(fontStyle) as FontStyle;
    return TextElementUtils.getFontStyleOfModel(model);
  }

  /**
   * 获取选中的文本节点
   *
   * @param textData 文本数据
   * @returns 选中的文本节点
   */
  static pickSelectedContent(textData: ITextData): ITextLine[] {
    const { lines } = textData;
    const result: ITextLine[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.selected) {
        result.push({
          ...line,
          isFull: true,
        });
      } else {
        const nodes = line.nodes.filter(node => node.selected);
        if (nodes.length > 0) {
          result.push({
            nodes,
            isFull: false,
          });
        }
      }
    }
    return result;
  }

  /**
   * 判断是否为文本节点
   *
   * @param obj 对象
   * @returns 是否为文本节点
   */
  static isTextNode(obj: Object): boolean {
    return ["id", "content", "fontStyle"].every(key => key in obj);
  }

  /**
   * 判断是否为文本行
   *
   * @param obj 对象
   * @returns 是否为文本行
   */
  static isTextLine(obj: Object): boolean {
    return ["nodes"].every(key => key in obj);
  }

  /**
   * 复制文本节点
   *
   * @param textNode 文本节点
   * @returns 复制的文本节点
   */
  static cloneTextNode(textNode: ITextNode): ITextNode {
    const { content, fontStyle } = textNode;
    return {
      id: nanoid(),
      content,
      fontStyle: LodashUtils.jsonClone(fontStyle),
    };
  }

  /**
   * 批量复制文本节点
   *
   * @param textNodes 文本节点数组
   * @returns 复制的文本节点数组
   */
  static batchCloneTextNodes(textNodes: ITextNode[]): ITextNode[] {
    return textNodes.map(TextElementUtils.cloneTextNode);
  }

  /**
   * 复制文本行
   *
   * @param line 文本行
   * @returns 复制的文本行
   */
  static cloneTextLine(line: ITextLine): ITextLine {
    const { nodes, isTailBreak, isFull, fontStyle } = line;
    return {
      nodes: TextElementUtils.batchCloneTextNodes(nodes),
      isTailBreak,
      isFull,
      fontStyle: LodashUtils.jsonClone(fontStyle),
    };
  }

  /**
   * 批量复制文本行
   *
   * @param lines 文本行数组
   * @returns 复制的文本行数组
   */
  static batchCloneTextLine(lines: ITextLine[]): ITextLine[] {
    return lines.map(TextElementUtils.cloneTextLine);
  }

  /**
   * 解析混合文本
   *
   * @param text 文本
   * @returns 混合文本
   */
  static parseTextLines(text: string): ITextLine[] {
    let result: ITextLine[] = [];
    try {
      const textLines = JSON.parse(text);
      if (Array.isArray(textLines) && textLines.every(obj => TextElementUtils.isTextLine(obj))) {
        result = TextElementUtils.batchCloneTextLine(textLines);
      }
    } catch (e) {
      e && console.warn(e);
    }
    return result;
  }

  /**
   * 重新计算文本行
   *
   * @param textLines 文本行
   * @param width 宽度
   * @param scale 缩放
   * @returns 文本行
   */
  static reflowTextLines(textLines: ITextLine[], width: number, scale: number): ITextLine[] {
    const lines = TextElementUtils.restoreTextLines(textLines);
    return TextElementUtils.calcReflowTextLines(lines, width, scale);
  }

  /**
   * 恢复文本行
   *
   * @param textLines 文本行
   * @returns 文本行
   */
  static restoreTextLines(textLines: ITextLine[]): ITextLine[] {
    if (textLines.length === 0) return [];
    let result: ITextLine[] = [
      {
        nodes: [],
        width: 0,
      },
    ];
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const { nodes, isTailBreak, fontStyle } = line;
      const tailLine = result[result.length - 1];
      tailLine.nodes.push(...nodes);
      tailLine.isTailBreak = isTailBreak;
      if (isTailBreak) {
        tailLine.fontStyle = fontStyle;
      }
      tailLine.width += nodes.reduce((prev, curr) => prev + curr.width, 0);
      if (isTailBreak && i < textLines.length - 1) {
        result.push({
          nodes: [],
          width: 0,
        });
      }
    }
    return result;
  }

  /**
   * 重新排列文本行
   *
   * @param textLines 文本行
   * @param width 宽度
   * @param scale 缩放
   * @returns 文本行
   */
  static calcReflowTextLines(textLines: ITextLine[], width: number, scale: number): ITextLine[] {
    if (textLines.length === 0) return [];
    const result: ITextLine[] = [];
    let currentLine: ITextLine = {
      nodes: [],
    };
    let currentWidth = 0;
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const { nodes, isTailBreak, fontStyle = {} } = line;
      // 如果当前行的节点数量为0，则直接添加到结果中
      if (nodes.length === 0) {
        result.push({
          nodes: [],
          isTailBreak,
          fontStyle,
        });
        continue;
      }
      // 遍历节点
      for (let j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        const nWidth = node.width / scale;
        if (currentWidth + nWidth <= width) {
          // 如果当前行的宽度小于给定宽度，则将当前节点添加到当前行中
          currentLine.nodes.push(node);
          currentWidth += nWidth;
        } else {
          // 出现这种情况是因为单个字符的宽度已经超出了给定宽度
          if (currentLine.nodes.length === 0) {
            result.push({
              nodes: [node],
            });
            currentLine.nodes = [];
            currentWidth = 0;
          } else {
            // 如果当前行的宽度大于给定宽度，则将当前行添加到结果中，并将当前节点添加到新的行中
            result.push({ ...LodashUtils.jsonClone(currentLine), fontStyle: { ...fontStyle } });
            currentLine.nodes = [node];
            currentWidth = nWidth;
          }
        }
      }
      // 如果当前行的节点数量大于0，新添加一行
      if (currentLine.nodes.length > 0) {
        result.push({ ...LodashUtils.jsonClone(currentLine), fontStyle: { ...fontStyle } });
      }
      // 如果当前行是尾部换行，则将尾部换行更新到最后一行上
      if (isTailBreak) {
        result[result.length - 1].isTailBreak = isTailBreak;
      }
      // 重置当前行
      currentLine.nodes = [];
      currentWidth = 0;
    }
    return result;
  }

  /**
   * 计算文本行的最大宽度
   *
   * @param textLines 文本行
   * @param scale 缩放
   * @returns 最大宽度
   */
  static calcMaxLineWidth(textLines: ITextLine[], scale: number): number {
    if (textLines.length === 0) return 0;
    let maxWidth = 0;
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const { width } = line;
      maxWidth = Math.max(maxWidth, width / scale);
    }
    return maxWidth;
  }

  /**
   * 通过重新计算文本行的节点宽度来计算文本行的最大宽度
   *
   * @param textLines 文本行
   * @param scale 缩放
   * @returns 最大宽度
   */
  static calcMaxLineWidthByNodes(textLines: ITextLine[], scale: number): number {
    if (textLines.length === 0) return 0;
    let maxWidth = 0;
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const { nodes } = line;
      maxWidth = Math.max(maxWidth, nodes.reduce((prev, curr) => prev + curr.width, 0) / scale);
    }
    return maxWidth;
  }

  /**
   * 计算文本的总高度
   *
   * @param textLines 文本行
   * @param scale 缩放
   * @returns 高度
   */
  static calcTextHeight(textLines: ITextLine[], scale: number): number {
    if (textLines.length === 0) return 0;
    return textLines.reduce((prev, curr) => prev + curr.height, 0) / scale;
  }
}
