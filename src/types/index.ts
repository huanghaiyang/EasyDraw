// 尺寸
export type ISize = {
  width: number;
  height: number;
};

// 坐标
export type IPoint = {
  x: number;
  y: number;
};

// 3D坐标
export type IPoint3D = IPoint & {
  z: number;
};

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
};

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
  editing = 3,
}

// 平移值
export type TranslationValue = {
  dx: number;
  dy: number;
};

// 缩放值
export type ScaleValue = {
  // 缩放x
  sx: number;
  // 缩放y
  sy: number;
};

// 舞台通知名称
export enum ShieldDispatcherNames {
  // 组件创建
  elementCreated = "elementCreated",
  // 选中改变
  selectedChanged = "selectedChanged",
  // 目标改变
  targetChanged = "targetChanged",
  // 位置改变
  positionChanged = "positionChanged",
  // 宽度改变
  widthChanged = "widthChanged",
  // 高度改变
  heightChanged = "heightChanged",
  // 角度改变
  angleChanged = "angleChanged",
  // 圆角改变
  cornersChanged = "cornersChanged",
  // x轴翻转改变
  flipXChanged = "flipXChanged",
  // y偏移角度改变
  leanYAngleChanged = "leanYAngleChanged",
  // 比例改变
  scaleChanged = "scaleChanged",
  // 描边改变
  strokesChanged = "strokesChanged",
  // 填充改变
  fillsChanged = "fillsChanged",
  // 字体大小改变
  fontSizeChanged = "fontSizeChanged",
  // 字体改变
  fontFamilyChanged = "fontFamilyChanged",
  // 字体行高改变
  fontLineHeightChanged = "fontLineHeightChanged",
  // 字体间距改变
  fontLetterSpacingChanged = "fontLetterSpacingChanged",
  // 字体颜色改变
  fontColorChanged = "fontColorChanged",
  // 字体颜色透明度改变
  fontColorOpacityChanged = "fontColorOpacityChanged",
  // 字体大小混合
  fontSizeMixinChanged = "fontSizeMixinChanged",
  // 字体混合
  fontFamilyMixinChanged = "fontFamilyMixinChanged",
  // 字体颜色混合
  fontColorMixinChanged = "fontColorMixinChanged",
  // 字体颜色透明度混合
  fontColorOpacityMixinChanged = "fontColorOpacityMixinChanged",
  // 字体间距混合
  fontLetterSpacingMixinChanged = "fontLetterSpacingMixinChanged",
  // 文本对齐改变
  textAlignChanged = "textAlignChanged",
  // 文本基线改变
  textBaselineChanged = "textBaselineChanged",
  // 锁定比例改变
  creatorChanged = "creatorChanged",
  // 锁定比例改变
  ratioLockedChanged = "ratioLockedChanged",
  // 多选状态改变
  multiSelectedChanged = "multiSelectedChanged",
  // 主选中状态改变
  primarySelectedChanged = "primarySelectedChanged",
  // 层移动状态改变
  layerShiftMoveEnableChanged = "layerShiftMoveEnableChanged",
  // 层移动状态改变
  layerGoDownEnableChanged = "layerGoDownEnableChanged",
  // 状态改变
  statusChanged = "statusChanged",
}

// 输入类型
export enum InputCompositionType {
  // 开始
  START,
  // 更新
  UPDATE,
  // 结束
  END,
}

// 键盘事件
export type TextEditingStates = {
  keyCode: number;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  updateId?: string;
  compositionType?: InputCompositionType;
};

// 方位
export enum Direction {
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
}
