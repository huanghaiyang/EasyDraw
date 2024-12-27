import { EventEmitter } from "events";

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
export type IDirectionPoint = IPoint & {
  direction?: Directions;
}

// 舞台主画板
export interface IStageShield extends IStageDrawer {
  cursor: IStageCursor;
  selection: IStageSelection;
  store: IStageStore;
  mask: IStageDrawerMask;
  provisional: IStageDrawerProvisional;
  currentCreator: Creator;
  renderEl: HTMLDivElement;
  stageRect: DOMRect;
  stageWorldCoord: IPoint;
  get stageRectPoints(): IPoint[];
  get stageWordRectPoints(): IPoint[];
  get isElementsDragging(): boolean;
  get isElementsResizing(): boolean;
  get isStageMoving(): boolean;
  get isDrawerActive(): boolean;
  get isMoveableActive(): boolean;
  get isHandActive(): boolean;
  get isElementRotating(): boolean;
}

// 用于维护舞台数据关系
export interface IStageStore {
  get creatingElements(): IStageElement[];
  get provisionalElements(): IStageElement[];
  get selectedElements(): IStageElement[];
  get targetElements(): IStageElement[];
  get stageElements(): IStageElement[];
  get noneStageElements(): IStageElement[];
  get rangeElements(): IStageElement[];
  get uniqSelectedElement(): IStageElement;
  get rotatingTargetElements(): IStageElement[];
  createElementModel(type: CreatorTypes, coords: IPoint[], data?: any): ElementObject;
  addElement(element: IStageElement): IStageElement;
  removeElement(id: string): IStageElement;
  updateElementById(id: string, props: Partial<IStageElement>): IStageElement;
  updateElements(elements: IStageElement[], props: Partial<IStageElement>): IStageElement[];
  updateElementModel(id: string, data: Partial<ElementObject>): IStageElement;
  updateElementsModel(elements: IStageElement[], props: Partial<ElementObject>): void;
  hasElement(id: string): boolean;
  findElements(predicate: (node: IStageElement) => boolean): IStageElement[];
  getElementById(id: string): IStageElement;
  getIndexById(id: string): number;
  creatingElement(points: IPoint[]): IStageElement;
  finishCreatingElement(): IStageElement;
  updateSelectedElementsMovement(offset: IPoint): void;
  updateSelectedElementsRotation(point: IPoint): void;
  calcRotatingElementsCentroid(): void;
  setupStageElementsModelCoords(elements: IStageElement[]): void;
  refreshStageElementsPoints(elements: IStageElement[]): void;
  forEach(callback: (element: IStageElement, index: number) => void): void;
  refreshStageElements(): void;
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

export interface IStageHelperDrawer extends IStageDrawer {
  shield: IStageShield;
}

// 辅助画布
export interface IStageDrawerMask extends IStageHelperDrawer { }

// 临时组件绘制画布
export interface IStageDrawerProvisional extends IStageHelperDrawer { }

// 辅助画布绘制任务类型
export enum StageDrawerMaskModelTypes {
  selection = 0,
  sizeTransformer = 1,
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

// 辅助画布绘制任务对象类型
export interface IStageDrawerMaskTaskModel {
  type: StageDrawerMaskModelTypes;
}

// 辅助画布绘制任务选区对象
export interface IStageDrawerMaskTaskSelectionModel extends IStageDrawerMaskTaskModel {
  points: IPoint[];
  type: StageDrawerMaskModelTypes;
  angle?: number;
}

export interface IStageDrawerMaskTaskSizeIndicatorModel extends IStageDrawerMaskTaskModel {
  point: IPoint;
  text: string;
  angle: number;
}

// 辅助画布绘制任务选区控制器对象
export interface IStageDrawerMaskTaskSizeTransformerModel extends IStageDrawerMaskTaskModel {
  point: IPoint;
  direction: Directions;
  angle?: number;
}

// 辅助画布绘制任务光标对象
export interface IStageDrawerMaskTaskCursorModel extends IStageDrawerMaskTaskModel {
  point: IPoint;
  creatorCategory: CreatorCategories;
}

// 组件旋转图标绘制任务对象
export interface IStageDrawerRotationModel extends IStageDrawerMaskTaskModel {
  point: IPoint;
  width: number;
  height: number;
  angle: number;
  vertices: IPoint[];
}

// 辅助画布绘制任务
export interface IStageDrawerMaskTask extends IRenderTask {
  get data(): IStageDrawerMaskTaskModel;
  model: IStageDrawerMaskTaskModel;
}

// 辅助画布选区绘制任务
export interface IStageDrawerMaskTaskSelection extends IStageDrawerMaskTask { }

// 辅助画布选区控制器绘制任务
export interface IStageDrawerMaskTaskSizeTransformer extends IStageDrawerMaskTask {
  direction: Directions;
}

// 辅助画布光标绘制任务
export interface IStageDrawerMaskTaskCursor extends IStageDrawerMaskTask { }

// 组件旋转图标绘制
export interface IStageDrawerMaskTaskRotate extends IStageDrawerMaskTask { }

// 辅助画布清除绘制任务
export interface IStageDrawerMaskTaskClear extends IStageDrawerMaskTask { }

// 用于显示组件尺寸
export interface IStageDrawerMaskTaskSizeIndicator extends IStageDrawerMaskTask { }

// 舞台元素绘制任务
export interface IStageElementTask extends IRenderTask {
  element: IStageElement;
}

// 舞台元素绘制任务-矩形
export interface IStageElementTaskRect extends IStageElementTask { }

// 舞台元素绘制任务-圆形
export interface IStageElementTaskCircle extends IStageElementTask { }

// 舞台元素清除绘制任务
export interface IStageElementTaskClear extends IStageElementTask { }

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
  getSelectionModels(): IStageDrawerMaskTaskSelectionModel[];
  selectTarget(): void;
  clearSelects(): void;
  hitTargetElements(point: IPoint): void;
  checkTargetRotateElement(point: IPoint): IStageElement;
  refreshRangeElements(rangePoints: IPoint[]): void;
  getElementOnPoint(point: IPoint): IStageElement;
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
  originalCoords?: IPoint[]; // 用于移动、变形时的原始坐标
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
export interface IStageElement {
  id: string;
  model: ElementObject;
  rotationModel: IStageDrawerRotationModel;

