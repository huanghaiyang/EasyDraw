import CanvasUtils from "@/utils/CanvasUtils";

export default class ImageUtils {
  /**
   * 从粘贴板中提取图片
   * 
   * @param e 
   * @returns 
   */
  static getImageDataFromClipboard(e: ClipboardEvent): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const items = e.clipboardData?.items;
      if (!items) {
        reject(new Error('No items in clipboard'));
        return;
      }
      const item = Array.from(items).find(item => item.type.startsWith('image/'));
      if (!item) {
        reject(new Error('No image in clipboard'));
        return;
      }
      const blob = item.getAsFile();
      if (!blob) {
        reject(new Error('No image in clipboard'));
        return;
      }
      CanvasUtils.getImageDataFromBlob(blob).then(data => {
        resolve(data);
      });
    })
  }

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
        reject(new Error('Image load failed'));
      };
    });
  }
}