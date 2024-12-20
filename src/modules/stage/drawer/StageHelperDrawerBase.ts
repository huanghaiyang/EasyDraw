import StageDrawerBase from "@/modules/stage/drawer/StageDrawerBase";
import { IStageHelperDrawer, IStageShield } from "@/types";

export default class StageHelperDrawer extends StageDrawerBase implements IStageHelperDrawer {
  shield: IStageShield;

  constructor(shield: IStageShield) {
    super();
    this.shield = shield;
  }
}