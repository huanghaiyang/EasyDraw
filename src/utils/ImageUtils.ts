import CanvasUtils from "@/utils/CanvasUtils";

export default class ImageUtils {
  /**
   * 通过ImageData创建Image
   *
   * @param imageData
   * @returns
   */
  static createImageFromImageData(imageData: ImageData): HTMLImageElement {
    const canvas = CanvasUtils.getCanvasByImageData(imageData);
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  /**
   * 等待图片加载完成
   *
   * @param img
   * @returns
   */
  static waitForImageLoad(img: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error("Image load failed"));
      };
    });
  }
}
