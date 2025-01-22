import { IPoint } from "@/types";
import IElement from "@/types/IElement";
import IStageSelection from "@/types/IStageSelection";
import IController from "@/types/IController";

// 变换器类型
export enum TransformerTypes {
  // 矩形
  rect,
  // 圆形
  circle
}

export default interface ITransformer extends IController {
  // 唯一标识
  id: string;
  // 是否激活
  isActive: boolean;
  // 角度
  get angle(): number;
  // 宿主
  host?: IElement | IStageSelection;

}

export interface IVerticesTransformer extends ITransformer, IPoint {
  // 顶点
  points: IPoint[];
  // 是否包含点
  isContainsPoint(point: IPoint): boolean;
}

export interface IBorderTransformer extends ITransformer {
  // 起始点
  start: IPoint;
  // 结束点
  end: IPoint;
  // 是否接近
  isClosest(point: IPoint): boolean;
}