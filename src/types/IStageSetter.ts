import { IPoint } from "@/types/index";
import { StrokeTypes } from "@/types/ElementStyles";
import IElement from "@/types/IElement";

export default interface IStageSetter {
  setElementsPosition(elements: IElement[], value: IPoint): Promise<void>;
  setElementsWidth(elements: IElement[], value: number): Promise<void>;
  setElementsHeight(elements: IElement[], value: number): Promise<void>;
  setElementsAngle(elements: IElement[], value: number): Promise<void>;
  setElementsStrokeType(elements: IElement[], value: StrokeTypes): Promise<void>;
  setElementsStrokeWidth(elements: IElement[], value: number): Promise<void>;
  setElementsStrokeColor(elements: IElement[], value: string): Promise<void>;
  setElementsStrokeColorOpacity(elements: IElement[], value: number): Promise<void>;
  setElementsFillColor(elements: IElement[], value: string): Promise<void>;
  setElementsFillColorOpacity(elements: IElement[], value: number): Promise<void>;
  setElementsTextAlign(elements: IElement[], value: CanvasTextAlign): Promise<void>;
  setElementsTextBaseline(elements: IElement[], value: CanvasTextBaseline): Promise<void>;
  setElementsFontSize(elements: IElement[], value: number): Promise<void>;
  setElementsFontFamily(elements: IElement[], value: string): Promise<void>;
}