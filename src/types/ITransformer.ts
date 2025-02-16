import { IPointController, ISegmentController } from "@/types/IController";

// 变换器类型
export enum TransformerTypes {
  // 矩形
  rect,
  // 圆形
  circle,
}

// 顶点变换器
export interface IVerticesTransformer extends IPointController {}

// 边框变换器
export interface IBorderTransformer extends ISegmentController {
  // 索引
  index: number;
}
