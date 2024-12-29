import MaskRenderer from "@/modules/render/renderer/drawer/MaskRenderer";
import HelperDrawer from "@/modules/stage/drawer/HelperDrawer";
import { IDrawerMask } from "@/types/IStageDrawer";
import IStageShield from "@/types/IStageShield";

export default class DrawerMask extends HelperDrawer implements IDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new MaskRenderer(this);
  }

  initCanvas(): HTMLCanvasElement {
    super.initCanvas();
    this.canvas.id = 'mask'
    this.canvas.style.pointerEvents = 'none'
    return this.canvas;
  }
}