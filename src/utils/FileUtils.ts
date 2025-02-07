import CanvasUtils from "@/utils/CanvasUtils";

export default class FileUtils {
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
        console.warn("No clipboard data");
        return reject();
      }
      const images = Array.from(items).filter((item) => item.type.startsWith("image/"));
      if (!images.length) {
        console.warn("No image in clipboard");
        return reject();
      }
      const result = Promise.all(
        images.map((item) => {
          const blob = item.getAsFile();
          if (!blob) {
            console.warn("No blob in clipboard");
            reject();
            return;
          }
          return CanvasUtils.getImageDataFromBlob(blob);
        })
      );
      resolve(result);
    });
  }

  /**
   * 从拖拽事件中提取图片
   *
   * @param e
   * @returns
   */
  static getImageDataFromFileTransfer(e: DragEvent): Promise<ImageData[]> {
    return new Promise((resolve, reject) => {
      const files = e.dataTransfer?.files;
      if (!files) {
        console.warn("No files in drag event");
        return reject();
      }
      FileUtils.parseImageFiles(Array.from(files), resolve, reject);
    });
  }

  /**
   * 从文件中提取图片
   *
   * @param files
   * @returns
   */
  static getImageDataFromFiles(files: File[]): Promise<ImageData[]> {
    return new Promise((resolve, reject) => {
      return FileUtils.parseImageFiles(files, resolve, reject);
    });
  }

  /**
   * 从文件中解析图片
   *
   * @param files
   * @param resolve
   * @param reject
   * @returns
   */
  static parseImageFiles(files: File[], resolve: Function, reject: Function): Promise<void> {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!images.length) {
      console.warn("No image in files");
      return reject();
    }
    const result = Promise.all(
      images.map((file) => {
        return CanvasUtils.getImageDataFromBlob(file);
      })
    );
    resolve(result);
  }
}
