import StageDrawerBase from "@/modules/stage/drawer/StageDrawerBase";
import { IStageDrawerMask, IStageShield } from "@/types";
import StageDrawerMaskRenderer from "@/modules/render/renderer/drawer/StageDrawerMaskRenderer";

export default class StageDrawerMask extends StageDrawerBase implements IStageDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new StageDrawerMaskRenderer(this);
  }

  initCanvas(): HTMLCanvasElement {
    super.initCanvas();
    this.canvas.id = 'mask'
    this.canvas.style.pointerEvents = 'none'
    return this.canvas;
  }
}