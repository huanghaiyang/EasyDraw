import { ElementObject, IElementArbitrary } from "@/types/IElement";
import Element from "@/modules/elements/Element";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/IElementTransformer";
import { ElementStatus } from "@/types";

export default class ElementArbitrary extends Element implements IElementArbitrary {
  createdCoordIndex: number;

  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
  }

  get borderTransformEnable(): boolean {
    return false;
  }

  get activePointIndex(): number {
    if (this.status !== ElementStatus.finished) {
      if (this.model.coords.length > this.createdCoordIndex + 1) {
        return this.createdCoordIndex + 1;
      }
      return this.createdCoordIndex;
    }
    return -1;
  }

  constructor(model: ElementObject, shield: IStageShield) {
    super(model, shield);
    this.createdCoordIndex = -1;
  }

  protected _setStatus(status: ElementStatus): void {
    if (status === ElementStatus.finished) {
      this.createdCoordIndex = -1;
    }
  }
}