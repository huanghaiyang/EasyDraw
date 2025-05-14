import { IPoint } from "@/types";
import IElementRotation from "@/types/IElementRotation";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { RotationSize } from "@/styles/MaskStyles";
import PointController from "@/modules/handler/controller/PointController";
import GlobalConfig from "@/config";

export default class ElementRotation extends PointController implements IElementRotation {
  // 宽度
  width: number = RotationSize;
  // 高度
  height: number = RotationSize;

  // 角度
  get angle(): number {
    return this.host.viewAngle - 90;
  }

  /**
   * 刷新数据
   */
  refresh(): void {
    if (!this.host.rotationEnable) return;
    // 设置旋转点
    const { x, y } = ElementUtils.calcElementRotatePoint(this.host);
    // 横坐标
    this.x = x;
    // 纵坐标
    this.y = y;
    // 设置旋转路径点
    this.points = CommonUtils.getBoxByCenter(
      { x, y },
      {
        width: this.width / GlobalConfig.stageParams.scale,
        height: this.height / GlobalConfig.stageParams.scale,
      },
    ).map(point => MathUtils.rotateWithCenter(point, this.host.viewAngle, { x, y }));
  }

  /**
   * 检查点是否在旋转句柄内
   *
   * @param coord
   * @returns
   */
  isContainsCoord(coord: IPoint): boolean {
    // 如果组件旋转启用，则检查点是否在旋转路径点内
    if (this.host.rotationEnable) {
      // 使用射线法检查点是否在旋转路径点内
      return MathUtils.isPointInPolygonByRayCasting(coord, this.points);
    }
    // 如果组件旋转未启用，则返回 false
    return false;
  }
}
