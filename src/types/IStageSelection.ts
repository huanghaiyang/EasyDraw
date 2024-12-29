import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import { IMaskSelectionModel } from "@/types/IModel";

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
  checkTransformerElement(point: IPoint): IElement;
  refreshRangeElements(rangePoints: IPoint[]): void;
  getElementOnPoint(point: IPoint): IElement;
  checkSelectContainsTarget(): boolean;
}