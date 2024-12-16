import { CreatorCategories, CreatorTypes, CreatorUsageTypes } from "@/types/index";

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

// 世界尺寸
export const worldSize = {
  width: 1024 * 1024,
  height: 1024 * 1024
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
    usageType: CreatorUsageTypes.once,
    category: CreatorCategories.shapes,
  }
}

// 鼠标样式画布尺寸
export const cursorCanvasSize = 24;
export const minCursorMoveXDistance = 2;
export const minCursorMoveYDistance = 2;
export const defaultCreatorStrokeColor = 'rgba(255, 255, 255, 0.5)';
export const defaultCreatorFillColor = 'rgba(255, 255, 255, 0)';
export const defaultCreatorStrokeWidth = 1;