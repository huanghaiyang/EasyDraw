import { IStageDrawerMask, IStageShield } from "@/types";
import StageDrawerProvisionalRenderer from "@/modules/render/renderer/drawer/StageDrawerProvisionalRenderer";
import StageHelperDrawer from "@/modules/stage/drawer/StageHelperDrawerBase";

export default class StageDrawerProvisional extends StageHelperDrawer implements IStageDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new StageDrawerProvisionalRenderer(this);
  }

  initCanvas(): HTMLCanvasElement {
    super.initCanvas();
    this.canvas.id = 'provisional'
    this.canvas.style.pointerEvents = 'none'
    return this.canvas;
  }
}