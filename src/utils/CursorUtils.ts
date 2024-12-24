import { CreatorCategories } from "@/types";
import CrossSvg from '@/assets/Cross.svg';

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