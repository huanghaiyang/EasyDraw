import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import IController from "@/types/IController";

export enum TransformerTypes {
  rect,
  circle
}

export interface ITransformer extends IController {
  element: IElement;
  id: string;
  isActive: boolean;
  get angle(): number;
}

// 方位坐标
export default interface IElementTransformer extends ITransformer, IPoint {
  points: IPoint[];
  isContainsPoint(point: IPoint): boolean;
}

export interface IElementBorderTransformer extends ITransformer {
  start: IPoint;
  end: IPoint;
  isClosest(point: IPoint): boolean;
}