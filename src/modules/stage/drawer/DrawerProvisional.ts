import ProvisionalRenderer from "@/modules/render/renderer/drawer/ProvisionalRenderer";
import { IDrawerMask } from "@/types/IStageDrawer";
import IStageShield from "@/types/IStageShield";
import DrawerBase from "./DrawerBase";

export default class DrawerProvisional extends DrawerBase implements IDrawerMask {
  constructor(shield: IStageShield) {
    super(shield);
    this.renderer = new ProvisionalRenderer(this);
  }

  initNode(): HTMLCanvasElement | HTMLDivElement {
    super.initNode();
    this.node.id = "provisional";
    this.node.style.pointerEvents = "none";
    return this.node;
  }
}
