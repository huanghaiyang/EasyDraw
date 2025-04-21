import { Creator, CreatorCategories, CreatorTypes } from "@/types/Creator";

// 工具图标
export const CreatorIcons = {
  [CreatorTypes.moveable]: "icon-verbise-arrow-cursor-2--mouse-select-cursor",
  [CreatorTypes.hand]: "icon-verbise-hand",
  [CreatorTypes.rectangle]: "icon-verbise-Rectangle",
  [CreatorTypes.line]: "icon-verbise-line",
  [CreatorTypes.polygon]: "icon-verbise-polygon",
  [CreatorTypes.image]: "icon-verbise-Image",
  [CreatorTypes.arbitrary]: "icon-verbise-pen",
  [CreatorTypes.pencil]: "icon-verbise-pencil",
  [CreatorTypes.ellipse]: "icon-verbise-eclipse",
  [CreatorTypes.text]: "icon-verbise-text",
  [CreatorTypes.group]: "icon-verbise-group",
};

// 移动
export const MoveableCreator: Creator = {
  type: CreatorTypes.moveable,
  name: "移动",
  category: CreatorCategories.cursor,
  icon: CreatorIcons.moveable,
  shortcut: "ctrl+m",
};

// 手型
export const HandCreator: Creator = {
  type: CreatorTypes.hand,
  name: "手型",
  category: CreatorCategories.cursor,
  icon: CreatorIcons.hand,
  shortcut: "ctrl+h",
};

// 矩形
export const RectangleCreator: Creator = {
  type: CreatorTypes.rectangle,
  name: "矩形",
  category: CreatorCategories.shapes,
  icon: CreatorIcons.rectangle,
};

// 直线
export const LineRectangleCreator: Creator = {
  type: CreatorTypes.line,
  name: "直线",
  category: CreatorCategories.shapes,
  icon: CreatorIcons.line,
};

// 多边形
export const PolygonCreator: Creator = {
  type: CreatorTypes.polygon,
  name: "多边形",
  category: CreatorCategories.shapes,
  icon: CreatorIcons.polygon,
};

// 图片
export const ImageCreator: Creator = {
  type: CreatorTypes.image,
  name: "图片",
  category: CreatorCategories.shapes,
  icon: CreatorIcons.image,
};

// 线条
export const PenCreator: Creator = {
  type: CreatorTypes.arbitrary,
  name: "线条",
  category: CreatorCategories.freedom,
  icon: CreatorIcons.arbitrary,
};

// 画笔
export const PencilCreator: Creator = {
  type: CreatorTypes.pencil,
  name: "画笔",
  category: CreatorCategories.freedom,
  icon: CreatorIcons.pencil,
};

// 椭圆
export const EllipseCreator: Creator = {
  type: CreatorTypes.ellipse,
  name: "椭圆",
  category: CreatorCategories.shapes,
  icon: CreatorIcons.ellipse,
};

// 文本
export const TextCreator: Creator = {
  type: CreatorTypes.text,
  name: "文本",
  category: CreatorCategories.text,
  icon: CreatorIcons.text,
};

// 光标工具
export const CursorCreators: Creator[] = [MoveableCreator, HandCreator];

// 形状工具
export const ShapeCreators: Creator[] = [RectangleCreator, LineRectangleCreator, EllipseCreator, PolygonCreator, ImageCreator];

// 自由绘制工具
export const FreedomCreators: Creator[] = [PenCreator, PencilCreator];

// 所有工具
export const Creators: Creator[] = [MoveableCreator, ...CursorCreators, RectangleCreator, ...ShapeCreators, PenCreator, ...FreedomCreators, TextCreator];
