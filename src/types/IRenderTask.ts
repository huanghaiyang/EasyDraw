import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";

// 渲染任务
export interface IRenderTask {
  // 任务id
  id: string;
  // 运行
  run(): Promise<void>;
  // 销毁
  destroy(): Promise<void>;
}

// 辅助画布绘制任务
export interface IMaskTask extends IRenderTask {
  // 数据
  get data(): IMaskModel;
  // 模型
  model: IMaskModel;
}

// 舞台组件绘制任务
export interface IElementTask extends IRenderTask {
  // 组件
  element: IElement;
}
