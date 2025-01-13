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

// 辅助画布选区绘制任务
export interface IMaskSelection extends IMaskTask { }

// 辅助画布选区控制器绘制任务
export interface IMaskTransformer extends IMaskTask { }

// 辅助画布圆形绘制任务
export interface IMaskCircleTransformer extends IMaskTransformer { }

// 辅助画布光标绘制任务
export interface IMaskCursor extends IMaskTask { }

// 光标位置绘制任务
export interface IMaskCursorPosition extends IMaskTask { }

// 组件旋转图标绘制
export interface IMaskRotate extends IMaskTask { }

// 组件旋转控制器光标绘制任务
export interface IMaskTransformerCursor extends IMaskTask { }

// 辅助画布清除绘制任务
export interface IMaskClear extends IMaskTask { }

// 用于显示组件尺寸
export interface IMaskSizeIndicator extends IMaskTask { }

// 舞台元素绘制任务
export interface IElementTask extends IRenderTask {
  element: IElement;
}

// 舞台元素绘制任务-矩形
export interface IElementTaskRect extends IElementTask { }

// 舞台元素绘制任务-图片
export interface IElementTaskImage extends IElementTask { }

// 舞台元素绘制任务-圆形
export interface IElementTaskCircle extends IElementTask { }

// 舞台元素清除绘制任务
export interface IElementTaskClear extends IElementTask { }

// 舞台元素绘制任务-线段
export interface IElementTaskLine extends IElementTask { }

// 舞台元素绘制任务-自由线段
export interface IElementTaskArbitrary extends IElementTask { }