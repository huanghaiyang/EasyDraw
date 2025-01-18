import { ElementObject, IElementArbitrary } from "@/types/IElement";
import Element from "@/modules/elements/Element";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/IElementTransformer";
import { ElementStatus, IPoint } from "@/types";
import PolygonUtils from "@/utils/PolygonUtils";

export default class ElementArbitrary extends Element implements IElementArbitrary {
  tailCoordIndex: number;

  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
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

  private _outerPaths: IPoint[][] = [];

  private _outerWorldPaths: IPoint[][] = [];

  get outerPaths(): IPoint[][] {
    return this._outerPaths;
  }

  get outerWorldPaths(): IPoint[][] {
    return this._outerWorldPaths;
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

  calcOuterPaths(): IPoint[][] {
    const result:IPoint[][] = [];
    this.rotatePathPoints.forEach((point, index) => {
      if (index < this.rotatePathPoints.length - 1) {
        const next = this.rotatePathPoints[index + 1];
        // result.push(PolygonUtils.calcBentLineOuterVertices(point, next));
      }
    })
    return result;
  }

  calcOuterWorldPaths(): IPoint[][] {
    const result:IPoint[][] = [];
    return result;
  }

  private refreshOuters(): void {
    this._outerPaths = this.calcOuterPaths();
    this._outerWorldPaths = this.calcOuterWorldPaths();
  }

  refreshElementPoints(): void {
    super.refreshElementPoints();
    this.refreshOuters();
  }

  protected _refreshOutlinePoints(): void {
    super._refreshOutlinePoints();
    this.refreshOuters();
  }
}