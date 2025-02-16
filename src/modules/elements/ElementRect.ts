import Element from "@/modules/elements/Element";
import { IElementRect } from "@/types/IElement";

export default class ElementRect extends Element implements IElementRect {
  get editingEnable(): boolean {
    return false;
  }
}
