import { Creators } from "@/types/constants";
import { Creator, CreatorTypes } from "@/types";

/**
 * 根据类型查找创建工具
 * 
 * @param type 
 * @returns 
 */
export function getCreatorByType(type: CreatorTypes): Creator {
  return Creators.find(item => item.type === type);
}