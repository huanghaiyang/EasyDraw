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
}
