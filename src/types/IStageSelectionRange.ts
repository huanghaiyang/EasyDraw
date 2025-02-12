import IStageShield from "@/types/IStageShield";
import { AngleModel } from "@/types/IElement";
import { IPoint } from "@/types/index";
import IElementRotation from "@/types/IElementRotation";
import { IMaskModel } from "@/types/IModel";

export default interface IStageSelectionRange extends AngleModel {
  id: string;
  // 舞台
  shield: IStageShield;
  // 是否可以旋转
  get rotationEnable(): boolean;
  // 选区中心点
  get center(): IPoint;
  // 旋转
  rotation: IElementRotation;
  // 数据模型
  model: IMaskModel;
  // 角度
  get angle(): number;
  // 视觉角度
  get viewAngle(): number;
}
