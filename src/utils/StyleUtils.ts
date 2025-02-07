import { ElementStyles } from "@/styles/ElementStyles";
import ColorUtils from "@/utils/ColorUtils";

export default class StyleUtils {
  // 计算填充颜色
  static joinFillColor(style: ElementStyles): string {
    return `${ColorUtils.hashToRgba(style.fillColor, style.fillColorOpacity)}`;
  }

  // 计算描边颜色
  static joinStrokeColor(style: ElementStyles): string {
    return `${ColorUtils.hashToRgba(style.strokeColor, style.strokeColorOpacity)}`;
  }

  // 计算字体
  static joinFont(style: ElementStyles): string {
    return `${style.fontSize}px ${style.fontFamily}`;
  }
}
