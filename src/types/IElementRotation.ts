import { IRotationModel } from "@/types/IModel";
import IElement from "@/types/IElement";
import { IPoint } from "@/types";
import IStageSelectionRange from "@/types/IStageSelectionRange";

export default interface IElementRotation {
  // 旋转id
  id: string;
  // 旋转模型
  model: IRotationModel;
  // 组件
  element: IElement | IStageSelectionRange;
  // 是否激活
  isActive: boolean;

  // 刷新
  refresh(): void;
  // 是否包含点
  isContainsPoint(point: IPoint): boolean;
}
