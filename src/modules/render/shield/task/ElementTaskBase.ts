import RenderTaskBase from "@/modules/render/RenderTaskBase";
import IElement from "@/types/IElement";
import { IElementTask } from "@/types/IRenderTask";

export default abstract class ElementTaskBase extends RenderTaskBase implements IElementTask {
  element: IElement;
  canvas: HTMLCanvasElement;

  constructor(element: IElement, canvas: HTMLCanvasElement) {
    super();
    this.element = element;
    this.canvas = canvas;
  }

  destroy(): Promise<void> {
    this.element = null;
    this.canvas = null;
    return Promise.resolve();
  }
}
