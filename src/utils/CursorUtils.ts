import { CreatorCategories } from "@/types";
import CrossSvg from '@/assets/Cross.svg';

export default class CursorUtils {
  static getCursorStyle(creatorCategory: CreatorCategories): string {
    switch (creatorCategory) {
      case CreatorCategories.cursor:
        return 'default';
      case CreatorCategories.shapes:
        return 'crosshair';
      default:
        return 'default';
    }
  }

  static getCursorSvg(creatorCategory: CreatorCategories): string {
    switch (creatorCategory) {
      case CreatorCategories.shapes:
        return CrossSvg;
      default:
        return CrossSvg;
    }
  }
}