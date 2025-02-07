import IElement from "@/types/IElement";
import IStageShield from "@/types/IStageShield";

export interface IStageAlignFuncs {
  // 设置元素左对齐
  setElementsAlignLeft(elements: IElement[]): void;
  // 设置元素右对齐
  setElementsAlignRight(elements: IElement[]): void;
  // 设置元素上对齐
  setElementsAlignTop(elements: IElement[]): void;
  // 设置元素下对齐
  setElementsAlignBottom(elements: IElement[]): void;
  // 设置元素水平居中
  setElementsAlignCenter(elements: IElement[]): void;
  // 设置元素垂直居中
  setElementsAlignMiddle(elements: IElement[]): void;
  // 设置元素垂直平均分布
  setElementsAverageVertical(elements: IElement[]): void;
  // 设置元素水平平均分布
  setElementsAverageHorizontal(elements: IElement[]): void;
}

// 舞台对齐
export default interface IStageAlign extends IStageAlignFuncs {
  // 舞台
  shield: IStageShield;
}
