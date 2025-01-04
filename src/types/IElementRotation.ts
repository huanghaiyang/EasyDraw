import { IRotationModel } from "@/types/IModel";
import IElement from "@/types/IElement";
import { IPoint } from "@/types";
import IController from "@/types/IController";

export default interface IElementRotation extends IController {
  id: string;
  model: IRotationModel;
  element: IElement;

  refresh(): void;
  isContainsPoint(point: IPoint): boolean;
}