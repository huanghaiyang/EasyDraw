import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementReact } from "@/types/IElement";

export default class ElementTaskArbitrary extends ElementTaskBase {
  get node() {
    return this.element as IElementReact;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPathWithScale(
      this.canvas,
      CanvasUtils.convertPointsByStrokeType(
        this.node.rotatePathPoints,
        this.node.model.styles.strokeType,
        this.node.model.styles.strokeWidth,
        {
          flipX: this.node.flipX,
          flipY: this.node.flipY
        }
      ),
      this.node.model.styles,
      {
        isFold: this.node.model.isFold
      },
    );
  }
}
