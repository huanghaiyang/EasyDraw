import { TextFontStyle } from "@/styles/ElementStyles";
import ITextData, { ITextLine } from "@/types/IText";
import { pick } from "lodash";

/**
 * 文本工具类
 */
export default class TextElementUtils {
  /**
   * 创建文本数据
   *
   * @param content 文本内容
   * @param fontStyle 文本样式
   * @returns 文本数据
   */
  static createTextData(content: string, fontStyle: TextFontStyle): ITextData {
    fontStyle = pick(fontStyle, ["fontFamily", "fontSize", "fontColor", "fontColorOpacity"]);
    const lines: ITextLine[] = [];

    content.split("\n").forEach(line => {
      const nodes = line.split("").map(char => {
        return {
          content: char,
          fontStyle,
        };
      });
      lines.push({ nodes });
    });
    return {
      lines,
    };
  }
}
