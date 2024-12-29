import { EventEmitter } from "events";
import IStageConfigure from "@/types/IStageConfigure";

// 创作工具类型,同时也是组件类型
export enum CreatorTypes {
  moveable = 0,
  rectangle = 1,
  hand = 2,
}

// 创作工具分类
export enum CreatorCategories {
  cursor = 0,
  shapes = 1,
}

// 尺寸
export type ISize = {
  width: number;
  height: number;
}

// 坐标
export type IPoint = {
  x: number;
  y: number;
}

// 3D坐标
export type IPoint3D = IPoint & {
  z: number;
}

// 方位坐标
export type IElementTransformer = IPoint & {
  direction?: Directions;
  points: IPoint[];
  isActive: boolean;
  isContainsPoint(point: IPoint): boolean;
}

// 舞台主画板
export interface IStageShield extends IStageDrawer {
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

  get stageRectPoints(): IPoint[];
  get stageWordRectPoints(): IPoint[];
  get isElementsDragging(): boolean;
  get isElementsTransforming(): boolean;
  get isStageMoving(): boolean;
  get isDrawerActive(): boolean;
  get isMoveableActive(): boolean;
  get isHandActive(): boolean;
  get isElementRotating(): boolean;
}

// 用于维护舞台数据关系
export interface IStageStore {
  get creatingElements(): IElement[];
  get provisionalElements(): IElement[];
  get selectedElements(): IElement[];
  get targetElements(): IElement[];
  get Elements(): IElement[];
  get noneElements(): IElement[];
  get rangeElements(): IElement[];
  get uniqSelectedElement(): IElement;
  get rotatingTargetElements(): IElement[];
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
  keepOriginalProps(elements: IElement[]): void;
  refreshElementsPoints(elements: IElement[]): void;
  forEach(callback: (element: IElement, index: number) => void): void;
  refreshElements(): void;
}

// 画板画布
export interface IStageCanvas {
  canvas: HTMLCanvasElement;
  initCanvas(): HTMLCanvasElement;
  updateCanvasSize(size: ISize): void;
  clearCanvas(): void;
}

// 渲染器
export interface IQueueRender {
  renderQueue: IRenderQueue;
  renderCargo(cargo: IRenderTaskCargo): Promise<void>;
}

// 舞台光标
export interface IStageCursor {
  value: IPoint;
  clear(): void;
  transform(e: MouseEvent): IPoint;
}

// 舞台画布
export interface IStageDrawer extends IStageCanvas, EventEmitter {
  renderer: IStageRenderer;
  redraw(): Promise<void>;
}

export interface IHelperDrawer extends IStageDrawer {
  shield: IStageShield;
}

// 辅助画布
export interface IDrawerMask extends IHelperDrawer { }

// 临时组件绘制画布
export interface IDrawerProvisional extends IHelperDrawer { }

// 辅助画布绘制任务类型
export enum DrawerMaskModelTypes {
  selection = 0,
  transformer = 1,
  cursor = 2,
  highlight = 3,
  rotate = 4,
  sizeIndicator,
}

// 方位
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

export const BoxDirections = [
  Directions.topLeft,
  Directions.topRight,
  Directions.bottomRight,
  Directions.bottomLeft,
]

// 辅助画布绘制任务对象类型
export interface IMaskModel {
  type: DrawerMaskModelTypes;
}

// 辅助画布绘制任务选区对象
export interface IMaskSelectionModel extends IMaskModel {
  points: IPoint[];
  type: DrawerMaskModelTypes;
  angle?: number;
}

export interface IMaskSizeIndicatorModel extends IMaskModel {
  point: IPoint;
  text: string;
  angle: number;
}

// 辅助画布绘制任务选区控制器对象
export interface IMaskTransformerModel extends IMaskModel {
  point: IPoint;
  angle?: number;
}

// 辅助画布绘制任务光标对象
export interface IMaskCursorModel extends IMaskModel {
  point: IPoint;
  creatorCategory: CreatorCategories;
}

// 组件旋转图标绘制任务对象
export interface IRotationModel extends IMaskModel {
  point: IPoint;
  width: number;
  height: number;
  angle: number;
  vertices: IPoint[];
}

// 辅助画布绘制任务
export interface IMaskTask extends IRenderTask {
  get data(): IMaskModel;
  model: IMaskModel;
}

// 辅助画布选区绘制任务
export interface IMaskSelection extends IMaskTask { }

// 辅助画布选区控制器绘制任务
export interface IMaskTransformer extends IMaskTask { }

// 辅助画布光标绘制任务
export interface IMaskCursor extends IMaskTask { }

// 组件旋转图标绘制
export interface IMaskRotate extends IMaskTask { }

// 辅助画布清除绘制任务
export interface IMaskClear extends IMaskTask { }

// 用于显示组件尺寸
export interface IMaskSizeIndicator extends IMaskTask { }

// 舞台元素绘制任务
export interface IElementTask extends IRenderTask {
  element: IElement;
}

// 舞台元素绘制任务-矩形
export interface IElementTaskRect extends IElementTask { }

// 舞台元素绘制任务-圆形
export interface IElementTaskCircle extends IElementTask { }

// 舞台元素清除绘制任务
export interface IElementTaskClear extends IElementTask { }

// 舞台事件处理器
export interface IStageEvent extends EventEmitter {
  init(): void;
}

// 舞台选区
export interface IStageSelection {
  get isEmpty(): boolean;
  get isRange(): boolean;
  setRange(points: IPoint[]): void;
  selectRange(): void;
  getSelectionModels(): IMaskSelectionModel[];
  selectTarget(): void;
  clearSelects(): void;
  hitTargetElements(point: IPoint): void;
  checkTargetRotateElement(point: IPoint): IElement;
  checkTransformerElement(point: IPoint): IElement;
  refreshRangeElements(rangePoints: IPoint[]): void;
  getElementOnPoint(point: IPoint): IElement;
  checkSelectContainsTarget(): boolean;
}

