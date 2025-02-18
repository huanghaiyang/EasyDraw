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
    sources.forEach(source => {
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

  /**
   * 判断数组中是否都等于给定值
   *
   * @param array
   * @param value
   * @param eqFunc
   * @returns
   */
  static isAllEqualWith<T>(
    array: T[],
    value: T,
    eqFunc: (obj: T, oth: T) => boolean,
  ): boolean {
    return array.every(item => eqFunc(item, value));
  }
}
