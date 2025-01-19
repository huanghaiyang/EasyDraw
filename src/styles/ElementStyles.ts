import { CreatorTypes } from "@/types/Creator";

export enum StrokeTypes {
  inside = 0,
  middle = 1,
  outside = 2
}

type StrokeTypePair = {
  type: StrokeTypes,
  name: string
}

export const StrokeTypesArray: StrokeTypePair[] = [{
  type: StrokeTypes.inside,
  name: '内描边'
}, {
  type: StrokeTypes.middle,
  name: '平分线宽'
}, {
  type: StrokeTypes.outside,
  name: '外描边'
}]

export const LineStrokeTypes: StrokeTypePair[] = [{
  type: StrokeTypes.middle,
  name: '平分线宽'
}]

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
}

export const DefaultStrokeType = StrokeTypes.middle;
export const DefaultStrokeColor = '#000000';
export const DefaultStrokeColorOpacity = 1;
export const DefaultFillColor = '#000000';
export const DefaultFillColorOpacity = 0.05;
export const DefaultStrokeWidth = 0;
export const DefaultFontSize = 12;
export const DefaultFontFamily = 'sans-serif';
export const DefaultTextAlign = 'center';
export const DefaultTextBaseline = 'middle';
export const DefaultLineStrokeWidth = 20;
export const DefaultLineMeterLimit = 100;

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
  textBaseline: DefaultTextBaseline
}

export const getDefaultElementStyle = (type: CreatorTypes): ElementStyles => {
  switch (type) {
    case CreatorTypes.line: {
      return {
        ...DefaultElementStyle,
        strokeWidth: DefaultLineStrokeWidth
      }
    }
    case CreatorTypes.image: {
      return {
        ...DefaultElementStyle,
        fillColor: '',
        fillColorOpacity: 0,
      }
    }
    case CreatorTypes.arbitrary: {
      return {
        ...DefaultElementStyle,
        fillColor: '',
        fillColorOpacity: 0,
        strokeWidth: DefaultLineStrokeWidth
      }
    }
    case CreatorTypes.rectangle:
    default: {
      return {
        ...DefaultElementStyle,
      }
    }
  }
}