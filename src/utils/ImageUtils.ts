import CanvasUtils from "@/utils/CanvasUtils";

export default class ImageUtils {
  /**
   * 从粘贴板中提取图片
   * 
   * @param e 
   * @returns 
   */
  static getImageDataFromClipboard(e: ClipboardEvent): Promise<ImageData[]> {
    return new Promise((resolve, reject) => {
      const items = e.clipboardData?.items;
      if (!items) {
        console.warn('No clipboard data');
        return reject();
      }
      const images = Array.from(items).filter(item => item.type.startsWith('image/'));
      if (!images.length) {
        console.warn('No image in clipboard');
        return reject();
      }
      const result = Promise.all(images.map(item => {
        const blob = item.getAsFile();
        if (!blob) {
          console.warn('No blob in clipboard');
          reject();
          return;
        }
        return CanvasUtils.getImageDataFromBlob(blob);
      }))
      resolve(result);
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