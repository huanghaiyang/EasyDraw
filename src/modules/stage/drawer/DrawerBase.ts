import { ISize } from "@/types";
import { IStageDrawer } from "@/types/IStageDrawer";
import { IStageRenderer } from "@/types/IStageRenderer";
import { EventEmitter } from "events";
import IStageShield from "@/types/IStageShield";

export default class DrawerBase extends EventEmitter implements IStageDrawer {
  node: HTMLCanvasElement | HTMLDivElement;
  renderer: IStageRenderer;
  shield: IStageShield;

  constructor(shield?: IStageShield) {
    super();
    this.shield = shield;
  }

  /**
   * 初始化画布
   *
   * @returns
   */
  initNode(): HTMLCanvasElement | HTMLDivElement {
    this.node = document.createElement("canvas");
    this.initStyle();
    return this.node;
  }

  /**
   * 初始化样式
   */
  initStyle(): void {
    this.node.style.position = "absolute";
    this.node.style.top = "0";
    this.node.style.left = "0";
  }

  /**
   * 设置画布大小
   *
   * @param size
   */
  updateSize(size: ISize): void {
    if (this.node instanceof HTMLCanvasElement) {
      this.node.width = size.width;
      this.node.height = size.height;
    } else {
      this.node.style.width = `${size.width}px`;
      this.node.style.height = `${size.height}px`;
    }
  }

  /**
   * 画布清空
   */
  clear(): void {
    if (this.node instanceof HTMLCanvasElement) {
      this.node.getContext("2d")?.clearRect(0, 0, this.node.width, this.node.height);
    } else {
      this.node.innerHTML = "";
    }
  }

  /**
   * 重绘
   */
  async redraw(force?: boolean): Promise<void> {
    await this.renderer.redraw(force);
  }
}
