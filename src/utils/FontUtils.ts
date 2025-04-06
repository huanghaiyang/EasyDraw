import { FontStyle, FontStylePropsForMeasureText } from "@/styles/ElementStyles";
import { ISize } from "@/types";
import TextUtils from "@/utils/TextUtils";
import { pick } from "lodash";
import LodashUtils from "@/utils/LodashUtils";

export default class FontUtils {
  /**
   * 计算文字宽度
   *
   * 如果未指定行高，则可以使用此方法计算文本尺寸，否则请使用 measureTextWithSpan
   *
   * @param text
   * @param fontStyle
   * @returns
   */
  static measureText(text: string, fontStyle: FontStyle): ISize {
    const { fontSize, fontFamily, textBaseline, textAlign } = fontStyle;
    const lines = text.split("\n");
    let maxWidth = 0;
    let height = 0;
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    ctx.font = `${fontSize}px ${fontFamily}`;
    if (textBaseline) {
      ctx.textBaseline = textBaseline;
    }
    if (textAlign) {
      ctx.textAlign = textAlign;
    }
    lines.forEach(line => {
      line = line || " ";
      line = TextUtils.replaceAZero(line);
      const metrics = ctx.measureText(line);
      const { width, fontBoundingBoxAscent, fontBoundingBoxDescent } = metrics;
      if (width > maxWidth) {
        maxWidth = width;
      }
      height += fontBoundingBoxAscent + fontBoundingBoxDescent;
    });
    const result = {
      width: maxWidth,
      height,
    };
    ctx = null;
    canvas = null;
    return result;
  }

  /**
   * 计算文字宽度
   *
   * @param text
   * @param fontStyle
   * @returns
   */
  static measureTextWithSpan(text: string, fontStyle: FontStyle): ISize {
    const { fontSize, fontFamily, textBaseline, textAlign, fontLineHeight } = fontStyle;
    const lines = text.split("\n");
    let maxWidth = 0;
    let height = 0;
    const span = document.createElement("span");
    document.body.appendChild(span);
    span.style.visibility = "hidden";
    span.style.fontSize = `${fontSize}px`;
    span.style.fontFamily = fontFamily;
    span.style.display = "inline-block";
    if (fontLineHeight) {
      span.style.lineHeight = `${fontLineHeight}`;
    }
    if (textBaseline) {
      span.style.verticalAlign = textBaseline;
    }
    if (textAlign) {
      span.style.textAlign = textAlign;
    }
    lines.forEach(line => {
      line = line || " ";
      line = TextUtils.replaceAZero(line);
      span.textContent = line;
      const width = span.offsetWidth;
      if (width > maxWidth) {
        maxWidth = width;
      }
      height += span.offsetHeight;
    });
    const result = {
      width: maxWidth,
      height,
    };
    document.body.removeChild(span);
    return result;
  }

  /**
   * 判断两个字体样式是否相同，此法用于计算字体的尺寸缓存判断

   * @param f1
   * @param f2
   * @returns
   */
  static isFontEqualForMeasureText(f1: FontStyle, f2: FontStyle): boolean {
    f1 = pick(f1, FontStylePropsForMeasureText);
    f2 = pick(f2, FontStylePropsForMeasureText);
    return LodashUtils.isPlainObjectEqual(f1, f2);
  }
}
