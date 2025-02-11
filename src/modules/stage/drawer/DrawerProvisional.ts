import ProvisionalRenderer from "@/modules/render/renderer/drawer/ProvisionalRenderer";
import HelperDrawer from "@/modules/stage/drawer/HelperDrawer";
import { IDrawerMask } from "@/types/IStageDrawer";
import IStageShield from "@/types/IStageShield";

export default class DrawerProvisional
  extends HelperDrawer
  implements IDrawerMask
{
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new ProvisionalRenderer(this);
  }

  initCanvas(): HTMLCanvasElement {
    super.initCanvas();
    this.canvas.id = "provisional";
    this.canvas.style.pointerEvents = "none";
    return this.canvas;
  }
}
