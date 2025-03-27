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

  /**
   * 判断是否为 Ctrl 键
   *
   * @param keyCode 键码
   * @returns 是否为 Ctrl 键
   */
  static isCtrl(keyCode: number): boolean {
    return keyCode === 17;
  }

  /**
   * 判断是否为 A 键
   *
   * @param keyCode 键码
   * @returns 是否为 A 键
   */
  static isA(keyCode: number): boolean {
    return keyCode === 65;
  }

  /**
   * 判断是否为 C 键
   *
   * @param keyCode 键码
   * @returns 是否为 C 键
   */
  static isC(keyCode: number): boolean {
    return keyCode === 67;
  }

  /**
   * 判断是否为 V 键
   *
   * @param keyCode 键码
   * @returns 是否为 V 键
   */
  static isV(keyCode: number): boolean {
    return keyCode === 86;
  }

  /**
   * 判断是否为 Z 键
   *
   * @param keyCode 键码
   * @returns 是否为 Z 键
   */
  static isZ(keyCode: number): boolean {
    return keyCode === 90;
  }

  /**
   * 判断是否为 Y 键
   *
   * @param keyCode 键码
   * @returns 是否为 Y 键
   */
  static isY(keyCode: number): boolean {
    return keyCode === 89;
  }

  /**
   * 判断是否为 X 键
   *
   * @param keyCode 键码
   * @returns 是否为 X 键
   */
  static isX(keyCode: number): boolean {
    return keyCode === 88;
  }

  /**
   * 判断是否为 Enter 键
   *
   * @param keyCode 键码
   * @returns 是否为 Enter 键
   */
  static isEnter(keyCode: number): boolean {
    return keyCode === 13;
  }
}
