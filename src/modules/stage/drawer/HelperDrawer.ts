import DrawerBase from "@/modules/stage/drawer/DrawerBase";
import { IHelperDrawer } from "@/types/IStageDrawer";
import IStageShield from "@/types/IStageShield";

export default class HelperDrawer extends DrawerBase implements IHelperDrawer {
  shield: IStageShield;

  constructor(shield: IStageShield) {
    super();
    this.shield = shield;
  }
}