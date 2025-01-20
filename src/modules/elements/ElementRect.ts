import Element from "@/modules/elements/Element";
import { IElementReact } from "@/types/IElement";

export default class ElementRect extends Element implements IElementReact { 
  get editingEnable(): boolean {
    return false;
  }
}