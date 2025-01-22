import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";
import IElementRotation from "@/types/IElementRotation";
import IStageShield from "@/types/IStageShield";
import { IVerticesTransformer } from "@/types/ITransformer";
import { IBorderTransformer } from "@/types/ITransformer";

// 舞台选区
export default interface IStageSelection {
  shield: IStageShield;

  get isEmpty(): boolean;
  get isRange(): boolean;

  get selectionModel(): IMaskModel;
  get transformerModels(): IMaskModel[];
  get center(): IPoint;

  setRange(points: IPoint[]): void;
  selectRange(): void;
  getModels(): IMaskModel[];
  
  selectTargets(): void;
  clearSelects(): void;
  hitTargetElements(point: IPoint): void;
  tryActiveElementRotation(point: IPoint): IElementRotation;
  tryActiveElementTransformer(point: IPoint): IVerticesTransformer;
  tryActiveElementBorderTransformer(point: IPoint): IBorderTransformer;
  deActiveElementsTransformers(): void;
  deActiveElementsBorderTransformers(): void;
  getActiveElementTransformer(): IVerticesTransformer;
  getActiveElementBorderTransformer(): IBorderTransformer;
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