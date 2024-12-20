import {
  IStageRenderer,
  IQueueRender,
  IRenderQueue,
  IStageDrawer,
  IRenderTaskCargo,
} from "@/types";
import RenderQueue from "@/modules/render/RenderQueue";

export default class StageDrawerBaseRenderer<T extends IStageDrawer> implements IStageRenderer, IQueueRender {

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
      canvas: this.drawer.canvas
    }
  }

  clear(): void {
    throw new Error("Method not implemented.");
  }

  /**
   * 重绘蒙版
   */
  async redraw(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}