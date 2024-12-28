import DrawerBase from "@/modules/stage/drawer/DrawerBase";
import { IHelperDrawer, IStageShield } from "@/types";

export default class HelperDrawer extends DrawerBase implements IHelperDrawer {
  shield: IStageShield;

  constructor(shield: IStageShield) {
    super();
    this.shield = shield;
  }
}