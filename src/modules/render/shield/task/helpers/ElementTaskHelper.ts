import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IPoint } from "@/types";
import IElement, { IElementRect, IElementText } from "@/types/IElement";
import ITextData, { ITextCursor, ITextNode } from "@/types/IText";
import CanvasUtils from "@/utils/CanvasUtils";
import CommonUtils from "@/utils/CommonUtils";

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
   * @param element 文本元素
   * @param cursor 光标位置
   * @returns 光标位置
   */
  static getCursorPositionOfTextElement(element: IElementText, cursor: IPoint, rect: Partial<DOMRect>): ITextCursor {
    const [curPoint] = CanvasUtils.translatePoints([cursor], rect);
    const { x: cursorX, y: cursorY } = curPoint;
    const { lines } = element.model.data as ITextData;
    let nearestNode: ITextNode | undefined;

    lines.forEach(line => {
      line.nodes.forEach(node => {
        const { x, y, width, height } = node;
        if (cursorX >= x && cursorX <= x + width && cursorY >= y && cursorY <= y + height) {
          nearestNode = node;
        }
      });
    });

    if (nearestNode) {
      const { x, y, width, height } = nearestNode;
      return {
        x: x + width,
        y: y,
        height: height,
        width: 0,
        nearestNodeId: nearestNode.id,
      };
    }
  }
}
