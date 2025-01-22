import { IRotationModel } from "@/types/IModel";
import IElement from "@/types/IElement";
import { IPoint } from "@/types";

export default interface IElementRotation {
  // 旋转id
  id: string;
  // 旋转模型
  model: IRotationModel;
  // 元素
  element: IElement;

  // 刷新
  refresh(): void;
  // 是否包含点
  isContainsPoint(point: IPoint): boolean;
}