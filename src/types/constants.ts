import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator"

export const StageDefaults = {
  slide: {
    width: 1080,
    height: 1920,
    scale: 1
  },
}

// 世界尺寸
export const WorldSize = {
  width: 1024 * 1024,
  height: 1024 * 1024
}

export const MoveableCreator: Creator = {
  type: CreatorTypes.moveable,
  name: '移动',
  category: CreatorCategories.cursor,
  icon: 'icon-verbise-arrow-cursor-2--mouse-select-cursor',
  cursor: 'default'
}

export const HandCreator: Creator = {
  type: CreatorTypes.hand,
  name: '手型',
  category: CreatorCategories.cursor,
  icon: 'icon-verbise-hand',
  cursor: 'grab'
}

export const RectangleCreator: Creator = {
  type: CreatorTypes.rectangle,
  name: '矩形',
  category: CreatorCategories.shapes,
  icon: 'icon-verbise-Rectangle',
  cursor: 'crosshair'
}

export const CursorCreators: Creator[] = [
  MoveableCreator,
  HandCreator
]

export const Creators: Creator[] = [
  MoveableCreator,
  ...CursorCreators,
  RectangleCreator
]

// 鼠标样式画布尺寸
export const CursorCanvasSize = 24;
export const MinCursorMoveXDistance = 2;
export const MinCursorMoveYDistance = 2;
export const DefaultCreatorStrokeColor = 'rgba(0, 0, 0, 0.05)';
export const DefaultCreatorFillColor = 'rgba(0, 0, 0, 0.065)';
export const DefaultCreatorStrokeWidth = 1;
export const DefaultSelectionStrokeColor = '#0c8ce9';
export const DefaultSelectionFillColor = 'rgba(0, 0, 0, 0)';
export const DefaultSelectionStrokeWidth = 1;
export const DefaultSizeTransformerStrokeColor = '#0c8ce9';
export const DefaultSizeTransformerFillColor = 'rgba(255,255,255,1)';
export const DefaultSizeTransformerStrokeWidth = 1;
export const DefaultSizeTransformerValue = 6;
export const DefaultSelectionRotateSize = 18;
export const DefaultSelectionRotateDistance = 18;

// 尺寸指示器
export const DefaultSelectionSizeIndicatorStrokeColor = '#0c8ce9';
export const DefaultSelectionSizeIndicatorFillColor = '#0c8ce9';
export const DefaultSelectionSizeIndicatorStrokeWidth = 0;
export const DefaultSelectionSizeIndicatorDistance = 10;
export const DefaultSelectionSizeIndicatorTextColor = '#000';
export const DefaultSelectionSizeIndicatorFontSize = 12;
export const DefaultSelectionSizeIndicatorFontFamily = 'Arial';