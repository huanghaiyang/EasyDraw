// 创作工具类型,同时也是组件类型
export enum CreatorTypes {
  // 移动
  moveable = "moveable",
  // 手
  hand = "hand",

  // 矩形
  rectangle = "rectangle",
  // 线段
  line = "line",
  // 图片
  image = "image",
  // 多边形
  polygon = "polygon",
  // 任意
  arbitrary = "arbitrary",
  // 铅笔
  pencil = "pencil",
  // 文本
  text = "text",
  // 组合
  group = "group",
  // 圆
  circle = "circle",
}

// 创作工具分类
export enum CreatorCategories {
  // 光标
  cursor = "cursor",
  // 形状
  shapes = "shapes",
  // 自由绘制
  freedom = "freedom",
}

// 创作工具
export declare type Creator = {
  // 工具类型
  type: CreatorTypes;
  // 工具名称
  name: string;
  // 工具分类
  category: CreatorCategories;
  // 工具图标
  icon?: string;
  // 工具快捷键
  shortcut?: string;
};
