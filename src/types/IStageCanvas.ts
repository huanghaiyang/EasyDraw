import { ISize } from "@/types/index";

// 画板画布
export default interface IStageCanvas {
  // 画布
  canvas: HTMLCanvasElement;
  // 初始化画布
  initCanvas(): HTMLCanvasElement;
  // 更新画布大小
  updateCanvasSize(size: ISize): void;
  // 清除画布
  clearCanvas(): void;
}