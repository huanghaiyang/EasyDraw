import { Creators } from "@/types/constants";
import { Creator, CreatorTypes } from "@/types";

export function getCreatorByType(type: CreatorTypes): Creator {
  // 遍历Creators这个对象
  for (const key in Creators) {
    // 如果Creators[key].type等于type，就返回Creators[key]
    if (Creators[key].type === type) {
      return Creators[key];
    }
  }
}