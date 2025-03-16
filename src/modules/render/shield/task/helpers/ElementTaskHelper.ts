import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { IPoint } from "@/types";
import { TextCursorWidth } from "@/types/constants";
import IElement, { IElementRect } from "@/types/IElement";
import ITextData, { ITextCursor } from "@/types/IText";
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
   * @param textData 文本数据
   * @param position 光标位置
   * @param rect 旋转盒模型的rect
   * @returns 光标位置
   */
  static getTextCursorByPosition(textData: ITextData, position: IPoint, rect: Partial<DOMRect>): ITextCursor {
    // 将当前鼠标位置转换为文本坐标系的坐标（文本坐标系是相对于文本的中心节点计算的）
    const [curPoint] = CanvasUtils.translatePoints([position], rect);
    const { x: cursorX, y: cursorY } = curPoint;
    const { lines } = textData;

    // 遍历所有文本行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 遍历当前文本行的所有节点
      for (let j = 0; j < line.nodes.length; j++) {
        const node = line.nodes[j];
        const { x, y, width, height } = node;
        // 判断当前光标是否在当前节点内
        if (cursorX >= x && cursorX <= x + width && cursorY >= y && cursorY <= y + height) {
          let pX = x;
          // 判断当前光标是否在当前节点的右侧位置
          if (cursorX >= x + width / 2) {
            // 则光标位置为当前节点右侧
            pX = x + width;
          }
          // 返回光标信息
          return {
            x: pX,
            y,
            height,
            width: TextCursorWidth * CanvasUtils.scale,
            nearestNodeId: node.id,
            rotateBoxRect: rect,
          };
        }
      }
    }
  }
}
