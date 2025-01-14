import { IPoint } from "@/types/index";
import IStageConfigure from "@/types/IStageConfigure";
import { IDrawerMask, IDrawerProvisional, IStageDrawer } from "@/types/IStageDrawer";
import IStageSelection from "@/types/IStageSelection";
import IStageStore from "@/types/IStageStore";
import IStageCursor from "@/types/IStageCursor";
import { Creator } from '@/types/Creator';
import IStageEvent from "@/types/IStageEvent";
import IStageSetter from "@/types/IStageSetter";
import IElement from "@/types/IElement";
import IStageAlign from "@/types/IStageAlign";

// 舞台主画板
export default interface IStageShield extends IStageDrawer, IStageSetter {
  cursor: IStageCursor;
  selection: IStageSelection;
  store: IStageStore;
  mask: IDrawerMask;
  provisional: IDrawerProvisional;
  configure: IStageConfigure;
  event: IStageEvent;
  align: IStageAlign;
  currentCreator: Creator;
  renderEl: HTMLDivElement;
  stageRect: DOMRect;
  stageWorldCoord: IPoint;
  stageScale: number;

  get shouldRedraw(): boolean;
  get isElementsBusy(): boolean;
  get stageRectPoints(): IPoint[];
  get stageWordRectCoords(): IPoint[];
  get isElementsDragging(): boolean;
  get isElementsTransforming(): boolean;
  get isStageMoving(): boolean;
  get isDrawerActive(): boolean;
  get isMoveableActive(): boolean;
  get isHandActive(): boolean;
  get isElementsRotating(): boolean;
  get isArbitraryDrawing(): boolean;

  calcScaleAutoFitValueByBox(box: IPoint[]): number;
  calcScaleAutoFitValue(): number;
  calcElementAutoFitValue(element: IElement): number;
  setScale(value: number): void;
  setScale100(): void;
  setScaleAutoFit(): void;
  setScaleReduce(): void;
  setScaleIncrease(): void;
  
  deleteSelectElements(): void;
  selectAll(): void;

  uploadImages(images: File[]): Promise<void>;
  commitArbitraryDrawing(): Promise<void>;
}