import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IMaskModel } from "@/types/IModel";
import { IMaskTask } from "@/types/IRenderTask";

export default abstract class MaskTaskBase extends RenderTaskBase implements IMaskTask {
  // 模型
  model: IMaskModel;
  // 画布
  protected _canvas: HTMLCanvasElement;

  get data(): IMaskModel {
    return this.model;
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  constructor(model: IMaskModel, params?: any) {
    super();
    this.model = model;
    if (params) {
      this._canvas = params.canvas as HTMLCanvasElement;
    }
  }
}
