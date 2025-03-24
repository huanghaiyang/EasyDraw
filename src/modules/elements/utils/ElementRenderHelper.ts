import { IPoint } from "@/types";
import IElement from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";

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
}
