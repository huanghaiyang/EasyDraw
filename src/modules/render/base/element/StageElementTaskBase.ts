import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IStageElement, IStageElementTask } from "@/types";

export default abstract class StageElementTaskBase extends RenderTaskBase implements IStageElementTask {
  element: IStageElement;
  protected _canvas: HTMLCanvasElement;

  get node() {
    return this.element;
  }

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