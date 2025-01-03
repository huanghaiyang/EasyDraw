// 创作工具类型,同时也是组件类型
export enum CreatorTypes {
  moveable = 0,
  rectangle = 1,
  hand = 2,
}

// 创作工具分类
export enum CreatorCategories {
  cursor = 0,
  shapes = 1,
}

// 创作工具
export declare type Creator = {
  type: CreatorTypes,
  name: string,
  category: CreatorCategories,
  icon?: string,
}
