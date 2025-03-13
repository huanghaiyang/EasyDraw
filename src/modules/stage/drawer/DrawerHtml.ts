import { ISize } from "@/types";
import { IDrawerHtml } from "@/types/IStageDrawer";
import DrawerBase from "@/modules/stage/drawer/DrawerBase";

export default class DrawerHtml extends DrawerBase implements IDrawerHtml {
  initNode(): HTMLDivElement | HTMLCanvasElement {
    this.node = document.createElement("div");
    this.node.id = "html-drawer";
    this.node.style.pointerEvents = "none";
    this.node.style.transformOrigin = "top left";
    this.initStyle();
    return this.node;
  }

  /**
   * 更新画布大小
   *
   * @param size
   */
  updateSize(size: ISize): void {
    const { width, height } = size;
    const { stageScale } = this.shield;
    this.node.style.width = `${width / stageScale}px`;
    this.node.style.height = `${height / stageScale}px`;
    this.node.style.transform = `scale(${stageScale})`;
  }
}
