import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IStageMaskTask, IStageMaskTaskObj } from "@/types";

export default abstract class StageMaskTaskBase extends RenderTaskBase implements IStageMaskTask {
  obj: IStageMaskTaskObj;
  protected _canvas: HTMLCanvasElement;

  get data() {
    return this.obj;
  }

  get canvas() {
    return this._canvas;
  }

  constructor(obj: IStageMaskTaskObj, params?: any) {
    super();
    this.obj = obj;
    if (params) {
      this._canvas = params.canvas as HTMLCanvasElement;
    }
  }
}