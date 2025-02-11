import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator";

// 移动
export const MoveableCreator: Creator = {
  type: CreatorTypes.moveable,
  name: "移动",
  category: CreatorCategories.cursor,
  icon: "icon-verbise-arrow-cursor-2--mouse-select-cursor",
  shortcut: "ctrl+m",
};

// 手型
export const HandCreator: Creator = {
  type: CreatorTypes.hand,
  name: "手型",
  category: CreatorCategories.cursor,
  icon: "icon-verbise-hand",
  shortcut: "ctrl+h",
};

// 矩形
export const RectangleCreator: Creator = {
  type: CreatorTypes.rectangle,
  name: "矩形",
  category: CreatorCategories.shapes,
  icon: "icon-verbise-Rectangle",
};

// 直线
export const LineRectangleCreator: Creator = {
  type: CreatorTypes.line,
  name: "直线",
  category: CreatorCategories.shapes,
  icon: "icon-verbise-line",
};

// 多边形
export const PolygonCreator: Creator = {
  type: CreatorTypes.polygon,
  name: "多边形",
  category: CreatorCategories.shapes,
  icon: "icon-verbise-polygon",
};

// 图片
export const ImageCreator: Creator = {
  type: CreatorTypes.image,
  name: "图片",
  category: CreatorCategories.shapes,
  icon: "icon-verbise-Image",
};

// 线条
export const PenCreator: Creator = {
  type: CreatorTypes.arbitrary,
  name: "线条",
  category: CreatorCategories.freedom,
  icon: "icon-verbise-pen",
};

// 画笔
export const PencilCreator: Creator = {
  type: CreatorTypes.pencil,
  name: "画笔",
  category: CreatorCategories.freedom,
  icon: "icon-verbise-pencil",
};

// 光标工具
export const CursorCreators: Creator[] = [MoveableCreator, HandCreator];

// 形状工具
export const ShapeCreators: Creator[] = [
  RectangleCreator,
  LineRectangleCreator,
  PolygonCreator,
  ImageCreator,
];

// 自由绘制工具
export const FreedomCreators: Creator[] = [PenCreator, PencilCreator];

// 所有工具
export const Creators: Creator[] = [
  MoveableCreator,
  ...CursorCreators,
  RectangleCreator,
  ...ShapeCreators,
  PenCreator,
  ...FreedomCreators,
];
