import ElementUtils from "@/modules/elements/utils/ElementUtils";
import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { ControllerStyle } from "@/styles/MaskStyles";
import CanvasUtils from "@/utils/CanvasUtils";

export default class MaskTaskCircleTransformer extends MaskTaskBase {
  /**
   * 运行任务
   */
  async run(): Promise<void> {
    if (!this.canvas || !this.model) return;

    let { point } = this.model;

    if (!point) return;
    let { radius } = this.model;
    // 描边样式
    const strokeStyle = { ...ControllerStyle.strokes[0] };
    // 保证描边宽度在不同缩放下保持一致
    strokeStyle.width /= CanvasUtils.scale;
    // 填充样式
    const fillStyle = { ...ControllerStyle.fills[0] };
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
      fillStyle,
    );

    // 绘制描边
    CanvasUtils.drawEllipseStrokeWithScale(
      this.canvas,
      point,
      {
        rx: radius,
        ry: radius,
      },
      strokeStyle,
    );
  }
}
