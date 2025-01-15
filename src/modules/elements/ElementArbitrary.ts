import { ElementObject, IElementArbitrary } from "@/types/IElement";
import Element from "@/modules/elements/Element";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/IElementTransformer";
import { ElementStatus } from "@/types";

export default class ElementArbitrary extends Element implements IElementArbitrary {
  tailCoordIndex: number;

  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
  }

  get borderTransformEnable(): boolean {
    return false;
  }

  get verticesTransformEnable(): boolean {
    return this.status !== ElementStatus.finished;
  }

  get boxVerticesTransformEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  get activePointIndex(): number {
    if (this.status !== ElementStatus.finished) {
      if (this.model.coords.length > this.tailCoordIndex + 1) {
        return this.tailCoordIndex + 1;
      }
      return this.tailCoordIndex;
    }
    return -1;
  }

  constructor(model: ElementObject, shield: IStageShield) {
    super(model, shield);
    this.tailCoordIndex = -1;
  }

  protected __setStatus(status: ElementStatus): void {
    super.__setStatus(status);
    if (status === ElementStatus.finished) {
      this.tailCoordIndex = -1;
    }
  }
}