import { CreatorCategories, CreatorTypes, CreatorUsageTypes } from "@/types/index";

export const StageDefaults = {
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

// 世界尺寸
export const WorldSize = {
  width: 1024 * 1024,
  height: 1024 * 1024
}

export const Creators = {
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
export const CursorCanvasSize = 24;
export const MinCursorMoveXDistance = 2;
export const MinCursorMoveYDistance = 2;
export const DefaultCreatorStrokeColor = 'rgba(0, 0, 0, 0.15)';
export const DefaultCreatorFillColor = 'rgba(0, 0, 0, 0.35)';
export const DefaultCreatorStrokeWidth = 1;
export const DefaultSelectionStrokeColor = '#0c8ce9';
export const DefaultSelectionFillColor = 'rgba(0, 0, 0, 0';
export const DefaultSelectionStrokeWidth = 1;
export const DefaultSelectionHandlerStrokeColor = '#0c8ce9';
export const DefaultSelectionHandlerFillColor = 'rgba(255,255,255,1)';
export const DefaultSelectionHandlerStrokeWidth = 1;
export const DefaultSelectionHandlerSize = 4;