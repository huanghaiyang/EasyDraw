import StageDrawerBase from "@/modules/stage/drawer/StageDrawerBase";
import { IStageShield } from "@/types";

export default class StageHelperDrawer extends StageDrawerBase implements StageHelperDrawer {
  shield: IStageShield;

  constructor(shield: IStageShield) {
    super();
    this.shield = shield;
  }
}