import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementReact } from "@/types/IElement";

export default class ElementTaskRect extends ElementTaskBase {
  get node() {
    return this.element as IElementReact;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    this.node.strokePathPoints.forEach((points, index) => {
      CanvasUtils.drawPathWithScale(
        this.canvas,
        points,
        this.node.model.styles,
        this.node.model.styles.strokes[index],
      );
    });
  }
}
