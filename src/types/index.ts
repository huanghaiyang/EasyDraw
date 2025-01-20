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
  path,
  transformer,
  cursor,
  cursorPosition,
  selection,
  rotate,
  indicator,
  range,
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

// 舞台组件状态
export enum ElementStatus {
  initialed = -1,
  startCreating = 0,
  creating = 1,
  finished = 2,
  editing = 3
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
  elementCreated,
  selectedChanged,
  targetChanged,
  positionChanged,
  widthChanged,
  heightChanged,
  angleChanged,
  scaleChanged,
  strokeColorChanged,
  strokeColorOpacityChanged,
  strokeWidthChanged,
  strokeTypeChanged,
  fillColorChanged,
  fillColorOpacityChanged,
  fontSizeChanged,
  fontFamilyChanged,
  textAlignChanged,
  textBaselineChanged,
  ratioLockedChanged,
}