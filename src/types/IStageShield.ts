import { IPoint } from "@/types/index";
import IStageConfigure from "@/types/IStageConfigure";
import { IDrawerMask, IDrawerProvisional, IStageDrawer } from "@/types/IStageDrawer";
import IStageSelection from "@/types/IStageSelection";
import IStageStore from "@/types/IStageStore";
import IStageCursor from "@/types/IStageCursor";
import { Creator } from '@/types/Creator';

// 舞台主画板
export default interface IStageShield extends IStageDrawer {
  cursor: IStageCursor;
  selection: IStageSelection;
  store: IStageStore;
  mask: IDrawerMask;
  provisional: IDrawerProvisional;
  configure: IStageConfigure;
  currentCreator: Creator;
  renderEl: HTMLDivElement;
  stageRect: DOMRect;
  stageWorldCoord: IPoint;

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
}