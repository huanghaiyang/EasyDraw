import StageDrawerBase from "@/modules/stage/drawer/StageDrawerBase";
import { IStageDrawerMask, IStageShield } from "@/types";
import StageDrawerMaskRenderer from "@/modules/render/renderer/drawer/StageDrawerMaskRenderer";

export default class StageDrawerMask extends StageDrawerBase implements IStageDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new StageDrawerMaskRenderer(this);
  }
}