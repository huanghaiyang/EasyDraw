import { IElementText } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";

export default class ElementText extends ElementRect implements IElementText {
  get editingEnable(): boolean {
    return true;
  }
}
