import { ISize } from "@/types/index";

// 画板画布
export default interface IStageCanvas {
  canvas: HTMLCanvasElement;
  initCanvas(): HTMLCanvasElement;
  updateCanvasSize(size: ISize): void;
  clearCanvas(): void;
}