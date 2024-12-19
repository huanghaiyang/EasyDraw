import {
  IStageRenderer,
  IQueueRender,
  IRenderQueue,
  IStageDrawer,
  IRenderTaskCargo
} from "@/types";
import RenderQueue from "@/modules/render/RenderQueue";

export default class StageDrawerBaseRenderer implements IStageRenderer, IQueueRender {

  drawer: IStageDrawer;
  renderQueue: IRenderQueue;

  constructor(drawer: IStageDrawer) {
    this.drawer = drawer;
    this.renderQueue = new RenderQueue();
  }

  async renderCargo(cargo: IRenderTaskCargo): Promise<void> {
    await this.renderQueue.add(cargo);
  }

  get maskParams() {
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
  redraw(): void {
    throw new Error("Method not implemented.");
  }
}