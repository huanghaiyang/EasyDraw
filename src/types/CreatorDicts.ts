import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator"

export const MoveableCreator: Creator = {
  type: CreatorTypes.moveable,
  name: '移动',
  category: CreatorCategories.cursor,
  icon: 'icon-verbise-arrow-cursor-2--mouse-select-cursor',
}

export const HandCreator: Creator = {
  type: CreatorTypes.hand,
  name: '手型',
  category: CreatorCategories.cursor,
  icon: 'icon-verbise-hand',
}

export const RectangleCreator: Creator = {
  type: CreatorTypes.rectangle,
  name: '矩形',
  category: CreatorCategories.shapes,
  icon: 'icon-verbise-Rectangle',
}

export const LineRectangleCreator: Creator = {
  type: CreatorTypes.line,
  name: '直线',
  category: CreatorCategories.shapes,
  icon: 'icon-verbise-line',
}

export const PolygonCreator: Creator = {
  type: CreatorTypes.polygon,
  name: '多边形',
  category: CreatorCategories.shapes,
  icon: 'icon-verbise-polygon',
}

export const ImageCreator: Creator = {
  type: CreatorTypes.image,
  name: '图片',
  category: CreatorCategories.shapes,
  icon: 'icon-verbise-Image',
}

export const PenCreator: Creator = {
  type: CreatorTypes.pen,
  name: '线条',
  category: CreatorCategories.arbitrary,
  icon: 'icon-verbise-pen',
}

export const PencilCreator: Creator = {
  type: CreatorTypes.pencil,
  name: '画笔',
  category: CreatorCategories.arbitrary,
  icon: 'icon-verbise-pencil',
}

export const CursorCreators: Creator[] = [
  MoveableCreator,
  HandCreator
]

export const ShapeCreators: Creator[] = [
  RectangleCreator,
  LineRectangleCreator,
  PolygonCreator,
  ImageCreator
]

export const ArbitraryCreators: Creator[] = [
  PenCreator,
  PencilCreator
]

export const Creators: Creator[] = [
  MoveableCreator,
  ...CursorCreators,
  RectangleCreator,
  ...ShapeCreators,
  PenCreator,
  ...ArbitraryCreators,
]