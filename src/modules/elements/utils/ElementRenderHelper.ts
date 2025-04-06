import { IPoint } from "@/types";
import IElement from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";
import ElementUtils from "./ElementUtils";
import CanvasUtils from "@/utils/CanvasUtils";
import MathUtils from "@/utils/MathUtils";
import { RenderRect } from "@/types/IRender";

export default class ElementRenderHelper {
  /**
   * 获取旋转盒模型的rect
   *
   * 注意：
   *
   * 1. 此盒模型是相对于舞台的且根据画布进行了缩放
   * 2. 此盒模型不存在旋转或者倾斜，翻转的情况
   * 3. 此盒模型的宽度等于组件的宽度，但是高度不等于组件的高度，而是等于组件boxCoords的第一个坐标，垂直与boxCoords的第3、4个坐标的垂线段距离
   *
   * @param element
   * @returns
   */
  static calcElementRenderRect(element: IElement): Partial<DOMRect> {
    const { rotateBoxCoords, center } = element;
    return ElementRenderHelper.calcRenderRect(rotateBoxCoords, center, element.shield.stageScale);
  }

  /**
   * 计算渲染盒模型的rect
   *
   * @param rotateBoxCoords
   * @param center
   * @param scale
   * @returns
   */
  static calcRenderRect(rotateBoxCoords: IPoint[], center: IPoint, scale: number): Partial<DOMRect> {
    // 计算渲染盒子的画布坐标
    let rect = CommonUtils.calcRenderRect(rotateBoxCoords, center);
    // 根据画布的缩放比例进行缩放
    rect = CommonUtils.scaleRect(rect, scale);
    return rect;
  }

  /**
   * 将坐标转换到组件的渲染盒模型中
   *
   * @param coord
   * @param element
   * @param rect
   * @returns
   */
  static convertCoordInRect(coord: IPoint, element: IElement, rect: RenderRect): IPoint {
    const {
      angles,
      centerCoord,
      flipX,
      shield: { stageScale },
    } = element;
    // 如果文本组件是旋转或者倾斜的，那么就需要将给定的鼠标坐标，反向旋转倾斜，这样才可以正确计算出文本光标
    coord = MathUtils.transWithCenter(coord, angles, centerCoord, true);
    // 转换为舞台坐标
    let point = ElementUtils.calcStageRelativePoint(coord);
    // 根据画布的缩放比例进行缩放
    point = CommonUtils.scalePoint(point, stageScale);
    // 转换为组件的渲染盒模型坐标
    let [curPoint] = CanvasUtils.transPointsOfBox([point], rect);
    // 如果组件是y轴翻转的
    if (flipX) {
      // 计算镜像坐标
      curPoint = MathUtils.calcHorizontalSymmetryPointInRect(curPoint, CommonUtils.centerRectConversion(rect));
    }
    return curPoint;
  }
}
