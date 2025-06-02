import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { ElementStyles } from "@/styles/ElementStyles";
import { IMaskModel } from "@/types/IModel";
import { IMaskTask } from "@/types/IRenderTask";

export default abstract class MaskTaskBase extends RenderTaskBase implements IMaskTask {
  // 模型
  model: IMaskModel;
  // 画布
  canvas: HTMLCanvasElement;
  // 样式
  styles?: ElementStyles;

  constructor(model: IMaskModel, canvas: HTMLCanvasElement, styles?: ElementStyles) {
    super();
    this.model = model;
    this.canvas = canvas;
    this.styles = styles;
  }

  destroy(): Promise<void> {
    this.model = null;
    this.id = null;
    this.canvas = null;
    return Promise.resolve();
  }
}
