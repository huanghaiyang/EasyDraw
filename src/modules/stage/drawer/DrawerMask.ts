import MaskRenderer from "@/modules/render/renderer/drawer/MaskRenderer";
import { IDrawerMask } from "@/types/IStageDrawer";
import IStageShield from "@/types/IStageShield";
import DrawerBase from "@/modules/stage/drawer/DrawerBase";

export default class DrawerMask extends DrawerBase implements IDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new MaskRenderer(this);
  }

  initNode(): HTMLCanvasElement | HTMLDivElement {
    super.initNode();
    this.node.id = "mask";
    this.node.style.pointerEvents = "none";
    return this.node;
  }
}
