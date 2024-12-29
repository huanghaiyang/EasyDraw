import RenderTaskBase from "@/modules/render/RenderTaskBase";
import IElement from "@/types/IElement";
import { IElementTask } from "@/types/IRenderTask";

export default abstract class ElementTaskBase extends RenderTaskBase implements IElementTask {
  element: IElement;
  protected _canvas: HTMLCanvasElement;

  get node() {
    return this.element;
  }

  get canvas() {
    return this._canvas;
  }

  constructor(element: IElement, params?: any) {
    super();
    this.element = element;
    if (params) {
      this._canvas = params.canvas as HTMLCanvasElement;
    }
  }
}