import IStageShield from "@/types/IStageShield";
import IStageSelection from "@/types/IStageSelection";
import { IMaskModel } from "@/types/IModel";

export default interface IStageBoxer {
  angle: number;
  shield: IStageShield;
  selection: IStageSelection;
  model: IMaskModel;

  setModel(model: IMaskModel): void;
}