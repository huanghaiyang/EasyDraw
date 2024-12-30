import ElementTaskBase from "@/modules/render/base/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementReact } from "@/types/IElement";
import { IElementTaskRect } from "@/types/IRenderTask";

export default class ElementTaskRect extends ElementTaskBase implements IElementTaskRect {

  get node() {
    return this.element as IElementReact;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPath(this.canvas, this.node.rotatePathPoints, this.node.model.styles);
  }

}