  get position(): IPoint;
  get points(): IPoint[]; // 相对于舞台画布的坐标(此坐标是绘制是鼠标的路径坐标)
  get pathPoints(): IPoint[]; // 相对于舞台画布的坐标
  get maxBoxPoints(): IPoint[];
  get rotatePoints(): IPoint[];
  get rotatePathPoints(): IPoint[];
  get centroid(): IPoint;
  get sizeTransformerPoints(): IPoint[];

  get isSelected(): boolean;
  get isVisible(): boolean;
  get isEditing(): boolean;
  get isLocked(): boolean;
  get isMoving(): boolean;
  get isResizing(): boolean;
  get isRotating(): boolean;
  get isRotatingTarget(): boolean;
  get isDragging(): boolean;
  get isProvisional(): boolean;
  get isTarget(): boolean;
  get isOnStage(): boolean;
  get isInRange(): boolean;
  get status(): ElementStatus;

  set position(value: IPoint);
  set isSelected(value: boolean);
  set isVisible(value: boolean);
  set isEditing(value: boolean);
  set isLocked(value: boolean);
  set isMoving(value: boolean);
  set isResizing(value: boolean);
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
  calcSizeTransformerPoints(): IPoint[];
}

// 舞台元素（组件）-React
export interface IStageElementReact extends IStageElement { }

// 舞台元素（组件）-圆形
export interface IStageElementCircle extends IStageElement { }

// 创作工具
export type Creator = {
  type: CreatorTypes,
  name: string,
  category: CreatorCategories,
  icon?: string,
  cursor: string,
}

// 画板鼠标按下时的用途
export enum ShieldMouseDownUsage {
  move = 0,
  resize = 1,
  select = 2,
  drag = 3
}

// 舞台组件状态
export enum ElementStatus {
  initialed = -1,
  startCreating = 0,
  creating = 1,
  finished = 2
}

// 选区绘制类型
export enum SelectionRenderTypes {
  none = 0,
  rect = 1,
  line = 2
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
export interface IStageDrawerMaskRenderer extends IStageRenderer, IQueueRender { }

// 临时画布绘制器 
export interface IStageDrawerProvisionalRenderer extends IStageRenderer, IQueueRender { }

// 主画布绘制器
export interface IStageDrawerShieldRenderer extends IStageRenderer, IQueueRender { }

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
}

export interface IElementList extends EventEmitter {}