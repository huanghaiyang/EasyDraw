import { Directions, IPoint } from "@/types/index";
import IElement from "@/types/IElement";

export interface ITransformer {
  element: IElement;
  id: string;
  isActive: boolean;
  get angle(): number;
}

// 方位坐标
export default interface IElementTransformer extends ITransformer, IPoint {
  direction?: Directions;
  points: IPoint[];
  isContainsPoint(point: IPoint): boolean;
}

export interface IElementBorderTransformer extends ITransformer {
  start: IPoint;
  end: IPoint;
  isClosest(point: IPoint): boolean;
}