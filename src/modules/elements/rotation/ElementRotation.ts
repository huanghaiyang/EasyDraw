import { DrawerMaskModelTypes, IPoint } from "@/types";
import IElement from "@/types/IElement";
import IElementRotation from "@/types/IElementRotation";
import { IRotationModel } from "@/types/IModel";
import { DefaultSelectionRotateSize } from "@/types/MaskStyles";
import ElementUtils from "@/modules/elements/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";


export default class ElementRotation implements IElementRotation {
  id: string;
  model: IRotationModel = {
    point: null,
    type: DrawerMaskModelTypes.rotate,
    width: DefaultSelectionRotateSize,
    height: DefaultSelectionRotateSize,
    angle: -90,
    vertices: []
  };
  element: IElement;

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
    this.model.vertices = CommonUtils.getBoxVertices(this.model.point, {
      width: this.model.width,
      height: this.model.height
    }).map(point => MathUtils.rotateRelativeCentroid(point, this.element.angle, this.model.point))
  }

  /**
   * 检查点是否在旋转句柄内
   * 
   * @param point 
   * @returns 
   */
  isContainsPoint(point: IPoint): boolean {
    if (this.element.rotationEnable) {
      return MathUtils.isPointInPolygonByRayCasting(point, this.model.vertices);
    }
    return false;
  }
}