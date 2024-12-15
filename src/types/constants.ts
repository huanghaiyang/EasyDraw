export const defaults = {
  state: {
    slide: {
      width: 1080,
      height: 1920,
      scale: 1
    },
    shield: {
      width: 1920,
      height: 1080,
    }
  }
}

// 创作工具类型
export enum CreatorTypes {
  moveable = 0,
  rectangle = 1
}

export enum CreatorUsageTypes {
  once = 0,
  forever = 1
}

export enum CreatorCategories {
  cursor = 0,
  shapes = 1,
}

export type Creator = {
  type: CreatorTypes,
  usage: CreatorUsageTypes,
  category: CreatorCategories,
}

export const creators = {
  moveable: {
    type: CreatorTypes.moveable,
    name: '移动',
    usageType: CreatorUsageTypes.forever,
    category: CreatorCategories.cursor,
  },
  rectangle: {
    type: CreatorTypes.rectangle,
    name: '矩形',
    usageType: CreatorUsageTypes.forever,
    category: CreatorCategories.shapes,
  }
}

// 鼠标样式画布尺寸
export const cursorCanvasSize = 24;