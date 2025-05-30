export default class FontLoader {
  /**
   * 加载字体
   *
   * @param font 字体名称
   * @param url 字体文件路径
   */
  static async loadFont(font: string, url: string): Promise<void> {
    // 如果是dev环境
    if (import.meta.env.DEV) {
      url = url.replace("@", "../src");
    } else if (import.meta.env.PROD) {
      url = url.replace("@", ".");
    }
    const fontFace = new FontFace(font, `url(${url})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  }

  /**
   * 批量加载字体
   *
   * @param fonts 字体数组
   */
  static async batchLoadFonts(fonts: { name: string; url: string }[]): Promise<void> {
    await Promise.all(fonts.map(font => FontLoader.loadFont(font.name, font.url)));
  }
}
