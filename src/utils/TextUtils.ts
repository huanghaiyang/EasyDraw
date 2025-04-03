export default class TextUtils {
  /**
   * 判断给定文本是否换行
   */
  static isMultiLine(text: string): boolean {
    return text.indexOf("\n") !== -1;
  }

  /**
   * 替换空格
   *
   * @param text
   * @returns
   */
  static replaceAZero(text: string): string {
    return text.replaceAll(" ", "\u00a0");
  }
}
