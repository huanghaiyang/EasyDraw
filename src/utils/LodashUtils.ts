import { cloneDeep, isArray, isPlainObject } from "lodash";

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
  static isAllEqualWith<T>(array: T[], value: T, eqFunc: (obj: T, oth: T) => boolean): boolean {
    return array.every(item => eqFunc(item, value));
  }

  /**
   * 深度克隆对象
   *
   * @param obj
   * @returns
   */
  static jsonClone<T>(obj: T): T {
    if (isPlainObject(obj) || isArray(obj)) {
      return JSON.parse(JSON.stringify(obj));
    }
    console.warn("jsonClone: 非对象或数组类型", obj);
    return cloneDeep(obj);
  }

  /**
   * 判断两个对象是否相等
   *
   * @param obj1
   * @param obj2
   * @returns
   */
  static isPlainObjectEqual(obj1: Object, obj2: Object): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    return keys1.every(key => obj1[key] === obj2[key]);
  }

  /**
   * 将字符串数组映射为对象，且值为boolean
   *
   * @param array
   * @param value
   * @returns
   */
  static toBooleanObject(array: (string | { [key: string]: boolean })[], value: boolean = true): { [key: string]: boolean } {
    return array.reduce(
      (obj, key) => {
        if (typeof key === "string") {
          obj[key] = value;
        } else if (isPlainObject(key)) {
          Object.assign(obj, key);
        }
        return obj;
      },
      {} as { [key: string]: boolean },
    ) as { [key: string]: boolean };
  }
}
