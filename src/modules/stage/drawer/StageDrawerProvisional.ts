import StageDrawerBase from "@/modules/stage/drawer/StageDrawerBase";
import { IStageDrawerMask, IStageShield } from "@/types";
import StageDrawerProvisionalRenderer from "@/modules/render/renderer/drawer/StageDrawerProvisionalRenderer";

export default class StageDrawerProvisional extends StageDrawerBase implements IStageDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new StageDrawerProvisionalRenderer(this);
  }
}