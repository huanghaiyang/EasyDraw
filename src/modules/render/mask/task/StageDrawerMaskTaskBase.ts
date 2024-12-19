import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IStageDrawerMaskTask, IStageDrawerMaskTaskObj } from "@/types";

export default abstract class StageDrawerMaskTaskBase extends RenderTaskBase implements IStageDrawerMaskTask {
  obj: IStageDrawerMaskTaskObj;
  protected _canvas: HTMLCanvasElement;

  get data(): IStageDrawerMaskTaskObj {
    return this.obj;
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  constructor(obj: IStageDrawerMaskTaskObj, params?: any) {
    super();
    this.obj = obj;
    if (params) {
      this._canvas = params.canvas as HTMLCanvasElement;
    }
  }
}