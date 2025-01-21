import IStageSelection from "@/modules/stage/StageSelection";
import IController from "@/types/IController";
import { IPoint } from "@/types";

export default interface IStageTransformer extends IController, IPoint {
  selection: IStageSelection;
  id: string;
  isActive: boolean;
  get angle(): number;
}

export interface IStageVerticesTransformer extends IStageTransformer {
  points: IPoint[];
  isContainsPoint(point: IPoint): boolean;
}

export interface IStageBorderTransformer extends IStageTransformer {
  start: IPoint;
  end: IPoint;
  isClosest(point: IPoint): boolean;
}

