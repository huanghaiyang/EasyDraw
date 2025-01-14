import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";

// 渲染任务
export interface IRenderTask {
  id: string;
  run(): Promise<void>;
  destroy(): Promise<void>;
}

// 辅助画布绘制任务
export interface IMaskTask extends IRenderTask {
  get data(): IMaskModel;
  model: IMaskModel;
}

// 舞台元素绘制任务
export interface IElementTask extends IRenderTask {
  element: IElement;
}