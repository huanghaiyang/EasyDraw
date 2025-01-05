// 创作工具类型,同时也是组件类型
export enum CreatorTypes {
  moveable = 'moveable',
  rectangle = 'rectangle',
  hand = 'hand',
  line = 'line',
}

// 创作工具分类
export enum CreatorCategories {
  cursor = 'cursor',
  shapes = 'shapes',
}

// 创作工具
export declare type Creator = {
  type: CreatorTypes,
  name: string,
  category: CreatorCategories,
  icon?: string,
}
