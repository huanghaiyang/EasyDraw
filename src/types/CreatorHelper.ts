import { Creator, CreatorTypes } from "@/types/Creator";
import { Creators } from "@/types/CreatorDicts";

export default class CreatorHelper {
  static getCreatorByType(type: CreatorTypes): Creator {
    return Creators.find(item => item.type === type);
  }
}