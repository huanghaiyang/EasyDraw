import { ElementStyles, StrokeStyle } from "@/styles/ElementStyles";
import ColorUtils from "@/utils/ColorUtils";

export default class StyleUtils {
  // 计算填充颜色
  static joinFillColor(style: ElementStyles): string {
    return `${ColorUtils.hashToRgba(style.fillColor, style.fillColorOpacity)}`;
  }

  // 计算描边颜色
  static joinStrokeColor(strokeStyle: StrokeStyle): string {
    return `${ColorUtils.hashToRgba(strokeStyle.color, strokeStyle.colorOpacity)}`;
  }

  // 计算字体
  static joinFont(style: ElementStyles): string {
    return `${style.fontSize}px ${style.fontFamily}`;
  }
}
