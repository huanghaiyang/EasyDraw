import { ElementStyles } from "@/types/ElementStyles";

// 鼠标样式画布尺寸
export const CursorCanvasSize = 24;
export const MinCursorMoveXDistance = 2;
export const MinCursorMoveYDistance = 2;

export const DefaultSelectionStrokeColor = '#0c8ce9';
export const DefaultSelectionStrokeColorOpacity = 1;
export const DefaultSelectionFillColor = '#000000';
export const DefaultSelectionFillColorOpacity = 0;
export const DefaultSelectionLineWidth = 1;

export const DefaultSizeTransformerStrokeColor = '#0c8ce9';
export const DefaultSizeTransformerStrokeColorOpacity = 1;
export const DefaultSizeTransformerFillColor = '#ffffff';
export const DefaultSizeTransformerFillColorOpacity = 1;
export const DefaultSizeTransformerLineWidth = 1;

export const DefaultSizeTransformerValue = 10;
export const DefaultSelectionRotateSize = 18;
export const DefaultSelectionRotateDistance = 18;
export const DefaultSelectionSizeIndicatorDistance = 10;
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
  strokeColor: DefaultSizeTransformerStrokeColor,
  strokeColorOpacity: DefaultSizeTransformerStrokeColorOpacity,
  strokeWidth: DefaultSizeTransformerLineWidth,
  fillColor: DefaultSizeTransformerFillColor,
  fillColorOpacity: DefaultSizeTransformerFillColorOpacity,
}

export const DefaultSelectionSizeIndicatorStyle: ElementStyles = {
  fontSize: DefaultSelectionSizeIndicatorFontSize,
  fontFamily: DefaultSelectionSizeIndicatorFontFamily,
  fillColor: DefaultSelectionSizeIndicatorFillColor,
  fillColorOpacity: DefaultSelectionSizeIndicatorFillColorOpacity,
  textAlign: DefaultSelectionSizeIndicatorTextAlign,
  textBaseline: DefaultSelectionSizeIndicatorTextBaseline,
}