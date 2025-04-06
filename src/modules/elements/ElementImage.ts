import { ElementObject, IElementImage } from "@/types/IElement";
import ElementRect from "@/modules/elements/ElementRect";
import CanvasUtils from "@/utils/CanvasUtils";

export default class ElementImage extends ElementRect implements IElementImage {
  get fillEnable(): boolean {
    return false;
  }

  get fillInputEnable(): boolean {
    return false;
  }

  /**
   * 将组件转换为JSON对象
   *
   * @returns
   */
  async toJson(): Promise<ElementObject> {
    const result = await super.toJson();
    const img = this.model.data;
    if (img instanceof HTMLImageElement) {
      const dataUrl = await CanvasUtils.getDataUrlFromImage(img);
      result.data = dataUrl;
    } else {
      result.data = img;
    }
    return result;
  }
}
