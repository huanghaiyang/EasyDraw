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
    const {
      strokePathPoints,
      model: { styles },
    } = this.node;

    strokePathPoints.forEach((points, index) => {
      CanvasUtils.drawPathWithScale(
        this.canvas,
        points,
        styles,
        styles.fills[0],
        styles.strokes[index],
      );
    });
  }
}
