import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import { IElementReact } from "@/types/IElement";
import ElementUtils from "@/modules/elements/ElementUtils";

export default class ElementRect extends Element implements IElementReact {

  get borderTransformEnable(): boolean {
    return true;
  }
  /**
   * 形变
   * 
   * @param offset 
   */
  transform(offset: IPoint): void {
    super.transform(offset);
    Object.assign(this.model, ElementUtils.calcRectangleSize(this.model.coords))
  }
}