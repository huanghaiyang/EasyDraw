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
      arcPoints,
      arcFillPoints,
      model: { styles },
      angle,
      flipX,
      leanY,
      actualAngle,
      rotateBoxPoints,
      center,
    } = this.node;

    const options = {
      angle,
      flipX,
      leanY,
      actualAngle,
    };

    let rect = CommonUtils.calcRotateBoxRect(rotateBoxPoints, center);
    rect = CommonUtils.scaleRect(rect, this.node.shield.stageScale);

    // 绘制图片
    CanvasUtils.drawImgLike(this.canvas, this.node.model.data, rect, {
      ...options,
      clipArcPoints: arcFillPoints,
    });

    // 绘制边框
    arcPoints.forEach((points, index) => {
      CanvasUtils.drawArcPathStrokeWidthScale(this.canvas, points, rect, styles.strokes[index], options);
    });
  }
}
