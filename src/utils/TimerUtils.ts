export default class TimeUtils {
  /**
   * 等待
   * @param ms
   */
  static wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
