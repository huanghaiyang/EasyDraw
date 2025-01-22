import { IRotationModel } from "@/types/IModel";
import IElement from "@/types/IElement";
import { IPoint } from "@/types";

export default interface IElementRotation {
  id: string;
  model: IRotationModel;
  element: IElement;

  refresh(): void;
  isContainsPoint(point: IPoint): boolean;
}