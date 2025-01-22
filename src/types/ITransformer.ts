import { IPoint } from "@/types";
import IElement from "@/types/IElement";
import IStageSelection from "@/types/IStageSelection";
import IController from "@/types/IController";

export enum TransformerTypes {
  rect,
  circle
}

export default interface ITransformer extends IController {
  id: string;
  isActive: boolean;
  get angle(): number;
  host?: IElement | IStageSelection;

}

export interface IVerticesTransformer extends ITransformer, IPoint {
  points: IPoint[];
  isContainsPoint(point: IPoint): boolean;
}

export interface IBorderTransformer extends ITransformer {
  start: IPoint;
  end: IPoint;
  isClosest(point: IPoint): boolean;
}