import { DrawerMaskModelTypes, IPoint } from "@/types";
import IElement from "@/types/IElement";
import IElementRotation from "@/types/IElementRotation";
import { IRotationModel } from "@/types/IModel";
import { SelectionRotationSize } from "@/styles/MaskStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import IController from "@/types/IController";
import IStageSelectionRange from "@/types/IStageSelectionRange";

export default class ElementRotation implements IElementRotation, IController {
  // id
  id: string;
  // 数据模型
  model: IRotationModel = {
    point: null,
    type: DrawerMaskModelTypes.rotate,
    width: SelectionRotationSize,
    height: SelectionRotationSize,
    angle: -90,
    points: [],
  };
  // 组件
  element: IElement | IStageSelectionRange;
  // 是否激活
  isActive: boolean = false;

  constructor(element: IElement | IStageSelectionRange) {
    this.id = element.id;
    this.element = element;
  }

  /**
   * 刷新数据
   */
  refresh(): void {
    if (!this.element.rotationEnable) return;
    // 设置旋转角度
    this.model.angle = this.element.viewAngle - 90;
    // 设置旋转点
    this.model.point = ElementUtils.calcElementRotatePoint(this.element);
    // 设置旋转路径点
    this.model.points = CommonUtils.getBoxVertices(this.model.point, {
      width: this.model.width / this.element.shield.stageScale,
      height: this.model.height / this.element.shield.stageScale,
    }).map(point =>
      MathUtils.rotateWithCenter(
        point,
        this.element.viewAngle,
        this.model.point,
      ),
    );
  }

  /**
   * 检查点是否在旋转句柄内
   *
   * @param point
   * @returns
   */
  isContainsPoint(point: IPoint): boolean {
    // 如果组件旋转启用，则检查点是否在旋转路径点内
    if (this.element.rotationEnable) {
      // 使用射线法检查点是否在旋转路径点内
      return MathUtils.isPointInPolygonByRayCasting(point, this.model.points);
    }
    // 如果组件旋转未启用，则返回 false
    return false;
  }
}
