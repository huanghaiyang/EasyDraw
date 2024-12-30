export enum StrokeTypes {
  inside = 0,
  middle = 1,
  outside = 2
}

export const StrokeTypesArray = [{
  type: StrokeTypes.inside,
  name: '内描边'
}, {
  type: StrokeTypes.middle,
  name: '平分宽度'
}, {
  type: StrokeTypes.outside,
  name: '外描边'
}]

// 画板元素样式定义
export type ElementStyles = {
  strokeColor?: string;
  strokeType?: StrokeTypes;
  strokeWidth?: number;
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export const DefaultStrokeType = StrokeTypes.inside;
export const DefaultStrokeColor = 'rgba(0, 0, 0, 0.05)';
export const DefaultFillColor = 'rgba(0, 0, 0, 0.065)';
export const DefaultLineWidth = 0;
export const DefaultFontSize = 12;
export const DefaultFontFamily = 'sans-serif';
export const DefaultTextAlign = 'center';
export const DefaultTextBaseline = 'middle';

export const DefaultElementStyle: ElementStyles = {
  strokeColor: DefaultStrokeColor,
  strokeType: DefaultStrokeType,
  strokeWidth: DefaultLineWidth,
  fillColor: DefaultFillColor,
  fontSize: DefaultFontSize,
  fontFamily: DefaultFontFamily,
  textAlign: DefaultTextAlign,
  textBaseline: DefaultTextBaseline
}