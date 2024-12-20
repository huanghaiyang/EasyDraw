import { IStageDrawerMask, IStageShield } from "@/types";
import StageDrawerMaskRenderer from "@/modules/render/renderer/drawer/StageDrawerMaskRenderer";
import StageHelperDrawer from "@/modules/stage/drawer/StageHelperDrawerBase";

export default class StageDrawerMask extends StageHelperDrawer implements IStageDrawerMask {
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