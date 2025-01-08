import ElementTaskBase from "@/modules/render/base/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementImage } from "@/types/IElement";
import { IElementTaskImage } from "@/types/IRenderTask";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementTaskImage extends ElementTaskBase implements IElementTaskImage {
  get node() {
    return this.element as IElementImage;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawImgLike(this.canvas, this.node.model.data, CommonUtils.scaleRect(this.node.rect, 1 / this.node.coordScale), {
      angle: this.node.angle
    });
  }
}
