import { CreatorTypes } from "@/types/Creator";
import LodashUtils from "@/utils/LodashUtils";

export enum StrokeTypes {
  inside = 0,
  middle = 1,
  outside = 2,
}

// 描边类型对应名称
type StrokeTypePair = {
  type: StrokeTypes;
  name: string;
};

// 描边类型数组
export const StrokeTypesArray: StrokeTypePair[] = [
  {
    type: StrokeTypes.inside,
    name: "内描边",
  },
  {
    type: StrokeTypes.middle,
    name: "平分线宽",
  },
  {
    type: StrokeTypes.outside,
    name: "外描边",
  },
];

// 直线描边类型数组
export const LineStrokeTypes: StrokeTypePair[] = [
  {
    type: StrokeTypes.middle,
    name: "平分线宽",
  },
];

/**
 * 根据画板组件类型获取对应的描边类型数组
 *
 * @param type 画板组件类型
 * @returns 描边类型数组
 */
export function getStokeTypes(type: CreatorTypes): StrokeTypePair[] {
  switch (type) {
    case CreatorTypes.arbitrary:
    case CreatorTypes.rectangle:
    case CreatorTypes.ellipse:
    case CreatorTypes.image: {
      return StrokeTypesArray;
    }
    case CreatorTypes.line: {
      return LineStrokeTypes;
    }
    default:
      return StrokeTypesArray;
  }
}

// 填充样式定义
export type FillStyle = {
  // 填充颜色
  color?: string;
  // 填充颜色透明度
  colorOpacity?: number;
};

// 描边样式定义
export type StrokeStyle = FillStyle & {
  type?: StrokeTypes;
  width: number;
};

export type TextFontStyle = {
  // 字体大小
  fontSize?: number;
  // 字体
  fontFamily?: string;
  // 字体颜色
  fontColor?: string;
  // 字体颜色透明度
  fontColorOpacity?: number;
  // 字体行高
  fontLineHeight?: number;
};

// 字体样式定义
export type FontStyle = TextFontStyle & {
  // 文本对齐方式
  textAlign?: CanvasTextAlign;
  // 文本基线
  textBaseline?: CanvasTextBaseline;
};

// 画板组件样式定义
export type ElementStyles = FontStyle & {
  // 描边
  strokes?: StrokeStyle[];
  // 填充
  fills?: FillStyle[];
};

// 默认描边类型，分为内描边，平分线宽，外描边
export const DefaultStrokeType = StrokeTypes.middle;
// 默认描边颜色
export const DefaultStrokeColor = "#000000";
// 默认描边透明度
export const DefaultStrokeColorOpacity = 1;
// 默认填充颜色
export const DefaultFillColor = "#999999";
// 默认填充透明度
export const DefaultFillColorOpacity = 0.15;
// 默认边框宽度
export const DefaultStrokeWidth = 1;
// 默认字体大小
export const DefaultFontSize = 16;
// 默认字体家族
export const DefaultFontFamily = "Arial";
// 默认字体颜色
export const DefaultFontColor = "#000000";
// 默认字体颜色透明度
export const DefaultFontColorOpacity = 1;
// 默认文本对齐方式
export const DefaultTextAlign = "left";
// 默认文本基线
export const DefaultTextBaseline = "top";
// 默认直线描边宽度
export const DefaultLineStrokeWidth = 1;
// 默认直线描边长度限制
export const DefaultLineMeterLimit = 100;
// 默认字体行高
export const DefaultFontLineHeight = 1.4;

// 默认描边样式
export const DefaultStrokeStyle: StrokeStyle = {
  type: DefaultStrokeType,
  width: DefaultStrokeWidth,
  color: DefaultStrokeColor,
  colorOpacity: DefaultStrokeColorOpacity,
};

// 默认直线描边样式
export const DefaultLineStrokeStyle: StrokeStyle = {
  ...DefaultStrokeStyle,
  width: DefaultLineStrokeWidth,
};

// 默认填充样式
export const DefaultFillStyle: FillStyle = {
  color: DefaultFillColor,
  colorOpacity: DefaultFillColorOpacity,
};

// 默认字体样式
export const DefaultFontStyle: FontStyle = {
  fontSize: DefaultFontSize,
  fontFamily: DefaultFontFamily,
  fontColor: DefaultFontColor,
  fontColorOpacity: DefaultFontColorOpacity,
  fontLineHeight: DefaultFontLineHeight,
  textAlign: DefaultTextAlign,
  textBaseline: DefaultTextBaseline,
};

