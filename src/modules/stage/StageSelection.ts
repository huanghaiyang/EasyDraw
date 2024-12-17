import { IStageSelection, IStageShield } from "@/types";

export default class StageSelection implements IStageSelection {

  shield: IStageShield;

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

}