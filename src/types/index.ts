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
  mask: IStageDrawerMask;
  provisional: IStageDrawerProvisional;
  currentCreator: Creator;
  canvas: HTMLCanvasElement;
  renderEl: HTMLDivElement;
  worldCenterOffset: IPoint;
  checkCreatorActive(): boolean;
}

export interface IStageStore {
  get creatingElements(): IStageElement[];
  creatingElement(points: IPoint[], canvasRect: DOMRect, worldOffset: IPoint): IStageElement;
}

export interface IStageCanvas {
  canvas: HTMLCanvasElement;
  initCanvas(): HTMLCanvasElement;
  updateCanvasSize(size: ISize): void;
  clearCanvas(): void;
}

export interface IQueueRender {
  renderQueue: IRenderQueue;
  renderCargo(cargo: IRenderTaskCargo): Promise<void>;
}

export interface IStageCursor {
  pos: IPoint;
  clear(): void;
  calcPos(e: MouseEvent, canvasRect: DOMRect): IPoint;
}

export interface IStageDrawer extends IStageCanvas {
  shield: IStageShield;
  renderer: IStageRenderer;
  redraw(): void;
}

export interface IStageDrawerMask extends IStageDrawer {
}

export interface IStageDrawerProvisional extends IStageDrawer {
}

export enum StageDrawerMaskElementObjTypes {
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

export interface IStageDrawerMaskTaskObj {
  type: StageDrawerMaskElementObjTypes;
}

export interface IStageDrawerMaskTaskSelectionObj extends IStageDrawerMaskTaskObj {
  points: IPoint[];
}

export interface IStageDrawerMaskTaskSelectionHandlerObj extends IStageDrawerMaskTaskObj {
  point: IPoint;
  direction: Directions;
}

export interface IStageDrawerMaskTaskCursorObj extends IStageDrawerMaskTaskObj {
  point: IPoint;
  creatorCategory: CreatorCategories;
}

export interface IStageDrawerMaskTask extends IRenderTask {
  get data(): IStageDrawerMaskTaskObj;
  obj: IStageDrawerMaskTaskObj;
}

export interface IStageDrawerMaskTaskSelection extends IStageDrawerMaskTask {
}

export interface IStageDrawerMaskTaskSelectionHandler extends IStageDrawerMaskTask {
  direction: Directions;
}

export interface IStageDrawerMaskTaskCursor extends IStageDrawerMaskTask {
}

export interface IStageDrawerMaskTaskClear extends IStageDrawerMaskTask {
}

export interface IStageElementTask extends IRenderTask {
  element: IStageElement;
}

export interface IStageElementTaskRect extends IStageElementTask {
}

export interface IStageElementTaskCircle extends IStageElementTask {
}

export interface IStageElementTaskClear extends IStageElementTask {
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
  calcPathPoints(): IPoint[];
  getEdgePoints(): IPoint[];
}

export interface IStageElementReact extends IStageElement {
}

export interface IStageElementCircle extends IStageElement {
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
  creating = 1,
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
  redraw(): void;
  clear(): void;
}

export interface IStageDrawerMaskRenderer extends IStageRenderer, IQueueRender {
}

export interface IStageDrawerProvisionalRenderer extends IStageRenderer, IQueueRender {
}

export type CanvasCreatorStyles = {
  strokeStyle?: string;
  lineWidth?: number;
  fillStyle?: string;
}