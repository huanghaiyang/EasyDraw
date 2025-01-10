import { IRenderTask } from "@/types/IRenderTask";

// 渲染器
export interface IQueueRender {
  renderQueue: IRenderQueue;
  renderCargo(cargo: IRenderTaskCargo): Promise<void>;
}

// 渲染任务函数
export interface ITaskFunc {
  (): Promise<boolean | void>;
}

// 批次渲染任务
export interface IRenderTaskCargo extends IRenderTask {
  tasks: IRenderTask[];
  running: boolean;
  prepend(task: IRenderTask): void;
  add(task: IRenderTask): void;
  addAll(tasks: IRenderTask[]): void;
  isEmpty(): boolean;
}

// 渲染队列
export interface IRenderQueue {
  running: boolean;
  queue: IRenderTask[];
  add(task: IRenderTask): Promise<void>;
  run(): Promise<void>;
  destroy(): Promise<void>;
}

export type RenderParams = { angle: number, flipX: boolean, flipY: boolean }
export const DefaultRenderParams: RenderParams = { angle: 0, flipX: false, flipY: false };