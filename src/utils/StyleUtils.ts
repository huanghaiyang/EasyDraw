import { ElementStyles } from "@/types/ElementStyles";
import ColorUtils from "./ColorUtils";

export default class StyleUtils {
  static joinFillColor(style: ElementStyles): string {
    return `${ColorUtils.hashToRgba(style.fillColor, style.fillColorOpacity)}`;
  }

  static joinStrokeColor(style: ElementStyles): string {
    return `${ColorUtils.hashToRgba(style.strokeColor, style.strokeColorOpacity)}`;
  }

  static joinFont(style: ElementStyles): string {
    return `${style.fontSize}px ${style.fontFamily}`;
  }
}