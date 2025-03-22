export default class CoderUtils {
  /**
   * 判断是否为删除键
   *
   * @param keyCode 键码
   * @returns 是否为删除键
   */
  static isDeleterKey(keyCode: number): boolean {
    return keyCode === 8 || keyCode === 46;
  }
}
