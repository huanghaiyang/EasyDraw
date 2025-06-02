import { CreatorTypes } from "@/types/Creator";
import LodashUtils from "@/utils/LodashUtils";
import { range } from "lodash";

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
  width?: number;
};

// 文本垂直对齐方式
export enum TextVerticalAlign {
  top = "top",
  middle = "middle",
  bottom = "bottom",
}

// 文本装饰类型
export enum TextDecoration {
  none = "none",
  lineThrough = "line-through",
  overline = "overline",
  underline = "underline",
}

// 字体样式
export enum FontStyler {
  normal = "normal",
  italic = "italic",
  bold = "bold",
  boldItalic = "bold italic",
}

// 文本大小写类型
export enum TextCase {
  none = "none",
  uppercase = "uppercase",
  lowercase = "lowercase",
  capitalize = "capitalize",
}

// 文本字体样式定义
export type TextFontStyle = {
  fontStyler?: FontStyler;
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
  // 字体行高字号倍数
  fontLineHeightFactor?: number;
  // 字体行高自动适应
  fontLineHeightAutoFit?: boolean;
  // 字体间距
  fontLetterSpacing?: number;
  // 文本装饰
  textDecoration?: TextDecoration;
  // 文本装饰颜色
  textDecorationColor?: string;
  // 文本装饰透明度
  textDecorationOpacity?: number;
  // 文本装饰厚度
  textDecorationThickness?: number;
  // 段落间距
  paragraphSpacing?: number;
  // 文本大小写
  textCase?: TextCase;
};

// 字体样式定义
export type FontStyle = TextFontStyle & {
  // 文本对齐方式
  textAlign?: CanvasTextAlign;
  // 文本基线
  textBaseline?: CanvasTextBaseline;
  // 文本基线
  textVerticalAlign?: TextVerticalAlign;
};

// 画板组件样式定义
export type ElementStyles = FontStyle & {
  // 描边
  strokes?: StrokeStyle[];
  // 填充
  fills?: FillStyle[];
  // 文本
  text?: StrokeStyle[];
};

// 默认描边类型，分为内描边，平分线宽，外描边
export const DefaultStrokeType = StrokeTypes.middle;
// 默认描边颜色
export const DefaultStrokeColor = "#000000";
// 默认描边透明度
export const DefaultStrokeColorOpacity = 100;
// 默认填充颜色
export const DefaultFillColor = "#999999";
// 默认填充透明度
export const DefaultFillColorOpacity = 15;
// 默认边框宽度
export const DefaultStrokeWidth = 1;
// 默认文字样式
export const DefaultFontStyler = FontStyler.normal;
// 默认字体大小
export const DefaultFontSize = 16;
// 默认字体家族
export const DefaultFontFamily = "华文细黑";
// 默认字体颜色
export const DefaultFontColor = "#000000";
// 默认字体颜色透明度
export const DefaultFontColorOpacity = 100;
// 默认文本对齐方式
export const DefaultTextAlign = "left";
// 默认文本基线
export const DefaultTextBaseline = "top";
// 默认文本垂直对齐方式
export const DefaultTextVerticalAlign = TextVerticalAlign.top;
// 默认直线描边宽度
export const DefaultLineStrokeWidth = 1;
// 默认直线描边长度限制
export const DefaultLineMeterLimit = 100;
// 默认字体行高倍数
export const DefaultFontLineHeightFactor = 1.4;
// 默认字体行高自动适应
export const DefaultFontLineHeightAutoFit = true;
// 默认字体行高
export const DefaultFontLineHeight = DefaultFontSize * DefaultFontLineHeightFactor;
// 默认字体间距
export const DefaultFontLetterSpacing = 0;
// 默认文本装饰
export const DefaultTextDecoration = TextDecoration.none;
// 默认文本装饰颜色
export const DefaultTextDecorationColor = "#000000";
// 默认文本装饰透明度
export const DefaultTextDecorationOpacity = 100;
// 默认文本装饰粗细
export const DefaultTextDecorationThickness = 1;
// 默认段落间距
export const DefaultParagraphSpacing = 0;
// 默认文本大小写
export const DefaultTextCase = TextCase.none;

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
  fontStyler: DefaultFontStyler,
  fontSize: DefaultFontSize,
  fontFamily: DefaultFontFamily,
  fontColor: DefaultFontColor,
  fontColorOpacity: DefaultFontColorOpacity,
  fontLineHeight: DefaultFontLineHeight,
  fontLineHeightFactor: DefaultFontLineHeightFactor,
  fontLineHeightAutoFit: DefaultFontLineHeightAutoFit,
  textAlign: DefaultTextAlign,
  textBaseline: DefaultTextBaseline,
  textVerticalAlign: DefaultTextVerticalAlign,
  fontLetterSpacing: DefaultFontLetterSpacing,
  textDecoration: DefaultTextDecoration,
  textDecorationColor: DefaultTextDecorationColor,
  textDecorationOpacity: DefaultTextDecorationOpacity,
  textDecorationThickness: DefaultTextDecorationThickness,
  paragraphSpacing: DefaultParagraphSpacing,
  textCase: DefaultTextCase,
};

