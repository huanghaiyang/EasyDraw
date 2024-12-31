import { IPoint } from "@/types/index";
import IStageConfigure from "@/types/IStageConfigure";
import { IDrawerMask, IDrawerProvisional, IStageDrawer } from "@/types/IStageDrawer";
import IStageSelection from "@/types/IStageSelection";
import IStageStore from "@/types/IStageStore";
import IStageCursor from "@/types/IStageCursor";
import { Creator } from '@/types/Creator';
import IStageEvent from "@/types/IStageEvent";
import IElement from '@/types/IElement';
import { StrokeTypes } from '@/types/ElementStyles';

// 舞台主画板
export default interface IStageShield extends IStageDrawer {
  cursor: IStageCursor;
  selection: IStageSelection;
  store: IStageStore;
  mask: IDrawerMask;
  provisional: IDrawerProvisional;
  configure: IStageConfigure;
  event: IStageEvent;
  currentCreator: Creator;
  renderEl: HTMLDivElement;
  stageRect: DOMRect;
  stageWorldCoord: IPoint;
  scale: number;

  get shouldRedraw(): boolean;
  get isElementsBusy(): boolean;
  get stageRectPoints(): IPoint[];
  get stageWordRectPoints(): IPoint[];
  get isElementsDragging(): boolean;
  get isElementsTransforming(): boolean;
  get isStageMoving(): boolean;
  get isDrawerActive(): boolean;
  get isMoveableActive(): boolean;
  get isHandActive(): boolean;
  get isElementsRotating(): boolean;

  setElementsPosition(elements: IElement[], value: IPoint): void;
  setElementsWidth(elements: IElement[], value: number): void;
  setElementsHeight(elements: IElement[], value: number): void;
  setElementsAngle(elements: IElement[], value: number): void;
  setElementsStrokeType(elements: IElement[], value: StrokeTypes): void;
  setElementsStrokeWidth(elements: IElement[], value: number): void;
  setElementsStrokeColor(elements: IElement[], value: string): void;
  setElementsStrokeColorOpacity(elements: IElement[], value: number): void;
  setElementsFillColor(elements: IElement[], value: string): void;
  setElementsFillColorOpacity(elements: IElement[], value: number): void;
  setElementsTextAlign(elements: IElement[], value: CanvasTextAlign): void;
  setElementsTextBaseline(elements: IElement[], value: CanvasTextBaseline): void;
  setElementsFontSize(elements: IElement[], value: number): void;
  setElementsFontFamily(elements: IElement[], value: string): void;
}