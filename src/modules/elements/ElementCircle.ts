import Element from "@/modules/elements/Element";
import { IElementCircle } from "@/types/IElement";

export default class ElementCircle extends Element implements IElementCircle { 
  get editingEnable(): boolean {
    return false;
  }
}