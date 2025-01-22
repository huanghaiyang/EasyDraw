// 尺寸
export type ISize = {
  width: number;
  height: number;
}

// 坐标
export type IPoint = {
  x: number;
  y: number;
}

// 3D坐标
export type IPoint3D = IPoint & {
  z: number;
}

// 辅助画布绘制任务类型
export enum DrawerMaskModelTypes {
  // 路径
  path,
  // 变换器
  transformer,
  // 光标
  cursor,
  // 光标位置
  cursorPosition,
  // 选择
  selection,
  // 旋转
  rotate,
  // 指示器
  indicator,
  // 范围
  range,
}

// 舞台初始化参数
export type StageInitParams = {
  // 容器
  containerEl?: HTMLDivElement;
  // 盾牌
  shieldEl?: HTMLDivElement;
}

// 舞台实例
export interface StageShieldInstance {
  // 初始化
  init: () => Promise<void>;
}

// 舞台组件状态
export enum ElementStatus {
  // 初始化
  initialed = -1,
  // 开始创建
  startCreating = 0,
  // 创建中
  creating = 1,
  // 完成
  finished = 2,
  // 编辑
  editing = 3
}

// 平移值
export type TranslationValue = {
  dx: number;
  dy: number;
}

// 缩放值
export type ScaleValue = {
  // 缩放x
  sx: number;
  // 缩放y
  sy: number
}

// 舞台通知名称
export enum ShieldDispatcherNames {
  // 元素创建
  elementCreated,
  // 选中改变
  selectedChanged,
  // 目标改变
  targetChanged,
  // 位置改变
  positionChanged,
  // 宽度改变
  widthChanged,
  // 高度改变
  heightChanged,
  // 角度改变
  angleChanged,
  // 比例改变
  scaleChanged,
  // 描边颜色改变
  strokeColorChanged,
  // 描边颜色透明度改变
  strokeColorOpacityChanged,
  // 描边宽度改变
  strokeWidthChanged,
  // 描边类型改变
  strokeTypeChanged,
  // 填充颜色改变
  fillColorChanged,
  // 填充颜色透明度改变
  fillColorOpacityChanged,
  // 字体大小改变
  fontSizeChanged,
  // 字体改变
  fontFamilyChanged,
  // 文本对齐改变
  textAlignChanged,
  // 文本基线改变
  textBaselineChanged,
  // 锁定比例改变
  creatorChanged,
}