import { DrawerMaskModelTypes, IPoint } from "@/types";
import IElement from "@/types/IElement";
import IElementRotation from "@/types/IElementRotation";
import { IRotationModel } from "@/types/IModel";
import { SelectionRotationSize } from "@/styles/MaskStyles";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import IController from "@/types/IController";

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
    points: []
  };
  // 元素
  element: IElement;
  // 是否激活
  isActive: boolean = false;

  constructor(element: IElement) {
    this.id = element.id;
    this.element = element;
  }

  /**
   * 刷新数据
   */
  refresh(): void {
    if (!this.element.rotationEnable) return;
    this.model.angle = this.element.angle - 90;
    this.model.point = ElementUtils.calcElementRotatePoint(this.element);
    this.model.points = CommonUtils.getBoxVertices(this.model.point, {
      width: this.model.width / this.element.shield.stageScale,
      height: this.model.height / this.element.shield.stageScale
    }).map(point => MathUtils.rotateRelativeCenter(point, this.element.angle, this.model.point))
  }

  /**
   * 检查点是否在旋转句柄内
   * 
   * @param point 
   * @returns 
   */
  isContainsPoint(point: IPoint): boolean {
    if (this.element.rotationEnable) {
      return MathUtils.isPointInPolygonByRayCasting(point, this.model.points);
    }
    return false;
  }
}