import { IRenderTask } from "@/types/IRenderTask";
import { AngleModel } from "@/types/IElement";
import { IPoint } from "@/types/index";

// 渲染器
export interface IQueueRender {
  // 渲染队列
  renderQueue: IRenderQueue;
  // 渲染任务
  renderCargo(cargo: IRenderTaskCargo): Promise<void>;
}

// 渲染任务函数
export interface ITaskFunc {
  (): Promise<boolean | void>;
}

// 批次渲染任务
export interface IRenderTaskCargo extends IRenderTask {
  // 任务
  tasks: IRenderTask[];
  // 是否正在运行
  running: boolean;
  // 前置任务
  prepend(task: IRenderTask): void;
  // 添加任务
  add(task: IRenderTask): void;
  // 添加任务
  addAll(tasks: IRenderTask[]): void;
  // 是否为空
  isEmpty(): boolean;
}

// 渲染队列
export interface IRenderQueue {
  // 是否正在运行
  running: boolean;
  // 任务队列
  queue: IRenderTask[];
  // 添加任务
  add(task: IRenderTask): Promise<void>;
  // 运行
  run(): Promise<void>;
  // 销毁
  destroy(): Promise<void>;
  // 等待结束运行
  wait(): Promise<void>;
}

// 渲染参数
export type RenderParams = AngleModel & {
  // 角度
  angle?: number;
  // 是否翻转x
  flipX?: boolean;
  // 是否翻转y
  flipY?: boolean;
  // 是否闭合
  isFold?: boolean;
  // 是否计算顶点
  calcVertices?: boolean;
  // 斜接限制
  miterLimit?: number;
  // 倾斜y
  leanY?: number;
  // 裁剪曲线点
  clipArcPoints?: ArcPoints[];
};

// 曲线点
export type ArcPoints = {
  start: IPoint;
  controller: IPoint;
  end: IPoint;
  value: number;
  corner?: IPoint;
};

/**
 * 用于渲染的父盒模型
 *
 * 通常用于以下场景：
 *
 * 1. 将一个较小的图片渲染到一个较大的盒子的指定位置，例如渲染文本的光标到文本内部，由于文本存在旋转、翻转或者倾斜，则需要将光标相对于文本组件中心点进行渲染
 */
export type DestinationRect = {
  desX: number;
  desY: number;
  desWidth: number;
  desHeight: number;
};

export type RenderRect = Partial<DOMRect> & DestinationRect;
