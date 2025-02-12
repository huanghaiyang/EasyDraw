import IElement from "@/types/IElement";
import IStageShield from "@/types/IStageShield";

export interface IStageAlignFuncs {
  // 设置组件左对齐
  setElementsAlignLeft(elements: IElement[]): void;
  // 设置组件右对齐
  setElementsAlignRight(elements: IElement[]): void;
  // 设置组件上对齐
  setElementsAlignTop(elements: IElement[]): void;
  // 设置组件下对齐
  setElementsAlignBottom(elements: IElement[]): void;
  // 设置组件水平居中
  setElementsAlignCenter(elements: IElement[]): void;
  // 设置组件垂直居中
  setElementsAlignMiddle(elements: IElement[]): void;
  // 设置组件垂直平均分布
  setElementsAverageVertical(elements: IElement[]): void;
  // 设置组件水平平均分布
  setElementsAverageHorizontal(elements: IElement[]): void;
}

// 舞台对齐
export default interface IStageAlign extends IStageAlignFuncs {
  // 舞台
  shield: IStageShield;
}
