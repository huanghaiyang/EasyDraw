import IStageBoxer from "@/types/IStageBoxer";
import IStageShield from "@/types/IStageShield";
import IStageSelection from "@/types/IStageSelection";
import { IMaskModel } from "@/types/IModel";

export default class StageBoxer implements IStageBoxer {
  angle: number;
  shield: IStageShield;
  selection: IStageSelection;
  model: IMaskModel;

  constructor(shield: IStageShield, selection: IStageSelection) {
    this.shield = shield;
    this.selection = selection;
  }

  /**
   * 设置模型
   * 
   * @param model 
   */
  setModel(model: IMaskModel): void {
    this.model = model;
  }

}