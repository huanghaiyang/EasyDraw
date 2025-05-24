export const StageScales = [0.25, 0.5, 1, 2, 3, 4, 5];

// 变换器类型
export enum TransformTypes {
  // 顶点
  vertices,
  // 边框
  border,
}

export enum CursorTypes {
  // 顶点
  vertices,
  // 边框
  border,
  // 手
  hand,
  // 十字
  cross,
  // 移动
  move,
  // 旋转
  rotation,
}

// 舞台自动缩放时的内边距
export const AutoFitPadding = 100;

// 图片批量生成时，各图片之间的间距
export const ImageMargin = 20;
