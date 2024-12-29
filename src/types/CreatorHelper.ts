import { Creator, CreatorTypes } from '@/types';
import { Creators } from '@/types/Constants';

export default class CreatorHelper {
  static getCreatorByType(type: CreatorTypes): Creator {
    return Creators.find(item => item.type === type);
  }
}