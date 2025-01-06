import CrossSvg from '@/assets/svg/cross.svg';
import { CreatorCategories } from '@/types/Creator';

export default class CursorUtils {
  static getCursorSvg(creatorCategory: CreatorCategories): string {
    switch (creatorCategory) {
      case CreatorCategories.shapes:
        return CrossSvg;
      default:
        return CrossSvg;
    }
  }
}