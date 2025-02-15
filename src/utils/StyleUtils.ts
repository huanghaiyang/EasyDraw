import { ElementStyles, FillStyle, StrokeStyle } from "@/styles/ElementStyles";
import ColorUtils from "@/utils/ColorUtils";

export default class StyleUtils {
  // 计算填充颜色
  static joinFillColor(fillStyle: FillStyle): string {
    if (fillStyle.color) {
      return `${ColorUtils.hashToRgba(fillStyle.color, fillStyle.colorOpacity)}`;
    }
    return "";
  }

  // 计算描边颜色
  static joinStrokeColor(strokeStyle: StrokeStyle): string {
    if (strokeStyle.color) {
      return `${ColorUtils.hashToRgba(strokeStyle.color, strokeStyle.colorOpacity)}`;
    }
    return "";
  }

  // 计算字体
  static joinFont(style: ElementStyles): string {
    return `${style.fontSize}px ${style.fontFamily}`;
  }
}
