import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import { IElementReact } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";

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
    Object.assign(this.model, CommonUtils.calcRectangleSize(this.model.coords))
  }
}