import { FontStyle } from "@/styles/ElementStyles";
import { ISize } from "@/types";
import TextUtils from "@/utils/TextUtils";

export default class FontUtils {
  // 用于计算文本尺寸的假文本
  static DUMMY_TEXT = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789天地玄黄宇宙洪荒日月盈昃辰宿列张孔曹卢甘{}[]|~!@#$%^&*()_+{}:";

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
}
