import IElement from "@/types/IElement";
import { ITransformer } from "@/types/IElementTransformer";
import CommonUtils from "@/utils/CommonUtils";

export default class BaseTransformer implements ITransformer {
  element: IElement;
  id: string;
  isActive: boolean;

  get angle(): number {
    return 0;
  }

  constructor(element: IElement) {
    this.element = element;
    this.id = CommonUtils.getRandomId();
    this.isActive = false;
  }

}