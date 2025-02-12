import { IPoint } from "@/types/index";
import { StrokeTypes } from "@/styles/ElementStyles";
import IElement from "@/types/IElement";

export default interface IStageSetter {
  // 设置组件位置
  setElementsPosition(elements: IElement[], value: IPoint): Promise<void>;
  // 设置组件宽度
  setElementsWidth(elements: IElement[], value: number): Promise<void>;
  // 设置组件高度
  setElementsHeight(elements: IElement[], value: number): Promise<void>;
  // 设置组件角度
  setElementsAngle(elements: IElement[], value: number): Promise<void>;
  // 设置组件Y倾斜角度
  setElementsLeanYAngle(elements: IElement[], value: number): Promise<void>;
  // 设置组件描边类型
  setElementsStrokeType(
    elements: IElement[],
    value: StrokeTypes,
  ): Promise<void>;
  // 设置组件描边宽度
  setElementsStrokeWidth(elements: IElement[], value: number): Promise<void>;
  // 设置组件描边颜色
  setElementsStrokeColor(elements: IElement[], value: string): Promise<void>;
  // 设置组件描边颜色透明度
  setElementsStrokeColorOpacity(
    elements: IElement[],
    value: number,
  ): Promise<void>;
  // 设置组件填充颜色
  setElementsFillColor(elements: IElement[], value: string): Promise<void>;
  // 设置组件填充颜色透明度
  setElementsFillColorOpacity(
    elements: IElement[],
    value: number,
  ): Promise<void>;
  // 设置组件文本对齐
  setElementsTextAlign(
    elements: IElement[],
    value: CanvasTextAlign,
  ): Promise<void>;
  // 设置组件文本基线
  setElementsTextBaseline(
    elements: IElement[],
    value: CanvasTextBaseline,
  ): Promise<void>;
  // 设置组件字体大小
  setElementsFontSize(elements: IElement[], value: number): Promise<void>;
  // 设置组件字体
  setElementsFontFamily(elements: IElement[], value: string): Promise<void>;
  // 设置组件比例锁定
  setElementsRatioLocked(elements: IElement[], value: boolean): Promise<void>;
}
