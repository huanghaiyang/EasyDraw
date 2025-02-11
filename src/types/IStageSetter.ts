import { IPoint } from "@/types/index";
import { StrokeTypes } from "@/styles/ElementStyles";
import IElement from "@/types/IElement";

export default interface IStageSetter {
  // 设置元素位置
  setElementsPosition(elements: IElement[], value: IPoint): Promise<void>;
  // 设置元素宽度
  setElementsWidth(elements: IElement[], value: number): Promise<void>;
  // 设置元素高度
  setElementsHeight(elements: IElement[], value: number): Promise<void>;
  // 设置元素角度
  setElementsAngle(elements: IElement[], value: number): Promise<void>;
  // 设置元素Y倾斜角度
  setElementsLeanYAngle(elements: IElement[], value: number): Promise<void>;
  // 设置元素描边类型
  setElementsStrokeType(
    elements: IElement[],
    value: StrokeTypes,
  ): Promise<void>;
  // 设置元素描边宽度
  setElementsStrokeWidth(elements: IElement[], value: number): Promise<void>;
  // 设置元素描边颜色
  setElementsStrokeColor(elements: IElement[], value: string): Promise<void>;
  // 设置元素描边颜色透明度
  setElementsStrokeColorOpacity(
    elements: IElement[],
    value: number,
  ): Promise<void>;
  // 设置元素填充颜色
  setElementsFillColor(elements: IElement[], value: string): Promise<void>;
  // 设置元素填充颜色透明度
  setElementsFillColorOpacity(
    elements: IElement[],
    value: number,
  ): Promise<void>;
  // 设置元素文本对齐
  setElementsTextAlign(
    elements: IElement[],
    value: CanvasTextAlign,
  ): Promise<void>;
  // 设置元素文本基线
  setElementsTextBaseline(
    elements: IElement[],
    value: CanvasTextBaseline,
  ): Promise<void>;
  // 设置元素字体大小
  setElementsFontSize(elements: IElement[], value: number): Promise<void>;
  // 设置元素字体
  setElementsFontFamily(elements: IElement[], value: string): Promise<void>;
  // 设置元素比例锁定
  setElementsRatioLocked(elements: IElement[], value: boolean): Promise<void>;
}
