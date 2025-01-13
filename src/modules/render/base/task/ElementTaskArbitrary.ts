import ElementTaskBase from "@/modules/render/base/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementReact } from "@/types/IElement";
import { IElementTaskArbitrary } from "@/types/IRenderTask";

export default class ElementTaskArbitrary extends ElementTaskBase implements IElementTaskArbitrary {
  get node() {
    return this.element as IElementReact;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    this.canvas.getContext('2d').clearRect(0,0,this.canvas.width, this.canvas.height)
    CanvasUtils.drawPathWithScale(
      this.canvas,
      CanvasUtils.convertPointsByStrokeType(
        this.node.rotatePathPoints,
        this.node.model.styles.strokeType,
        this.node.model.styles.strokeWidth
      ),
      this.node.model.styles,
      this.node.model.isPointsClosed,
    );
  }
}
