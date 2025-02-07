import { IQueueRender } from "@/types/IRender";

// 舞台渲染器
export interface IStageRenderer {
  // 重绘
  redraw(force?: boolean): Promise<void>;
  // 清除
  clear(): void;
}

// 辅助画布绘制器
export interface IMaskRenderer extends IStageRenderer, IQueueRender {}

// 临时画布绘制器
export interface IProvisionalRenderer extends IStageRenderer, IQueueRender {}

// 主画布绘制器
export interface IShieldRenderer extends IStageRenderer, IQueueRender {}
