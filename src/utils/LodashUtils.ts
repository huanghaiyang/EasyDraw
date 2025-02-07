import { isPlainObject } from "lodash";

export default class LodashUtils {
  /**
   * 深度合并对象
   *
   * @param target
   * @param sources
   * @returns
   */
  static deepPlanObjectAssign<T>(target: T, ...sources: any[]): T {
    sources.forEach((source) => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (isPlainObject(source[key])) {
            if (target[key] === undefined) {
              target[key] = {};
            }
            this.deepPlanObjectAssign(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    });
    return target;
  }
}
