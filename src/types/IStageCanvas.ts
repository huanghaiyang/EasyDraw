import { ISize } from "@/types/index";

// 画板画布
export default interface IStageCanvas {
  // 画布
  node: HTMLCanvasElement | HTMLDivElement;
  // 初始化画布
  initNode(): HTMLCanvasElement | HTMLDivElement;
  // 更新画布大小
  updateSize(size: ISize): void;
  // 清除画布
  clear(): void;
  // 初始化样式
  initStyle(): void;
}
