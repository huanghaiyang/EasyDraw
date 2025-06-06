import { ElementStyles, FillStyle, StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";

// 鼠标样式画布尺寸
export const MinCursorMXD = 2;
export const MinCursorMYD = 2;

export const SelectionStrokeColor = "#0c8ce9";
export const SelectionStrokeColorOpacity = 100;
export const SelectionFillColor = "#0c8ce9";
export const SelectionFillColorOpacity = 2.5;
export const SelectionLineWidth = 1;

export const TransformerStrokeColor = "#0c8ce9";
export const TransformerStrokeColorOpacity = 100;
export const TransformerFillColor = "#ffffff";
export const TransformerFillColorOpacity = 100;
export const TransformerLineWidth = 1;

export const TransformerSize = 6;
export const RotationSize = 12;
export const SelectionRotationMargin = 12;
export const SelectionIndicatorMargin = 20;
export const SelectionIndicatorFillColor = "#0c8ce9";
export const SelectionIndicatorFillColorOpacity = 100;
export const SelectionIndicatorTextColor = "#ffffff";
export const SelectionIndicatorTextColorOpacity = 100;
export const SelectionIndicatorFontSize = 12;
export const SelectionIndicatorFontFamily = "Arial";
export const SelectionIndicatorTextAlign = "center";
export const SelectionIndicatorTextBaseline = "middle";

export const TextUnderLineColor = "#0c8ce9";
export const TextUnderLineWidth = 1;
export const TextUnderLineColorOpacity = 85;

// 文本选区填充色
export const TextSelectionFillColor = "#0c8ce9";
// 文本选区填充色透明度
export const TextSelectionFillColorOpacity = 25;

// 旋转控制器边距
export const RotateControllerMargin = TransformerSize + Math.sqrt(Math.pow(RotationSize / 2, 2));

export const SelectionStyle: ElementStyles = {
  strokes: [
    {
      type: StrokeTypes.middle,
      width: SelectionLineWidth,
      color: SelectionStrokeColor,
      colorOpacity: SelectionStrokeColorOpacity,
    },
  ],
  fills: [
    {
      color: SelectionFillColor,
      colorOpacity: SelectionFillColorOpacity,
    },
  ],
};

export const ControllerStyle: ElementStyles = {
  strokes: [
    {
      type: StrokeTypes.middle,
      width: TransformerLineWidth,
      color: TransformerStrokeColor,
      colorOpacity: TransformerStrokeColorOpacity,
    },
  ],
  fills: [
    {
      color: TransformerFillColor,
      colorOpacity: TransformerFillColorOpacity,
    },
  ],
};

// 指示器背景色
export const SelectionIndicatorBgStyle: FillStyle = {
  color: SelectionIndicatorFillColor,
  colorOpacity: SelectionIndicatorFillColorOpacity,
};

// 指示器文本颜色
export const SelectionIndicatorTextStyle: StrokeStyle = {
  color: SelectionIndicatorTextColor,
  colorOpacity: SelectionIndicatorTextColorOpacity,
};

// 指示器样式
export const SelectionIndicatorStyle: ElementStyles = {
  fontSize: SelectionIndicatorFontSize,
  fontFamily: SelectionIndicatorFontFamily,
  textAlign: SelectionIndicatorTextAlign,
  textBaseline: SelectionIndicatorTextBaseline,
  fills: [SelectionIndicatorBgStyle],
  text: [SelectionIndicatorTextStyle],
};

export const CursorSize = 20;

export const DefaultControllerRadius = 3;