// 舞台容器
export interface IStageContainer {
  el: HTMLDivElement;
}

// 舞台初始化参数
export type StageInitParams = {
  containerEl?: HTMLDivElement;
  shieldEl?: HTMLDivElement;
}

// 舞台实例
export interface StageShieldInstance {
  init: () => Promise<void>;
}

// 舞台元素数据模型
export type ElementObject = {
  id: string;
  coords: IPoint[]; // 相对于世界中心的坐标
  type: CreatorTypes;
  data: any;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  angle: number;
  name: string;
  width?: number;
  height?: number;
  length?: number;
}

// 舞台元素（组件）
export interface IElement {
  id: string;
  model: ElementObject;
  rotationModel: IRotationModel;
  
  get width(): number;
  get height(): number;
  get angle(): number;
  get position(): IPoint;

  get originalModelCoords(): IPoint[];
  get points(): IPoint[]; // 相对于舞台画布的坐标(此坐标是绘制是鼠标的路径坐标)
  get pathPoints(): IPoint[]; // 相对于舞台画布的坐标
  get maxBoxPoints(): IPoint[];
  get rotatePoints(): IPoint[];
  get rotatePathPoints(): IPoint[];
  get centroid(): IPoint;
  get transformers(): IElementTransformer[];

  get isSelected(): boolean;
  get isVisible(): boolean;
  get isEditing(): boolean;
  get isLocked(): boolean;
  get isMoving(): boolean;
  get isTransforming(): boolean;
  get isRotating(): boolean;
  get isRotatingTarget(): boolean;
  get isDragging(): boolean;
  get isProvisional(): boolean;
  get isTarget(): boolean;
  get isOnStage(): boolean;
  get isInRange(): boolean;
  get status(): ElementStatus;

  set isSelected(value: boolean);
  set isVisible(value: boolean);
  set isEditing(value: boolean);
  set isLocked(value: boolean);
  set isMoving(value: boolean);
  set isTransforming(value: boolean);
  set isRotating(value: boolean);
  set isDragging(value: boolean);
  set isProvisional(value: boolean);
  set isTarget(value: boolean);
  set isOnStage(value: boolean);
  set isInRange(value: boolean);
  set status(value: ElementStatus);

  refreshStagePoints(stageRect: DOMRect, stageWorldCoord: IPoint): void;

  isInPolygon(points: IPoint[]): boolean;
  isContainsPoint(point: IPoint): boolean;
  isPolygonOverlap(points: IPoint[]): boolean;
  isModelPolygonOverlap(points: IPoint[]): boolean;
  isRotationContainsPoint(point: IPoint): boolean;

  calcPosition(): IPoint;
  calcPoints(stageRect: DOMRect, stageWorldCoord: IPoint): IPoint[];
  calcPathPoints(): IPoint[];
  calcRotatePoints(): IPoint[];
  calcRotatePathPoints(): IPoint[];
  calcMaxBoxPoints(): IPoint[];
  calcCentroid(): IPoint;
  calcTransformers(): IPoint[];

  getTransformerByPoint(point: IPoint): IElementTransformer;
  activeTransformer(transformer: IElementTransformer): void;
  transform(offset: IPoint): void;

  calcOriginalElementProps(): void;
  calcOriginalModelCoords(): void;
  calcOriginalProps(): void;
}

// 舞台元素（组件）-React
export interface IElementReact extends IElement { }

// 舞台元素（组件）-圆形
export interface IElementCircle extends IElement { }

// 创作工具
export type Creator = {
  type: CreatorTypes,
  name: string,
  category: CreatorCategories,
  icon?: string,
  cursor: string,
}

// 舞台组件状态
export enum ElementStatus {
  initialed = -1,
  startCreating = 0,
  creating = 1,
  finished = 2
}

// 渲染任务函数
export interface ITaskFunc {
  (): Promise<boolean | void>;
}

// 渲染任务
export interface IRenderTask {
  id: string;
  run(): Promise<void>;
  destroy(): Promise<void>;
}

// 批次渲染任务
export interface IRenderTaskCargo extends IRenderTask {
  tasks: IRenderTask[];
  running: boolean;
  prepend(task: IRenderTask): void;
  add(task: IRenderTask): void;
  addAll(tasks: IRenderTask[]): void;
  isEmpty(): boolean;
}

// 渲染队列
export interface IRenderQueue {
  running: boolean;
  queue: IRenderTask[];
  add(task: IRenderTask): Promise<void>;
  run(): Promise<void>;
}

// 舞台渲染器
export interface IStageRenderer {
  redraw(): Promise<void>;
  clear(): void;
}

// 辅助画布绘制器
export interface IMaskRenderer extends IStageRenderer, IQueueRender { }

// 临时画布绘制器 
export interface IProvisionalRenderer extends IStageRenderer, IQueueRender { }

// 主画布绘制器
export interface IShieldRenderer extends IStageRenderer, IQueueRender { }

// 画板元素样式定义
export type CanvasCreatorStyles = {
  strokeStyle?: string;
  lineWidth?: number;
  fillStyle?: string;
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

// 平移值
export type TranslationValue = {
  dx: number;
  dy: number;
}

// 缩放值
export type ScaleValue = {
  sx: number;
  sy: number
}

// 舞台通知名称
export enum ShieldDispatcherNames {
  elementCreated = 0,
  selectedChanged = 1,
  targetChanged = 2,
  positionChanged = 3,
  widthChanged = 4,
  heightChanged = 5,
  angleChanged = 6,
}

export interface IElementList extends EventEmitter { }