import { cloneDeep, isArray, isPlainObject, remove, reverse } from "lodash";

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

  /**
   * 判断两个数组是否相等
   *
   * @param array1
   * @param array2
   * @returns
   */
  static isArrayEqual(array1: any[], array2: any[]): boolean {
    return array1.length === array2.length && array1.every((item, index) => item === array2[index]);
  }

  /**
   * 判断两个Set是否相等
   *
   * @param set1 第一个Set
   * @param set2 第二个Set
   * @returns 是否相等
   */
  static isSetEqual(set1: Set<any>, set2: Set<any>): boolean {
    return set1.size === set2.size && [...set1].every(item => set2.has(item));
  }

  /**
   * 嵌套反转数组
   *
   * @param arr
   */
  static reverseArray(arr: any[]): any[] {
    return reverse(
      arr.map(item => {
        if (isArray(item)) {
          return this.reverseArray(item);
        } else {
          return item;
        }
      }),
    );
  }

  /**
   * 给定一个元素不重复的数组，将数组中的某些元素，移动到数组中某个元素的后面
   *
   * @param arr
   * @param elements
   * @param targetElement
   */
  static moveArrayElementsAfter<T>(arr: T[], elements: T[], targetElement: T): T[] {
    let result: T[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (!elements.includes(arr[i])) {
        result.push(arr[i]);
      }
    }
    const index = result.findIndex(item => item === targetElement);
    if (index !== -1) {
      result.splice(index + 1, 0, ...elements);
    } else {
      result = [...result, ...elements];
    }
    return result;
  }

  /**
   * 给定一个元素不重复的数组，将数组中的某些元素，移动到数组中某个元素的前面
   *
   * @param arr
   * @param elements
   * @param targetElement
   */
  static moveArryElementsBefore<T>(arr: T[], elements: T[], targetElement: T): T[] {
    let result: T[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (!elements.includes(arr[i])) {
        result.push(arr[i]);
      }
    }
    const index = result.findIndex(item => item === targetElement);
    if (index !== -1) {
      result.splice(index, 0, ...elements);
    } else {
      result = [...elements, ...result];
    }
    return result;
  }
}
