import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";
import { TextSelectionCursorType } from "@/types/IText";

// 渲染任务
export interface IRenderTask {
  // 任务id
  id?: string;
  // 运行
  run(): Promise<void>;
  // 销毁
  destroy?(): Promise<void>;
}

// 辅助画布绘制任务
export interface IMaskTask extends IRenderTask {
  // 模型
  model: IMaskModel;
}

// 舞台组件绘制任务
export interface IElementTask extends IRenderTask {
  // 组件
  element: IElement;
}

// 带光标位置的舞台组件绘制任务
export interface IElementTaskCursor extends IElementTask {}

// 文本选区绘制任务
export interface IElementTaskTextSelection extends IElementTask {}

// 文本选区光标绘制任务
export interface IElementTaskTextSelectionCursor extends IElementTask {
  cursorType: TextSelectionCursorType;
}
