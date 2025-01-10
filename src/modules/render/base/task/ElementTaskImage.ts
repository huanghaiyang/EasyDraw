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
    const { model, rect, coordScale, angle, flipX, flipY, rotatePathPoints } = this.node;
    CanvasUtils.drawImgLike(this.canvas, model.data, CommonUtils.scaleRect(rect, 1 / coordScale), {
      angle,
      flipX,
      flipY
    });
    CanvasUtils.drawPathStokeWidthScale(this.canvas,
      CanvasUtils.convertPointsByStrokeType(
        rotatePathPoints,
        model.styles.strokeType,
        model.styles.strokeWidth
      ),
      model.styles
    );
  }
}
