import { Creator, CreatorTypes } from "@/types/Creator";
import { Creators } from "@/types/CreatorDicts";

export default class CreatorHelper {
  /**
   * 根据工具类型获取工具
   *
   * @param type 工具类型
   * @returns 工具
   */
  static getCreatorByType(type: CreatorTypes): Creator {
    return Creators.find(item => item.type === type);
  }

  /**
   * 是否是组件
   *
   * @param type 工具类型
   * @returns 是否是组件
   */
  static isElement(type: CreatorTypes): boolean {
    return [
      CreatorTypes.image,
      CreatorTypes.text,
      CreatorTypes.arbitrary,
      CreatorTypes.rectangle,
      CreatorTypes.ellipse,
      CreatorTypes.polygon,
      CreatorTypes.line,
      CreatorTypes.text,
      CreatorTypes.pencil,
    ].includes(type);
  }
}
