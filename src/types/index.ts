import { EventEmitter } from "events";

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

// 舞台初始化参数
export type StageInitParams = {
  containerEl?: HTMLDivElement;
  shieldEl?: HTMLDivElement;
}

// 舞台实例
export interface StageShieldInstance {
  init: () => Promise<void>;
}

// 舞台组件状态
export enum ElementStatus {
  initialed = -1,
  startCreating = 0,
  creating = 1,
  finished = 2
}

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