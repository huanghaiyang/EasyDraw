export default class ColorUtils {
  /**
   * 将哈希颜色值转换为RGBA格式
   *
   * @param color
   * @param opacity
   * @returns
   */
  static hashToRgba(color: string, opacity: number) {
    // 检查输入的哈希颜色值是否合法
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      throw new Error("Invalid color format");
    }

    // 去掉开头的#号
    let hex = color.slice(1);

    // 如果是简写形式，将其转换为完整形式
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map(char => char + char)
        .join("");
    }

    // 解析出红、绿、蓝三个分量
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // 返回RGBA格式的字符串
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * 生成一个随机的颜色
   */
  static getRandomColor(): string {
    // 定义十六进制字符集
    const letters = "0123456789ABCDEF";
    let color = "#";
    // 循环 6 次，每次随机选择一个字符添加到颜色字符串中
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
