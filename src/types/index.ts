import { EventEmitter } from "events";

// 创作工具类型,同时也是组件类型
export enum CreatorTypes {
  moveable = 0,
  rectangle = 1
}

// 创作工具使用次数
export enum CreatorUsageTypes {
  once = 0,
  forever = 1
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
  direction: Directions;
}

//盒模型
export interface IRect {
  size: ISize;
  position?: IPoint;
}

// 舞台主画板
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

// 用于维护舞台数据关系
export interface IStageStore {
  get creatingElements(): IStageElement[];
  hasElement(id: string): boolean;
  getElementById(id: string): IStageElement;
  getIndexById(id: string): number;
  creatingElement(points: IPoint[], canvasRect: DOMRect, worldOffset: IPoint): IStageElement;
  finishCreatingElement(): IStageElement;
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
  pos: IPoint;
  clear(): void;
  calcPos(e: MouseEvent, canvasRect: DOMRect): IPoint;
}

// 舞台画布
export interface IStageDrawer extends IStageCanvas {
  shield: IStageShield;
  renderer: IStageRenderer;
  redraw(): void;
}

// 辅助画布
export interface IStageDrawerMask extends IStageDrawer {
}

// 临时组件绘制画布
export interface IStageDrawerProvisional extends IStageDrawer {
}

// 辅助画布绘制任务类型
export enum StageDrawerMaskObjTypes {
  selection = 0,
  selectionHandler = 1,
  cursor = 2
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
export interface IStageDrawerMaskTaskObj {
  type: StageDrawerMaskObjTypes;
}

// 辅助画布绘制任务选区对象
export interface IStageDrawerMaskTaskSelectionObj extends IStageDrawerMaskTaskObj {
  points: IPoint[];
}

// 辅助画布绘制任务选区控制器对象
export interface IStageDrawerMaskTaskSelectionHandlerObj extends IStageDrawerMaskTaskObj {
  point: IPoint;
  direction: Directions;
}

// 辅助画布绘制任务光标对象
export interface IStageDrawerMaskTaskCursorObj extends IStageDrawerMaskTaskObj {
  point: IPoint;
  creatorCategory: CreatorCategories;
}

// 辅助画布绘制任务
export interface IStageDrawerMaskTask extends IRenderTask {
  get data(): IStageDrawerMaskTaskObj;
  obj: IStageDrawerMaskTaskObj;
}

// 辅助画布选区绘制任务
export interface IStageDrawerMaskTaskSelection extends IStageDrawerMaskTask {
}

// 辅助画布选区控制器绘制任务
export interface IStageDrawerMaskTaskSelectionHandler extends IStageDrawerMaskTask {
  direction: Directions;
}

// 辅助画布光标绘制任务
export interface IStageDrawerMaskTaskCursor extends IStageDrawerMaskTask {
}

// 辅助画布清除绘制任务
export interface IStageDrawerMaskTaskClear extends IStageDrawerMaskTask {
}

// 舞台元素绘制任务
export interface IStageElementTask extends IRenderTask {
  element: IStageElement;
}

// 舞台元素绘制任务-矩形
export interface IStageElementTaskRect extends IStageElementTask {
}

// 舞台元素绘制任务-圆形
export interface IStageElementTaskCircle extends IStageElementTask {
}

// 舞台元素清除绘制任务
export interface IStageElementTaskClear extends IStageElementTask {
}

// 舞台事件处理器
export interface IStageEvent extends EventEmitter {
  init(): void;
}

// 舞台选区
export interface IStageSelection {
  get selects(): IStageElement[];
  getEdge(): IPoint[];
  isEmpty(): boolean;
  getRenderType(): SelectionRenderTypes;
  clearSelects(): void;
}

// 舞台容器
export interface IStageContainer extends IRect {
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
  points: IPoint[];
  type: CreatorTypes;
  data: any;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
}

// 舞台元素（组件）
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
  status: ElementStatus;
  calcPathPoints(): IPoint[];
  getEdgePoints(): IPoint[];
}

// 舞台元素（组件）-React
export interface IStageElementReact extends IStageElement {
}

// 舞台元素（组件）-圆形
export interface IStageElementCircle extends IStageElement {
}

// 创作工具
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

// 舞台数据存储器
export interface IStageStore {
  elementList: IStageElement[];
  createObject(type: CreatorTypes, points: IPoint[], data?: any): ElementObject;
  createElement(obj: ElementObject): IStageElement;
  addElement(element: IStageElement): IStageElement;
  removeElement(id: string): IStageElement;
  updateElementObj(id: string, data: ElementObject): IStageElement;
}

// 舞台组件状态
export enum ElementStatus {
  starting = 0,
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
  redraw(): void;
  clear(): void;
}

// 辅助画布绘制器
export interface IStageDrawerMaskRenderer extends IStageRenderer, IQueueRender {
}

// 临时画布绘制器 
export interface IStageDrawerProvisionalRenderer extends IStageRenderer, IQueueRender {
}

// 画板元素样式定义
export type CanvasCreatorStyles = {
  strokeStyle?: string;
  lineWidth?: number;
  fillStyle?: string;
}