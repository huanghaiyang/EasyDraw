import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementReact } from "@/types/IElement";
import { DefaultLineMeterLimit } from "@/styles/ElementStyles";

export default class ElementTaskArbitrary extends ElementTaskBase {
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
        {
          isFold: this.node.model.isFold,
          miterLimit: DefaultLineMeterLimit,
        },
      );
    });
  }
}
