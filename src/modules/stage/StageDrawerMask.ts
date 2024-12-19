import StageDrawerBase from "@/modules/stage/StageDrawerBase";
import { IStageDrawerMask, IStageShield } from "@/types";
import StageDrawerMaskRenderer from "@/modules/render/renderer/StageDrawerMaskRenderer";

export default class StageDrawerMask extends StageDrawerBase implements IStageDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new StageDrawerMaskRenderer(this);
  }
}