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

  /**
   * 判断是否为左箭头键
   *
   * @param keyCode 键码
   * @returns 是否为左箭头键
   */
  static isArrowLeft(keyCode: number): boolean {
    return keyCode === 37;
  }

  /**
   * 判断是否为右箭头键
   *
   * @param keyCode 键码
   * @returns 是否为右箭头键
   */
  static isArrowRight(keyCode: number): boolean {
    return keyCode === 39;
  }

  /**
   * 判断是否为上箭头键
   *
   * @param keyCode 键码
   * @returns 是否为上箭头键
   */
  static isArrowUp(keyCode: number): boolean {
    return keyCode === 38;
  }

  /**
   * 判断是否为下箭头键
   *
   * @param keyCode 键码
   * @returns 是否为下箭头键
   */
  static isArrowDown(keyCode: number): boolean {
    return keyCode === 40;
  }
}
