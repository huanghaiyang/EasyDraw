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

declare interface IStageSlide {
  size: ISize;
  position: IPoint;
  scale: number;
}

declare interface IStageShield {
  size: ISize;
}

declare interface ICanvas {
  canvas: HTMLCanvasElement;
}