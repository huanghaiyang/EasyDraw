import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IStageDrawerMaskTask, IStageDrawerMaskTaskModel } from "@/types";

export default abstract class StageDrawerMaskTaskBase extends RenderTaskBase implements IStageDrawerMaskTask {
  model: IStageDrawerMaskTaskModel;
  protected _canvas: HTMLCanvasElement;

  get data(): IStageDrawerMaskTaskModel {
    return this.model;
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  constructor(model: IStageDrawerMaskTaskModel, params?: any) {
    super();
    this.model = model;
    if (params) {
      this._canvas = params.canvas as HTMLCanvasElement;
    }
  }
}