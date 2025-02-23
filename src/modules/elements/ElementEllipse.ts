import Element from "@/modules/elements/Element";
import { IElementEllipse } from "@/types/IElement";

export default class ElementEllipse extends Element implements IElementEllipse {
  get editingEnable(): boolean {
    return false;
  }
}
