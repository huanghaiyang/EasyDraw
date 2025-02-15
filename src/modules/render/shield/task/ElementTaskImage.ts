import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";
import { IElementImage } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";

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
      flipY,
      leanYAngle,
      actualAngle,
      leanY,
      viewAngle,
      internalAngle,
      rotateBoxPoints,
      center,
      model: { styles },
    } = this.node;
    // 计算倾斜后的图片的宽度，此宽的值实际上与倾斜之前的值相同
    const width = MathUtils.calcDistance(
      rotateBoxPoints[0],
      rotateBoxPoints[1],
    );
    // 计算倾斜后的图片的高度，此高的值实际上与倾斜之前的值相同
    const height = MathUtils.calcDistancePointToLine(
      rotateBoxPoints[0],
      rotateBoxPoints[2],
      rotateBoxPoints[3],
    );
    // 计算绘制后的图片的rect
    const rect = {
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    };

    // 绘制图片
    CanvasUtils.drawImgLike(
      this.canvas,
      model.data,
      CommonUtils.scaleRect(rect, this.node.shield.stageScale),
      {
        angle,
        flipX,
        flipY,
        leanYAngle,
        leanY,
        internalAngle,
        viewAngle,
        actualAngle,
      },
    );

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
