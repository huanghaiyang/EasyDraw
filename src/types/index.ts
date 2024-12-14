declare type ISize = {
  width: number;
  height: number;
}

declare type IPoint = {
  x: number;
  y: number;
}

declare type IPoint2D = IPoint & {
  z: number;
}

declare type IPoint3D = IPoint2D & {
  w: number;
}

declare interface IRect {
  size: ISize;
  position: IPoint;
}

// 组件画板
declare interface IStageSlide extends IRect {
  scale: number;
}

// 舞台画板
declare interface IStageShield extends IRect {
}

// 舞台容器
declare interface IStageContainer extends IRect {
  el: HTMLDivElement;
}

declare interface ICanvas {
  canvas: HTMLCanvasElement;
}

declare type StageInitParams = {
  containerEl?: HTMLDivElement;
  shieldEl?: HTMLDivElement;
  stageEl?: HTMLDivElement;
}

interface StageShieldInstance {
  init: () => Promise<void>;
}