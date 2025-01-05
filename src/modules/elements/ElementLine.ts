import Element from "@/modules/elements/Element";
import { IElementLine } from "@/types/IElement";

export default class ElementLine extends Element implements IElementLine {

  get rotationEnable(): boolean {
    return false;
  }

  get verticesTransformEnable(): boolean {
    return false;
  }

  get borderTransformEnable(): boolean {
    return false;
  }
}