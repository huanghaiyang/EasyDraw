export default class DOMUtils {
  /**
   * 复制值到剪贴板
   *
   * @param value
   */
  static copyValueToClipboard(value: string) {
    let input = document.createElement("input");
    document.body.appendChild(input);
    input.value = value;
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    input = null;
  }

  /**
   * 从 innerHTML 中获取文本内容
   *
   * @param innerHTML
   */
  static getContentByInnerHtml(innerHTML: string) {
    let div = document.createElement("div");
    div.innerHTML = innerHTML;
    const content = div.textContent;
    div.remove();
    div = null;
    return content;
  }

  /**
   * 从剪贴板读取值
   */
  static async readValueFromClipboard(): Promise<string> {
    return new Promise(resolve => {
      navigator.clipboard.readText().then(text => {
        resolve(text);
      });
    });
  }

  /**
   * 写入值到剪贴板
   *
   * @param value
   */
  static async writeValueToClipboard(value: string): Promise<void> {
    return navigator.clipboard.writeText(value);
  }
}
