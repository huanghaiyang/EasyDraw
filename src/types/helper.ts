import { creators } from "@/types/constants";

export function getCreatorByType(type: CreatorTypes): Creator {
  // 遍历creators这个对象
  for (const key in creators) {
    // 如果creators[key].type等于type，就返回creators[key]
    if (creators[key].type === type) {
      return creators[key];
    }
  }
}