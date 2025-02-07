import { IElementPolygon } from "@/types/IElement";
import Element from "@/modules/elements/Element";

export default class ElementPolygon extends Element implements IElementPolygon {
  get editingEnable(): boolean {
    return false;
  }
}
