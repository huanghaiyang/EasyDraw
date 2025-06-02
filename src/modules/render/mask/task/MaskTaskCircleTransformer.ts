import ElementUtils from "@/modules/elements/utils/ElementUtils";
import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskCircleTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;
    let { point, radius } = this.model;
    if (!point) return;
    // 保证半径在不同缩放下保持一致
    radius /= CanvasUtils.scale;
    // 转换为舞台坐标
    point = ElementUtils.calcStageRelativePoint(point);

    // 绘制填充
    CanvasUtils.drawEllipseFillWithScale(
      this.canvas,
      point,
      {
        rx: radius,
        ry: radius,
      },
      this.styles?.fills[0],
    );

    // 绘制描边
    CanvasUtils.drawEllipseStrokeWithScale(
      this.canvas,
      point,
      {
        rx: radius,
        ry: radius,
      },
      this.styles?.strokes[0],
    );
  }
}
