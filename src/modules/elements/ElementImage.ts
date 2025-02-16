import { IElementImage } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";

export default class ElementImage extends ElementRect implements IElementImage {
  get fillEnabled(): boolean {
    return false;
  }
}
