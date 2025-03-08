import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IMaskModel } from "@/types/IModel";
import { IMaskTask } from "@/types/IRenderTask";

export default abstract class MaskTaskBase extends RenderTaskBase implements IMaskTask {
  // 模型
  model: IMaskModel;
  // 画布
  canvas: HTMLCanvasElement;

  constructor(model: IMaskModel, params?: any) {
    super();
    this.model = model;
    if (params) {
      this.canvas = params.canvas as HTMLCanvasElement;
    }
  }

  destroy(): Promise<void> {
    this.model = null;
    this.id = null;
    this.canvas = null;
    return Promise.resolve();
  }
}
