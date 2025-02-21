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
    const {
      model,
      angle,
      flipX,
      actualAngle,
      leanY,
      rotateBoxPoints,
      center,
      model: { styles },
    } = this.node;
    let rect = CommonUtils.calcImageRotateBoxRect(rotateBoxPoints, center);
    rect = CommonUtils.scaleRect(rect, this.node.shield.stageScale);

    // 绘制图片
    CanvasUtils.drawImgLike(this.canvas, model.data, rect, {
      angle,
      flipX,
      leanY,
      actualAngle,
    });

    // 绘制边框
    this.node.strokePathPoints.forEach((points, index) => {
      CanvasUtils.drawPathStrokeWidthScale(
        this.canvas,
        points,
        styles.strokes[index],
      );
    });
  }
}
