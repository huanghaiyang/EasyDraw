import { ISize } from "@/types";
import { IStageDrawer } from "@/types/IStageDrawer";
import { IStageRenderer } from "@/types/IStageRenderer";
import { EventEmitter } from "events";

export default class DrawerBase extends EventEmitter implements IStageDrawer {
  canvas: HTMLCanvasElement;
  renderer: IStageRenderer;

  /**
   * 初始化画布
   *
   * @returns
   */
  initCanvas(): HTMLCanvasElement {
    this.canvas = document.createElement("canvas");
    return this.canvas;
  }

  /**
   * 设置画布大小
   *
   * @param size
   */
  updateCanvasSize(size: ISize): void {
    this.canvas.width = size.width;
    this.canvas.height = size.height;
  }

  /**
   * 画布清空
   */
  clearCanvas(): void {
    this.canvas
      .getContext("2d")
      ?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 重绘
   */
  async redraw(force?: boolean): Promise<void> {
    await this.renderer.redraw(force);
  }
}
