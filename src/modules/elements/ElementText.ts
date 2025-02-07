import Element from "@/modules/elements/Element";
import { IElementText } from "@/types/IElement";

export default class ElementText extends Element implements IElementText {
  get editingEnable(): boolean {
    return false;
  }
}
