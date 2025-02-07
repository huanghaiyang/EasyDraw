import { ElementStyles } from "@/styles/ElementStyles";

// 鼠标样式画布尺寸
export const MinCursorMXD = 2;
export const MinCursorMYD = 2;

export const SelectionStrokeColor = "#0c8ce9";
export const SelectionStrokeColorOpacity = 1;
export const SelectionFillColor = "#0c8ce9";
export const SelectionFillColorOpacity = 0.025;
export const SelectionLineWidth = 1;

export const TransformerStrokeColor = "#0c8ce9";
export const TransformerStrokeColorOpacity = 1;
export const TransformerFillColor = "#ffffff";
export const TransformerFillColorOpacity = 1;
export const TransformerLineWidth = 1;

export const TransformerSize = 6;
export const SelectionRotationSize = 12;
export const SelectionRotationMargin = 12;
export const SelectionIndicatorMargin = 12;
// 尺寸指示文本
export const SelectionIndicatorFillColor = "#0c8ce9";
export const SelectionIndicatorFillColorOpacity = 1;
export const SelectionIndicatorTextColor = "#000000";
export const SelectionIndicatorFontSize = 12;
export const SelectionIndicatorFontFamily = "Arial";
export const SelectionIndicatorTextAlign = "center";
export const SelectionIndicatorTextBaseline = "middle";

export const SelectionStyle: ElementStyles = {
  strokeColor: SelectionStrokeColor,
  strokeColorOpacity: SelectionStrokeColorOpacity,
  strokeWidth: SelectionLineWidth,
  fillColor: SelectionFillColor,
  fillColorOpacity: SelectionFillColorOpacity,
};

export const ControllerStyle: ElementStyles = {
  strokeColor: TransformerStrokeColor,
  strokeColorOpacity: TransformerStrokeColorOpacity,
  strokeWidth: TransformerLineWidth,
  fillColor: TransformerFillColor,
  fillColorOpacity: TransformerFillColorOpacity,
};

export const SelectionIndicatorStyle: ElementStyles = {
  fontSize: SelectionIndicatorFontSize,
  fontFamily: SelectionIndicatorFontFamily,
  fillColor: SelectionIndicatorFillColor,
  fillColorOpacity: SelectionIndicatorFillColorOpacity,
  textAlign: SelectionIndicatorTextAlign,
  textBaseline: SelectionIndicatorTextBaseline,
};

export const CursorPositionStyle = SelectionIndicatorStyle;

export const CursorSize = 20;

export const ArbitraryControllerRadius = 3;
