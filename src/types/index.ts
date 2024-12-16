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

export interface IRect {
  size: ISize;
  position?: IPoint;
}

// 舞台画板
export interface IStageShield extends IRect {
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
}

export interface IStageElement {
  id: string;
  obj: ElementObject;
  isSelected: boolean;
  isVisible: boolean;
  isEditing: boolean;
  isLocked: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isDragging: boolean;
  status: ElementCreateStatus;
  init(): Promise<void>;
}

export type Creator = {
  type: CreatorTypes,
  usage: CreatorUsageTypes,
  category: CreatorCategories,
}

// 画板鼠标按下时的用途
export enum shieldMouseDownUsage {
  move = 0,
  resize = 1,
  select = 2,
  drag = 3
}

export interface IStagePersister {
  elementList: IStageElement[];
  createObject(type: CreatorTypes, points: IPoint[], data?: any): ElementObject;
  createElement(obj: ElementObject): IStageElement;
  addElement(element: IStageElement): void;
  removeElement(id: string): void;
  updateElementObj(id: string, data: ElementObject): void;
}

export enum ElementCreateStatus {
  starting = 0,
  doing = 1,
  finished = 2
}