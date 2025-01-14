import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementLine } from "@/types/IElement";

export default class ElementTaskLine extends ElementTaskBase {
  get node() {
    return this.element as IElementLine;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawLineWidthScale(
      this.canvas,
      CanvasUtils.convertPointsByStrokeType(
        this.node.rotatePathPoints,
        this.node.model.styles.strokeType,
        this.node.model.styles.strokeWidth
      ),
      this.node.model.styles
    );
  }
}
