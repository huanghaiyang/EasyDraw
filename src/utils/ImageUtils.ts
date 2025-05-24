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

  /**
   * 通过Url创建Image
   *
   * @param url
   * @returns
   */
  static async createImageFromUrl(url: string): Promise<HTMLImageElement> {
    const img = new Image();
    img.src = url;
    await this.waitForImageLoad(img);
    return img;
  }

  /**
  * 转换图片
  *
  * @param images
  * @returns
  */
  static async convertImages(images: (HTMLImageElement[] | ImageData[])): Promise<(HTMLImageElement & { colorSpace: PredefinedColorSpace })[]> {
   return Promise.all(images.map(async (image) => {
     if (image instanceof ImageData) {
       const colorSpace = image.colorSpace;
       image = ImageUtils.createImageFromImageData(image);
       image.colorSpace = colorSpace;
       await ImageUtils.waitForImageLoad(image);
     }
     return image;
   }));
 }
}
