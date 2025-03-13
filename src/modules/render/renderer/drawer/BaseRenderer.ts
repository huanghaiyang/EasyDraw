import RenderQueue from "@/modules/render/RenderQueue";
import { IQueueRender, IRenderQueue, IRenderTaskCargo } from "@/types/IRender";
import { IStageDrawer } from "@/types/IStageDrawer";
import { IStageRenderer } from "@/types/IStageRenderer";

export default class BaseRenderer<T extends IStageDrawer> implements IStageRenderer, IQueueRender {
  drawer: T;
  renderQueue: IRenderQueue;

  constructor(drawer: T) {
    this.drawer = drawer;
    this.renderQueue = new RenderQueue();
  }

  async renderCargo(cargo: IRenderTaskCargo): Promise<void> {
    await this.renderQueue.add(cargo);
  }

  get renderParams() {
    return {
      canvas: this.drawer.node,
    };
  }

  clear(): void {
    throw new Error("Method not implemented.");
  }

  /**
   * 重绘蒙版
   */
  async redraw(force?: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
