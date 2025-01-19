import IElement from "@/types/IElement";
import IStageShield from "@/types/IStageShield";

export interface IStageAlignFuncs {
  setElementsAlignLeft(elements: IElement[]): void;
  setElementsAlignRight(elements: IElement[]): void;
  setElementsAlignTop(elements: IElement[]): void;
  setElementsAlignBottom(elements: IElement[]): void;
  setElementsAlignCenter(elements: IElement[]): void;
  setElementsAlignMiddle(elements: IElement[]): void;
  setElementsAverageVertical(elements: IElement[]): void;
  setElementsAverageHorizontal(elements: IElement[]): void;
}

export default interface IStageAlign extends IStageAlignFuncs {
  shield: IStageShield;
}