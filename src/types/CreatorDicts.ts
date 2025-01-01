import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator"

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
  cursor: 'none'
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