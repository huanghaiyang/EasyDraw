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

export declare type ISize = {
  width: number;
  height: number;
}

export declare type IPoint = {
  x: number;
  y: number;
}

export declare type IPoint3D = IPoint & {
  z: number;
}

export declare interface IRect {
  size: ISize;
  position?: IPoint;
}

// 舞台画板
export declare interface IStageShield extends IRect {
}

// 舞台容器
export declare interface IStageContainer extends IRect {
  el: HTMLDivElement;
}

export declare type StageInitParams = {
  containerEl?: HTMLDivElement;
  shieldEl?: HTMLDivElement;
  stageEl?: HTMLDivElement;
}

export declare interface StageShieldInstance {
  init: () => Promise<void>;
}

export declare type ElementObject = {
  id: string;
  points: IPoint[];
  type: CreatorTypes;
  data: any;
}

export declare interface IStageElement extends ElementObject {
  isSelected: boolean;
  isVisible: boolean;
  isEditing: boolean;
  isLocked: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isDragging: boolean;
}

export declare type Creator = {
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