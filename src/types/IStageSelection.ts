import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import { IMaskSelectionModel } from "@/types/IModel";
import IElementTransformer, { IElementBorderTransformer } from '@/types/IElementTransformer';

// 舞台选区
export default interface IStageSelection {
  get isEmpty(): boolean;
  get isRange(): boolean;
  setRange(points: IPoint[]): void;
  selectRange(): void;
  getSelectionModels(): IMaskSelectionModel[];
  selectTarget(): void;
  clearSelects(): void;
  hitTargetElements(point: IPoint): void;
  checkTargetRotateElement(point: IPoint): IElement;
  tryActiveElementTransformer(point: IPoint): IElementTransformer;
  tryActiveElementBorderTransformer(point: IPoint): IElementBorderTransformer;
  getActiveElementTransformer(): IElementTransformer;
  getActiveElementBorderTransformer(): IElementBorderTransformer;
  refreshRangeElements(rangePoints: IPoint[]): void;
  getElementOnPoint(point: IPoint): IElement;
  checkSelectContainsTarget(): boolean;
}