import { ElementStyles } from "@/types/ElementStyles";

// 鼠标样式画布尺寸
export const MinCursorMoveXDistance = 2;
export const MinCursorMoveYDistance = 2;

export const DefaultSelectionStrokeColor = '#0c8ce9';
export const DefaultSelectionStrokeColorOpacity = 1;
export const DefaultSelectionFillColor = '#0c8ce9';
export const DefaultSelectionFillColorOpacity = 0.05;
export const DefaultSelectionLineWidth = 1;

export const DefaultTransformerStrokeColor = '#0c8ce9';
export const DefaultTransformerStrokeColorOpacity = 1;
export const DefaultTransformerFillColor = '#ffffff';
export const DefaultTransformerFillColorOpacity = 1;
export const DefaultTransformerLineWidth = 1;

export const DefaultTransformerValue = 8;
export const DefaultSelectionRotateSize = 12;
export const DefaultSelectionRotateDistance = 12;
export const DefaultSelectionSizeIndicatorDistance = 12;
// 尺寸指示文本
export const DefaultSelectionSizeIndicatorFillColor = '#0c8ce9';
export const DefaultSelectionSizeIndicatorFillColorOpacity = 1;
export const DefaultSelectionSizeIndicatorTextColor = '#000000';
export const DefaultSelectionSizeIndicatorFontSize = 12;
export const DefaultSelectionSizeIndicatorFontFamily = 'Arial';
export const DefaultSelectionSizeIndicatorTextAlign = 'center';
export const DefaultSelectionSizeIndicatorTextBaseline = 'middle';

export const DefaultSelectionStyle: ElementStyles = {
  strokeColor: DefaultSelectionStrokeColor,
  strokeColorOpacity: DefaultSelectionStrokeColorOpacity,
  strokeWidth: DefaultSelectionLineWidth,
  fillColor: DefaultSelectionFillColor,
  fillColorOpacity: DefaultSelectionFillColorOpacity,
}

export const DefaultTransformerStyle: ElementStyles = {
  strokeColor: DefaultTransformerStrokeColor,
  strokeColorOpacity: DefaultTransformerStrokeColorOpacity,
  strokeWidth: DefaultTransformerLineWidth,
  fillColor: DefaultTransformerFillColor,
  fillColorOpacity: DefaultTransformerFillColorOpacity,
}

export const DefaultSelectionSizeIndicatorStyle: ElementStyles = {
  fontSize: DefaultSelectionSizeIndicatorFontSize,
  fontFamily: DefaultSelectionSizeIndicatorFontFamily,
  fillColor: DefaultSelectionSizeIndicatorFillColor,
  fillColorOpacity: DefaultSelectionSizeIndicatorFillColorOpacity,
  textAlign: DefaultSelectionSizeIndicatorTextAlign,
  textBaseline: DefaultSelectionSizeIndicatorTextBaseline,
}

export const DefaultCursorPositionStyle = DefaultSelectionSizeIndicatorStyle;

export const DefaultCursorSize = 20;