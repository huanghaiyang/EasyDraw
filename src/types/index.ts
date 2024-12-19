import { EventEmitter } from "events";

// 创作工具类型
export enum CreatorTypes {
  moveable = 0,
  rectangle = 1
}

export enum CreatorUsageTypes {
  once = 0,
  forever = 1
}

export enum CreatorCategories {
  cursor = 0,
  shapes = 1,
}

export type ISize = {
  width: number;
  height: number;
}

export type IPoint = {
  x: number;
  y: number;
}

export type IPoint3D = IPoint & {
  z: number;
}

export type IDirectionPoint = IPoint & {
  direction: Directions;
}

export interface IRect {
  size: ISize;
  position?: IPoint;
}

// 舞台画板
export interface IStageShield extends IRect {
  cursor: IStageCursor;
  selection: IStageSelection;
  store: IStageStore;
  mask: IStageMask;
  provisional: IStageProvisional;
  renderer: IStageRenderer;
  currentCreator: Creator;
  canvas: HTMLCanvasElement;
  renderEl: HTMLDivElement;
  worldCenterOffset: IPoint;
  checkCreatorActive(): boolean;
}

export interface IStageStore {
  createOrUpdateElement(points: IPoint[], canvasRect: DOMRect, worldOffset: IPoint): IStageElement;
}

export interface IStageCanvasDrawer {
  canvas: HTMLCanvasElement;
  initCanvas(): HTMLCanvasElement;
  updateCanvasSize(size: ISize): void;
  clearCanvas(): void;
}

export interface IStageCursor {
  pos: IPoint;
  clear(): void;
  calcPos(e: MouseEvent, canvasRect: DOMRect): IPoint;
}

export interface IStageMask extends IStageCanvasDrawer {
  renderCargo(cargo: IRenderTaskCargo): Promise<void>;
}

export enum StageMaskElementObjTypes {
  selection = 0,
  selectionHandler = 1,
  cursor = 2
}

export enum Directions {
  topLeft = 0,
  topCenter = 1,
  topRight = 2,
  rightCenter = 3,
  bottomRight = 4,
  bottomCenter = 5,
  bottomLeft = 6,
  leftCenter = 7,
  freedom = 8
}

export interface IStageMaskTaskObj {
  type: StageMaskElementObjTypes;
}

export interface IStageMaskTaskSelectionObj extends IStageMaskTaskObj {
  points: IPoint[];
}

export interface IStageMaskTaskSelectionHandlerObj extends IStageMaskTaskObj {
  point: IPoint;
  direction: Directions;
}

export interface IStageMaskTaskCursorObj extends IStageMaskTaskObj {
  point: IPoint;
  creatorCategory: CreatorCategories;
}

export interface IStageMaskTask extends IRenderTask {
  obj: IStageMaskTaskObj;
}

export interface IStageMaskTaskSelection extends IStageMaskTask {
}

export interface IStageMaskTaskSelectionHandler extends IStageMaskTask {
  direction: Directions;
}

export interface IStageMaskTaskCursor extends IStageMaskTask {
}

export interface IStageMaskTaskClear extends IStageMaskTask {
}

export interface IStageElementRenderTask extends IRenderTask {
  element: IStageElement;
}

export interface IStageElementRectRenderTask extends IStageElementRenderTask {
}

export interface IStageElementCircleRenderTask extends IStageElementRenderTask {
}

export interface IStageProvisional extends IStageCanvasDrawer {
  renderElement(e: MouseEvent, element: IStageElement): void;
}

export interface IStageEvent extends EventEmitter {
  init(): void;
}

export interface IStageSelection {
  setElements(elements: IStageElement[]): void;
  getEdge(): IPoint[];
  isEmpty(): boolean;
  getRenderType(): SelectionRenderTypes
}

// 舞台容器
export interface IStageContainer extends IRect {
  el: HTMLDivElement;
}

export type StageInitParams = {
  containerEl?: HTMLDivElement;
  shieldEl?: HTMLDivElement;
  stageEl?: HTMLDivElement;
}

export interface StageShieldInstance {
  init: () => Promise<void>;
}

export type ElementObject = {
  id: string;
  points: IPoint[];
  type: CreatorTypes;
  data: any;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
}

export interface IStageElement {
  id: string;
  obj: ElementObject;
  points: IPoint[];
  pathPoints: IPoint[];
  isSelected: boolean;
  isVisible: boolean;
  isEditing: boolean;
  isLocked: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isDragging: boolean;
  status: ElementCreateStatus;
  render(canvas: HTMLCanvasElement): void;
  calcPathPoints(): IPoint[];
  getEdgePoints(): IPoint[];
}

export type Creator = {
  type: CreatorTypes,
  usage: CreatorUsageTypes,
  category: CreatorCategories,
}

// 画板鼠标按下时的用途
export enum ShieldMouseDownUsage {
  move = 0,
  resize = 1,
  select = 2,
  drag = 3
}

export interface IStageStore {
  elementList: IStageElement[];
  createObject(type: CreatorTypes, points: IPoint[], data?: any): ElementObject;
  createElement(obj: ElementObject): IStageElement;
  addElement(element: IStageElement): IStageElement;
  removeElement(id: string): IStageElement;
  updateElementObj(id: string, data: ElementObject): IStageElement;
}

export enum ElementCreateStatus {
  starting = 0,
  doing = 1,
  finished = 2
}

export enum SelectionRenderTypes {
  none = 0,
  rect = 1,
  line = 2
}

export interface ITaskFunc {
  (): Promise<boolean | void>;
}

export interface IRenderTask {
  id: string;
  run(): Promise<void>;
  destroy(): Promise<void>;
}

export interface IRenderTaskCargo extends IRenderTask {
  tasks: IRenderTask[];
  running: boolean;
  prepend(task: IRenderTask): void;
  add(task: IRenderTask): void;
  addAll(tasks: IRenderTask[]): void;
  isEmpty(): boolean;
}

export interface IRenderQueue {
  running: boolean;
  queue: IRenderTask[];
  add(task: IRenderTask): Promise<void>;
  run(): Promise<void>;
}

export interface IStageRenderer {
  redrawMask(): void;
  redrawProvisional(): void;
  redraw(): void;
  clear(): void;
  clearMask(): void;
  clearProvisional(): void;
}

export type CanvasCreatorStyles = {
  strokeStyle?: string;
  lineWidth?: number;
  fillStyle?: string;
}