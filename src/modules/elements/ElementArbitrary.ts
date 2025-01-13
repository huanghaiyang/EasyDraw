import { ElementObject, IElementArbitrary } from "@/types/IElement";
import Element from "@/modules/elements/Element";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/IElementTransformer";

export default class ElementArbitrary extends Element implements IElementArbitrary {
  createdCoordIndex: number;

  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
  }

  constructor(model: ElementObject, shield: IStageShield) {
    super(model, shield);
    this.createdCoordIndex = -1;
  }
}