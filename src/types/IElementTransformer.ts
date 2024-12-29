import { Directions, IPoint } from "@/types/index";

// 方位坐标
export default interface IElementTransformer extends IPoint {
  direction?: Directions;
  points: IPoint[];
  isActive: boolean;
  isContainsPoint(point: IPoint): boolean;
}