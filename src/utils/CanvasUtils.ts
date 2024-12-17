export default class CanvasUtils {
  static async drawImgLike(target: HTMLCanvasElement, svg: string | HTMLCanvasElement, options: Partial<DOMRect>): Promise<void> {
    return new Promise((resolve, reject) => {
      const { x, y, width, height } = options;
      const ctx = target.getContext('2d');
      if (typeof svg === 'string') {
        const img = new Image();
        img.src = svg;
        img.onload = () => {
          ctx.drawImage(img, x, y, width, height);
          resolve();
        }
        img.onerror = () => {
          reject();
        }
      } else if (svg instanceof HTMLCanvasElement) {
        ctx.drawImage(svg, x, y, width, height);
        resolve();
      }
    })
  }
}