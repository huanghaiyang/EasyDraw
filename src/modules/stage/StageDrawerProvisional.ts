import StageDrawerBase from "@/modules/stage/StageDrawerBase";
import { IStageDrawerMask, IStageShield } from "@/types";
import StageDrawerProvisionalRenderer from "@/modules/render/renderer/StageDrawerProvisionalRenderer";

export default class StageDrawerProvisional extends StageDrawerBase implements IStageDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new StageDrawerProvisionalRenderer(this);
  }
}