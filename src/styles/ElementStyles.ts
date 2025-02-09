import { CreatorTypes } from "@/types/Creator";

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
 * 根据画板元素类型获取对应的描边类型数组
 *
 * @param type 画板元素类型
 * @returns 描边类型数组
 */
export function getStokeTypes(type: CreatorTypes): StrokeTypePair[] {
  switch (type) {
    case CreatorTypes.arbitrary:
    case CreatorTypes.rectangle:
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

// 画板元素样式定义
export type ElementStyles = {
  strokeColor?: string;
  strokeColorOpacity?: number;
  strokeType?: StrokeTypes;
  strokeWidth?: number;
  fillColor?: string;
  fillColorOpacity?: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
};

// 默认描边类型，分为内描边，平分线宽，外描边
export const DefaultStrokeType = StrokeTypes.middle;
// 默认描边颜色
export const DefaultStrokeColor = "#000000";
// 默认描边透明度
export const DefaultStrokeColorOpacity = 1;
// 默认填充颜色
export const DefaultFillColor = "#000000";
// 默认填充透明度
export const DefaultFillColorOpacity = 0.05;
// 默认边框宽度
export const DefaultStrokeWidth = 1;
// 默认字体大小
export const DefaultFontSize = 12;
// 默认字体家族
export const DefaultFontFamily = "sans-serif";
// 默认文本对齐方式
export const DefaultTextAlign = "center";
// 默认文本基线
export const DefaultTextBaseline = "middle";
// 默认直线描边宽度
export const DefaultLineStrokeWidth = 1;
// 默认直线描边长度限制
export const DefaultLineMeterLimit = 100;

// 默认元素样式
export const DefaultElementStyle: ElementStyles = {
  strokeColor: DefaultStrokeColor,
  strokeColorOpacity: DefaultStrokeColorOpacity,
  strokeType: DefaultStrokeType,
  strokeWidth: DefaultStrokeWidth,
  fillColor: DefaultFillColor,
  fillColorOpacity: DefaultFillColorOpacity,
  fontSize: DefaultFontSize,
  fontFamily: DefaultFontFamily,
  textAlign: DefaultTextAlign,
  textBaseline: DefaultTextBaseline,
};

export const getDefaultElementStyle = (type: CreatorTypes): ElementStyles => {
  switch (type) {
    case CreatorTypes.line: {
      return {
        ...DefaultElementStyle,
        strokeWidth: DefaultLineStrokeWidth,
      };
    }
    case CreatorTypes.image: {
      return {
        ...DefaultElementStyle,
        fillColor: "",
        fillColorOpacity: 0,
      };
    }
    case CreatorTypes.arbitrary: {
      return {
        ...DefaultElementStyle,
        fillColor: "",
        fillColorOpacity: 0,
        strokeWidth: DefaultLineStrokeWidth,
      };
    }
    case CreatorTypes.rectangle:
    default: {
      return {
        ...DefaultElementStyle,
      };
    }
  }
};