// 默认组件样式
export const DefaultElementStyle: ElementStyles = {
  strokes: [{ ...DefaultStrokeStyle }],
  fills: [{ ...DefaultFillStyle }],
  ...DefaultFontStyle,
};

/**
 * 获取默认组件样式
 *
 * @param type 组件类型
 * @returns 组件样式
 */
export const getDefaultElementStyle = (type: CreatorTypes): ElementStyles => {
  const style = LodashUtils.jsonClone(DefaultElementStyle);
  if ([CreatorTypes.line, CreatorTypes.arbitrary].includes(type)) {
    style.strokes.forEach(stroke => {
      stroke.width = DefaultLineStrokeWidth;
    });
  }
  if ([CreatorTypes.image, CreatorTypes.arbitrary, CreatorTypes.text].includes(type)) {
    style.fills.forEach(fill => {
      fill.colorOpacity = 0;
    });
  }
  if ([CreatorTypes.text].includes(type)) {
    style.strokes.forEach(stroke => {
      stroke.width = 0;
    });
  }
  return style;
};

export const FontFamilyList = [
  {
    name: "Arial",
    url: "../src/assets/fonts/Arial.ttf",
  },
  {
    name: "Arial bold",
    url: "../src/assets/fonts/Arialbd.ttf",
  },
  {
    name: "Arial bold italic",
    url: "../src/assets/fonts/Arialbi.ttf",
  },
  {
    name: "Arial italic",
    url: "../src/assets/fonts/Ariali.ttf",
  },
  {
    name: "CascadiaCode",
    url: "../src/assets/fonts/CascadiaCode.ttf",
  },
  {
    name: "CascadiaCode italic",
    url: "../src/assets/fonts/CascadiaCodeItalic.ttf",
  },
  {
    name: "CascadiaMono",
    url: "../src/assets/fonts/CascadiaMono.ttf",
  },
  {
    name: "CascadiaMono italic",
    url: "../src/assets/fonts/CascadiaMonoItalic.ttf",
  },
  {
    name: "Comic",
    url: "../src/assets/fonts/Comic.ttf",
  },
  {
    name: "Comic bold",
    url: "../src/assets/fonts/Comicbd.ttf",
  },
  {
    name: "Comic italic",
    url: "../src/assets/fonts/Comici.ttf",
  },
  {
    name: "Comic zero",
    url: "../src/assets/fonts/Comicz.ttf",
  },
  {
    name: "隶书",
    url: "../src/assets/fonts/隶书.ttf",
  },
  {
    name: "楷体",
    url: "../src/assets/fonts/楷体.ttf",
  },
  {
    name: "幼圆",
    url: "../src/assets/fonts/幼圆.ttf",
  },
  {
    name: "华文彩云",
    url: "../src/assets/fonts/华文彩云.ttf",
  },
  {
    name: "华文隶书",
    url: "../src/assets/fonts/华文隶书.ttf",
  },
  {
    name: "华文行楷",
    url: "../src/assets/fonts/华文行楷.ttf",
  },
  {
    name: "华文细黑",
    url: "../src/assets/fonts/华文细黑.ttf",
  },
  {
    name: "华文琥珀",
    url: "../src/assets/fonts/华文琥珀.ttf",
  },
  {
    name: "华文楷体",
    url: "../src/assets/fonts/华文楷体.ttf",
  },
  {
    name: "华文新魏",
    url: "../src/assets/fonts/华文新魏.ttf",
  },
  {
    name: "华文宋体",
    url: "../src/assets/fonts/华文宋体.ttf",
  },
  {
    name: "华文仿宋",
    url: "../src/assets/fonts/华文仿宋.ttf",
  },
  {
    name: "华文中宋",
    url: "../src/assets/fonts/华文中宋.ttf",
  },
];

// 字体大小列表
export const FontSizeList = [
  { name: "12", value: 12 },
  { name: "14", value: 14 },
  { name: "16", value: 16 },
  { name: "18", value: 18 },
  { name: "20", value: 20 },
  { name: "24", value: 24 },
  { name: "28", value: 28 },
  { name: "32", value: 32 },
  { name: "36", value: 36 },
  { name: "40", value: 40 },
  { name: "48", value: 48 },
  { name: "56", value: 56 },
  { name: "64", value: 64 },
  { name: "72", value: 72 },
  { name: "80", value: 80 },
  { name: "96", value: 96 },
];
