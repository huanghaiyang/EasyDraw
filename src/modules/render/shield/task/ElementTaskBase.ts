import RenderTaskBase from "@/modules/render/RenderTaskBase";
import IElement from "@/types/IElement";
import { IElementTask } from "@/types/IRenderTask";

export default abstract class ElementTaskBase extends RenderTaskBase implements IElementTask {
  element: IElement;
  canvas: HTMLCanvasElement;

  constructor(element: IElement, params?: any) {
    super();
    this.element = element;
    if (params) {
      this.canvas = params.canvas as HTMLCanvasElement;
    }
  }

  destroy(): Promise<void> {
    this.element = null;
    this.canvas = null;
    return Promise.resolve();
  }
}
