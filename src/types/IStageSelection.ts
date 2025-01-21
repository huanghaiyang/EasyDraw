import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";
import IElementTransformer, { IElementBorderTransformer } from '@/types/IElementTransformer';
import IElementRotation from "@/types/IElementRotation";

// 舞台选区
export default interface IStageSelection {
  get isEmpty(): boolean;
  get isRange(): boolean;

  get selectionModel(): IMaskModel;
  get transformerModels(): IMaskModel[];

  setRange(points: IPoint[]): void;
  selectRange(): void;
  getModels(): IMaskModel[];
  
  selectTargets(): void;
  clearSelects(): void;
  hitTargetElements(point: IPoint): void;
  tryActiveElementRotation(point: IPoint): IElementRotation;
  tryActiveElementTransformer(point: IPoint): IElementTransformer;
  tryActiveElementBorderTransformer(point: IPoint): IElementBorderTransformer;
  deActiveElementsTransformers(): void;
  deActiveElementsBorderTransformers(): void;
  getActiveElementTransformer(): IElementTransformer;
  getActiveElementBorderTransformer(): IElementBorderTransformer;
  refreshRangeElements(rangePoints: IPoint[]): void;
  getElementOnPoint(point: IPoint): IElement;
  checkSelectContainsTarget(): boolean;

  calcSelectionModel(): IMaskModel;
  calcTransformerModels(): IMaskModel[];
  calcMultiSelectionModel(): IMaskModel;
  calcSingleSelectionModel(): IMaskModel;
  calcSingleTransformerModels(): IMaskModel[];
  calcMultiTransformerModels(): IMaskModel[];
  getRealTimeSelectionModel(): IMaskModel;
  getRealTimeTransformerModels(): IMaskModel[];

  refresh(): void;
  refreshSelectionModel(): void;
  refreshTransformerModels(): void;
}