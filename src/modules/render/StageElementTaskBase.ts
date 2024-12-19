import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IStageElement, IStageElementRenderTask } from "@/types";

export default abstract class StageElementTaskBase extends RenderTaskBase implements IStageElementRenderTask {
  element: IStageElement;
  protected _canvas: HTMLCanvasElement;

  get canvas() {
    return this._canvas;
  }

  constructor(element: IStageElement, params?: any) {
    super();
    this.element = element;
    if (params) {
      this._canvas = params.canvas as HTMLCanvasElement;
    }
  }
}