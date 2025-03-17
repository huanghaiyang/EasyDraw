import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IPoint } from "@/types";
import { TextCursorWidth } from "@/types/constants";
import IElement, { IElementRect } from "@/types/IElement";
import ITextData, { ITextCursor, ITextLine, ITextNode } from "@/types/IText";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";

/**
 * 获取文本光标与文本节点的对应关系，并更新光标位置和宽高
 *
 * @param node 文本节点
 * @param pos 光标位置
 * @returns 光标信息
 */
function getTextCursorNodeAbout(node: ITextNode, pos: number): Partial<ITextCursor> {
  const { id, x, y, height, width } = node;
  return {
    nodeId: id,
    pos,
    x: x + (pos === 1 ? width : 0),
    y,
    width: TextCursorWidth,
    height,
  };
}

/**
 * 尝试将光光标绑定到行末尾的节点上，如果当前行没有节点，则将光标移动到行首位置
 *
 * @param textCursor
 * @param line
 * @returns 光标信息
 */
function getTextCursorLineAbout(line: ITextLine): Partial<ITextCursor> {
  const { nodes } = line;
  const node = nodes[nodes.length - 1];
  if (node) {
    return getTextCursorNodeAbout(node, 1);
  } else {
    const { x, y, height } = line;
    return {
      x,
      y,
      width: TextCursorWidth,
      height,
    };
  }
}

export default class ElementTaskHelper {
  /**
   * 绘制
   *
   * @param element
   * @param canvas
   */
  static draw(element: IElementRect, canvas: HTMLCanvasElement): void {
    const {
      arcCoords,
      arcFillCoords,
      model: { styles },
      angle,
      flipX,
      leanY,
      actualAngle,
    } = element;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    const arcPoints = ElementUtils.batchCalcStageRelativeArcPoints(arcCoords);
    const arcFillPoints = ElementUtils.calcStageRelativeArcPoints(arcFillCoords);

    const rect = ElementTaskHelper.getRotateBoxRect(element);
    styles.fills.forEach(fillStyle => {
      CanvasUtils.drawInnerArcPathFillWithScale(canvas, rect, arcFillPoints, fillStyle, options);
    });

    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(canvas, points, rect, styles.strokes[index], options);
    });
  }

  /**
   * 获取旋转盒模型的rect
   *
   * @param element
   * @returns
   */
  static getRotateBoxRect(element: IElement): Partial<DOMRect> {
    const { rotateBoxCoords, center } = element;
    let rect = CommonUtils.calcRotateBoxRect(rotateBoxCoords, center);
    rect = CommonUtils.scaleRect(rect, element.shield.stageScale);
    return rect;
  }

  /**
   * 获取光标位置
   *
   * @param textData 文本数据
   * @param position 光标位置
   * @param rect 旋转盒模型的rect
   * @returns 光标位置
   */
  static getTextCursorByPosition(textData: ITextData, position: IPoint, rect: Partial<DOMRect>): ITextCursor {
    const textCursor: ITextCursor = {};
    // 将当前鼠标位置转换为文本坐标系的坐标（文本坐标系是相对于文本的中心节点计算的）
    const [curPoint] = CanvasUtils.transPointsOfBox([position], rect);
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
          let pos = 0;
          // 判断当前光标是否在当前节点的右侧位置
          if (curPoint.x >= node.x + node.width / 2) {
            pos = 1;
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
    textCursor.rotateBoxRect = rect;
    return textCursor;
  }

  /**
   * 根据节点id获取文本节点的光标信息，此方法用于更新光标位置，例如舞台滚动或者缩放时，需要更新光标位置
   *
   * @param textData 文本数据
   * @param textCursor 文本光标
   * @returns 光标信息
   */
  static getTextCursorUpdatedProps(textData: ITextData, textCursor: ITextCursor): Partial<ITextCursor> {
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
}