// 默认组件样式
export const DefaultElementStyle: ElementStyles = {
  strokes: [{ ...DefaultStrokeStyle }],
  fills: [{ ...DefaultFillStyle }],
  ...DefaultFontStyle,
};

// 可用于计算文本尺寸的样式属性
export const FontStylePropsForMeasureText = ["fontSize", "fontFamily"];

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
    url: "@/assets/fonts/Arial.ttf",
  },
  {
    name: "Arial bold",
    url: "@/assets/fonts/Arialbd.ttf",
  },
  {
    name: "Arial bold italic",
    url: "@/assets/fonts/Arialbi.ttf",
  },
  {
    name: "Arial italic",
    url: "@/assets/fonts/Ariali.ttf",
  },
  {
    name: "CascadiaCode",
    url: "@/assets/fonts/CascadiaCode.ttf",
  },
  {
    name: "CascadiaCode italic",
    url: "@/assets/fonts/CascadiaCodeItalic.ttf",
  },
  {
    name: "CascadiaMono",
    url: "@/assets/fonts/CascadiaMono.ttf",
  },
  {
    name: "CascadiaMono italic",
    url: "@/assets/fonts/CascadiaMonoItalic.ttf",
  },
  {
    name: "Comic",
    url: "@/assets/fonts/Comic.ttf",
  },
  {
    name: "Comic bold",
    url: "@/assets/fonts/Comicbd.ttf",
  },
  {
    name: "Comic italic",
    url: "@/assets/fonts/Comici.ttf",
  },
  {
    name: "Comic zero",
    url: "@/assets/fonts/Comicz.ttf",
  },
  {
    name: "隶书",
    url: "@/assets/fonts/隶书.ttf",
  },
  {
    name: "楷体",
    url: "@/assets/fonts/楷体.ttf",
  },
  {
    name: "幼圆",
    url: "@/assets/fonts/幼圆.ttf",
  },
  {
    name: "华文彩云",
    url: "@/assets/fonts/华文彩云.ttf",
  },
  {
    name: "华文隶书",
    url: "@/assets/fonts/华文隶书.ttf",
  },
  {
    name: "华文行楷",
    url: "@/assets/fonts/华文行楷.ttf",
  },
  {
    name: "华文细黑",
    url: "@/assets/fonts/华文细黑.ttf",
  },
  {
    name: "华文琥珀",
    url: "@/assets/fonts/华文琥珀.ttf",
  },
  {
    name: "华文楷体",
    url: "@/assets/fonts/华文楷体.ttf",
  },
  {
    name: "华文新魏",
    url: "@/assets/fonts/华文新魏.ttf",
  },
  {
    name: "华文宋体",
    url: "@/assets/fonts/华文宋体.ttf",
  },
  {
    name: "华文仿宋",
    url: "@/assets/fonts/华文仿宋.ttf",
  },
  {
    name: "华文中宋",
    url: "@/assets/fonts/华文中宋.ttf",
  },
];

// 字体大小列表
export const FontSizeList = range(12, 121, 2).map(i => ({ name: i.toString(), value: i }));

// 字体行高列表
export const FontLineHeightList = range(12, 121, 2).map(i => ({ name: i.toString(), value: i }));

// 字体间距列表
export const FontLetterSpacingList = range(0, 101, 1).map(i => ({ name: i.toString(), value: i }));

// 段落间距列表
export const ParagraphSpacingList = range(0, 101, 4).map(i => ({ name: i.toString(), value: i }));

// 字体行高倍数列表
export const FontLineHeightFactorList = range(1, 2.1, 0.1).map(i => {
  i = Math.round(i * 10) / 10;
  return { name: i.toString(), value: i };
});

// 字体样式集合
export type FontStyleSet = {
  fontStylers?: Set<FontStyler>;
  fontFamilies?: Set<string>;
  fontSizes?: Set<number>;
  fontColors?: Set<string>;
  fontColorOpacities?: Set<number>;
  fontLetterSpacings?: Set<number>;
  textDecorations?: Set<TextDecoration>;
  textDecorationThicknesses?: Set<number>;
  textDecorationColors?: Set<string>;
  textDecorationOpacities?: Set<number>;
};
