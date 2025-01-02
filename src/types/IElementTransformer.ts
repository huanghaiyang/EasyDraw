import { Directions, IPoint } from "@/types/index";

// 方位坐标
export default interface IElementTransformer extends IPoint {
  id: string;
  direction?: Directions;
  points: IPoint[];
  isActive: boolean;
  isContainsPoint(point: IPoint): boolean;
}

export interface IElementBorderTransformer {
  id: string;
  start: IPoint,
  end: IPoint,
  isActive: boolean,
  isClosest(point: IPoint): boolean;
}