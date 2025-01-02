import IElement, { ElementObject } from "@/types/IElement";
import { IPoint } from "@/types/index";
import { CreatorTypes } from "@/types/Creator";
import IStageSetter from "@/types/IStageSetter";

// 用于维护舞台数据关系
export default interface IStageStore extends IStageSetter {
  get creatingElements(): IElement[];
  get provisionalElements(): IElement[];
  get selectedElements(): IElement[];
  get targetElements(): IElement[];
  get Elements(): IElement[];
  get noneElements(): IElement[];
  get rangeElements(): IElement[];
  get uniqSelectedElement(): IElement;
  get rotatingTargetElements(): IElement[];
  get isSelectedEmpty(): boolean;

  createElementModel(type: CreatorTypes, coords: IPoint[], data?: any): ElementObject;
  addElement(element: IElement): IElement;
  removeElement(id: string): IElement;
  updateElementById(id: string, props: Partial<IElement>): IElement;
  updateElements(elements: IElement[], props: Partial<IElement>): IElement[];
  updateElementModel(id: string, data: Partial<ElementObject>): IElement;
  updateElementsModel(elements: IElement[], props: Partial<ElementObject>): void;
  hasElement(id: string): boolean;
  findElements(predicate: (node: IElement) => boolean): IElement[];
  getElementById(id: string): IElement;
  getIndexById(id: string): number;
  creatingElement(points: IPoint[]): IElement;
  finishCreatingElement(): IElement;
  updateSelectedElementsMovement(offset: IPoint): void;
  updateSelectedElementsRotation(point: IPoint): void;
  updateSelectedElementsTransform(point: IPoint): void;
  calcRotatingElementsCentroid(): void;
  alterOriginalProps(elements: IElement[]): void;
  refreshElementsPoints(elements: IElement[]): void;
  forEach(callback: (element: IElement, index: number) => void): void;
  refreshStageElements(): void;
}