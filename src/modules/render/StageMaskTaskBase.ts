import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IStageMaskTaskObj } from "@/types";

export default abstract class StageMaskTaskBase extends RenderTaskBase {
  obj: IStageMaskTaskObj;
  protected _canvas: HTMLCanvasElement;

  get data() {
    return this.obj;
  }

  constructor(obj: IStageMaskTaskObj, params?: any) {
    super();
    this.obj = obj;
    if (params) {
      this._canvas = params.canvas as HTMLCanvasElement;
    }
  }

  /**
   * 获取canvas
   * 
   * @returns 
   */
  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }
}