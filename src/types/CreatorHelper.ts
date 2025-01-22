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
}