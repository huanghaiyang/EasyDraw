import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementImage } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementTaskImage extends ElementTaskBase {
  get node() {
    return this.element as IElementImage;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const { model, rect, angle, flipX, flipY } = this.node;
    CanvasUtils.drawImgLike(this.canvas, model.data, CommonUtils.scaleRect(rect, this.node.shield.stageScale), {
      angle,
      flipX,
      flipY
    });
    CanvasUtils.drawPathStokeWidthScale(this.canvas, this.node.strokePathPoints, model.styles);
  }
}
