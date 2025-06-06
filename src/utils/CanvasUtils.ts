import { IPoint } from "@/types";
import { ElementStyles, FillStyle, FontStyle, FontStyler, StrokeStyle, StrokeTypes, TextCase, TextDecoration } from "@/styles/ElementStyles";
import MathUtils from "@/utils/MathUtils";
import StyleUtils from "@/utils/StyleUtils";
import CommonUtils from "@/utils/CommonUtils";
import { ArcPoints, RenderParams, RenderRect } from "@/types/IRender";
import ArbitraryUtils from "@/utils/ArbitraryUtils";
import { EllipseModel } from "@/types/IElement";
import ITextData, { ITextLine, ITextNode } from "@/types/IText";
import FontUtils from "@/utils/FontUtils";
import { every, isNumber } from "lodash";
import CoderUtils from "@/utils/CoderUtils";

// 画布变换参数
type CtxTransformOptions = {
  radian: number;
  scaleX: number;
  scaleY: number;
  leanY: number;
};

// 遍历文本节点回调函数
type EachNodeCallback = (node: ITextNode, index: number) => void;

/**
 * 遍历文本节点
 *
 * @param nodes 文本节点数组
 * @param ctx 2D上下文
 * @param textBaseline 文本基线
 * @param eachCallback 遍历回调
 */
function iterateNodes(nodes: ITextNode[], ctx: CanvasRenderingContext2D, eachCallback?: EachNodeCallback): void {
  nodes.forEach((node, index) => {
    ctx.save();
    const fontStyle = CanvasUtils.transFontWithScale(node.fontStyle);
    let { fontColor, fontColorOpacity, fontSize, fontFamily, fontStyler } = fontStyle;
    ctx.fillStyle = StyleUtils.joinFillColor({ color: fontColor, colorOpacity: fontColorOpacity });
    ctx.font = `${fontStyler !== FontStyler.normal ? fontStyler : ""} ${fontSize}px ${fontFamily}`;
    eachCallback && eachCallback(node, index);
    ctx.restore();
  });
}

/**
 * 判断文本节点的基线是否一致
 *
 * @param nodes 文本节点数组
 * @returns
 */
function isDiffBaseline(nodes: ITextNode[]): boolean {
  let prevFontSize: number;
  let prevFontFamily: string;
  let isDiff: boolean = false;
  // 遍历节点并计算行高、判断字体样式是否一致
  nodes.forEach(node => {
    const { fontSize, fontFamily } = node.fontStyle;
    if (!isDiff) {
      if (!prevFontSize) {
        prevFontSize = fontSize;
      } else if (fontSize !== prevFontSize) {
        isDiff = true;
      }
      if (!prevFontFamily) {
        prevFontFamily = fontFamily;
      } else if (fontFamily !== prevFontFamily) {
        isDiff = true;
      }
    }
  });
  return isDiff;
}

/**
 * 给定文本节点，计算缩进值
 *
 * @param node
 * @param nodeIdex
 * @param metrics
 * @param nodes
 * @param ctx
 */
function calcTextNodeIndenX(node: ITextNode, nodeIdex: number, metrics: TextMetrics, nodes: ITextNode[], ctx: CanvasRenderingContext2D): number {
  const { renderContent, fontStyle } = node;
  // 字体宽度和基线值
  const { width } = metrics;
  // 缩进值
  let indentX: number = 0;
  // 如果当前节点是英文字符，且前一个节点也是英文字符
  if (nodeIdex !== 0 && CoderUtils.isEnglishLetter(renderContent)) {
    const prevNode = nodes[nodeIdex - 1];
    const { renderContent: prevRenderContent, fontStyle: prevFontStyle, renderWidth: prevRenderWidth } = prevNode;
    // 如果前一个节点是英文字符，且两个节点的样式相同，则需要计算下两个字符是否是连字
    if (CoderUtils.isEnglishLetter(prevRenderContent) && FontUtils.isFontEqualForMeasureText(fontStyle, prevFontStyle)) {
      // 计算当前节点和前一个节点的连字宽度
      const { width: tupleWidth } = ctx.measureText(prevRenderContent + renderContent);
      // 两个字符的最大宽度
      const ligatureWidth = prevRenderWidth + width;
      // 如果连字宽度小于最大宽度，则需要缩进
      if (tupleWidth < ligatureWidth) {
        // 缩进值
        indentX = tupleWidth - ligatureWidth;
      }
    }
  }
  return indentX;
}

/**
 * 获取文本节点的渲染内容,转换大小写
 *
 * @param node
 * @param index
 * @param line
 * @param lineIndex
 * @param textCase
 * @param textData
 * @returns
 */
function getTextCaseContent(node: ITextNode, index: number, line: ITextLine, lineIndex: number, textCase: TextCase, textData: ITextData): string {
  const { content } = node;
  let renderContent: string = content;
  switch (textCase) {
    case TextCase.uppercase:
      renderContent = content.toUpperCase();
      break;
    case TextCase.lowercase:
      renderContent = content.toLowerCase();
      break;
    case TextCase.capitalize: {
      if (CoderUtils.isEnglishLetter(content)) {
        let converted: boolean = false;
        let prevWordNode;
        // 判断当前字符是否是行首字符
        if (index === 0) {
          // 判断当前行是否是首行，如果不是，向前查找
          if (lineIndex !== 0) {
            // 前一行
            const prevLine = textData.lines[lineIndex - 1];
            // 前一行不是尾部换行
            if (!prevLine.isTailBreak) {
              // 前一行的最后一个字符，此字符可能不存在
              prevWordNode = prevLine.nodes[prevLine.nodes.length - 1];
            }
          } else {
            // 首行，直接首字母大写
            renderContent = content.toUpperCase();
            converted = true;
          }
        } else {
          prevWordNode = line.nodes[index - 1];
        }
        if (!converted) {
          if (prevWordNode && !CoderUtils.isEnglishLetter(prevWordNode.content)) {
            // 如果前一个字符不是英文则转换为大写
            renderContent = content.toUpperCase();
          } else if (!CoderUtils.isUpperCaseLetter(content)) {
            // 如果字符本身是大写，则不转换为小写
            renderContent = content.toLowerCase();
          }
        }
      }
      break;
    }
  }
  return renderContent;
}

/**
 * 绘制文本装饰
 *
 * @param ctx
 * @param node
 * @param metrics
 */
function drawTextDecoration(ctx: CanvasRenderingContext2D, node: ITextNode): void {
  const {
    renderX,
    renderY,
    width,
    fontBoundingBoxDescent,
    fontStyle: { textDecoration, textDecorationThickness, textDecorationColor, textDecorationOpacity },
  } = node;
  // 绘制文本装饰
  if (textDecoration !== TextDecoration.none && textDecorationThickness !== 0) {
    ctx.save();
    ctx.lineWidth = textDecorationThickness * CanvasUtils.scale;
    ctx.strokeStyle = StyleUtils.joinFillColor({ color: textDecorationColor, colorOpacity: textDecorationOpacity });

    const startX = renderX;
    const endX = startX + width;

    switch (textDecoration) {
      case TextDecoration.underline: {
        const decorationY = renderY + fontBoundingBoxDescent + textDecorationThickness / 2;
        // 下划线位置在基线下方
        ctx.beginPath();
        ctx.moveTo(startX, decorationY);
        ctx.lineTo(endX, decorationY);
        ctx.stroke();
        break;
      }
      case TextDecoration.lineThrough: {
        const decorationY = renderY + (fontBoundingBoxDescent + textDecorationThickness) / 2;
        // 删除线位置在文本中间
        ctx.beginPath();
        ctx.moveTo(startX, decorationY);
        ctx.lineTo(endX, decorationY);
        ctx.stroke();
        break;
      }
      case TextDecoration.overline: {
        const decorationY = renderY - textDecorationThickness / 2;
        // 上划线位置在基线上方
        ctx.beginPath();
        ctx.moveTo(startX, decorationY);
        ctx.lineTo(endX, decorationY);
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }
}

export default class CanvasUtils {
  static ImageCaches = new Map();
  static scale: number = 1;

  /**
   * 批量缓存字符串类图片
   *
   * @param imgStrs
   * @returns
   */
  static async cacheStringImages(imgStrs: string[]): Promise<void> {
    await Promise.all(imgStrs.map(str => CanvasUtils.cacheStringImage(str)));
  }

  /**
   * 缓存字符串类图片
   *
   * @param str
   * @returns
   */
  static async cacheStringImage(str: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = str;
      img.onload = () => {
        CanvasUtils.ImageCaches.set(str, img);
        resolve();
      };
      img.onerror = () => {
        reject();
      };
    });
  }

  /**
   * 根据线型转换点坐标
   *
   * @param points
   * @param strokeType
   * @param strokeWidth
   * @returns
   */
  static convertPointsByStrokeType(points: IPoint[], strokeType: StrokeTypes, strokeWidth: number, options: RenderParams): IPoint[] {
    if (!strokeWidth) return points;
    const { flipX = false, flipY = false } = options;
    // 需要考虑下舞台缩放
    const r = strokeWidth / 2;
    switch (strokeType) {
      case StrokeTypes.inside:
        return flipX !== flipY ? ArbitraryUtils.getArbitraryOuterVertices(points, r, options) : ArbitraryUtils.getArbitraryInnerVertices(points, r, options);
      case StrokeTypes.middle:
        return points;
      case StrokeTypes.outside:
        return flipX !== flipY ? ArbitraryUtils.getArbitraryInnerVertices(points, r, options) : ArbitraryUtils.getArbitraryOuterVertices(points, r, options);
    }
  }

  /**
   * 绘制图片或者canvas到canvas上
   *
   * @param target
   * @param data
   * @param rect
   * @param options
   * @returns
   */
  static async drawImgLike(target: HTMLCanvasElement, data: string | HTMLCanvasElement | ImageData | HTMLImageElement, renderRect: RenderRect, options: RenderParams = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (data instanceof ImageData) {
        data = CanvasUtils.getCanvasByImageData(data).toDataURL();
      }
      if (typeof data === "string") {
        if (CanvasUtils.ImageCaches.has(data)) {
          CanvasUtils.drawRotateImage(target, CanvasUtils.ImageCaches.get(data), renderRect, options);
          resolve();
          return;
        }
        const img = new Image();
        img.src = data;
        img.onload = () => {
          CanvasUtils.ImageCaches.set(data, img);
          CanvasUtils.drawRotateImage(target, img, renderRect, options);
          resolve();
        };
        img.onerror = () => {
          reject();
        };
      } else if (data instanceof HTMLCanvasElement || data instanceof HTMLImageElement) {
        CanvasUtils.drawRotateImage(target, data, renderRect, options);
        resolve();
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取需要的变换参数
   *
   * @param rect
   * @param options
   * @returns
   */
  static getTransformValues(options: RenderParams): CtxTransformOptions {
    let { angle = 0, flipX = false, leanY, actualAngle } = options;
    // 以实际组件角度替换angle
    if (typeof actualAngle === "number") {
      angle = actualAngle;
    }
    // 计算弧度
    let radian = MathUtils.angleToRadian(angle);
    let scaleX = 1;
    let scaleY = 1;
    // 如果组件翻转
    if (flipX) {
      // 翻转显示
      scaleX = -1;
      // 翻转角度
      radian = -radian;
      // 倾斜翻转
      leanY = -leanY;
    }
    return { radian, scaleX, scaleY, leanY };
  }

  /**
   * 变换上下文
   *
   * @param ctx
   * @param rect
   * @param options
   */
  static transformCtx(ctx: CanvasRenderingContext2D, renderRect: RenderRect, options: CtxTransformOptions) {
    const { x, y, width, height } = renderRect;
    const { radian, scaleX, scaleY, leanY } = options;

    ctx.translate(x + width / 2, y + height / 2);
    // 缩放
    ctx.scale(scaleX, scaleY);
    // 旋转
    ctx.rotate(radian);
    // 倾斜
    ctx.transform(1, 0, leanY, 1, 0, 0);
  }

  /**
   * 根据矩形计算偏移量
   *
   * @param rect
   * @returns
   */
  static calcOffsetByRect(renderRect: RenderRect): IPoint {
    const { x, y, width, height } = renderRect;
    return {
      x: -x - width / 2,
      y: -y - height / 2,
    };
  }

  /**
   * 如果路径绘制是以组件中心点开始的，则需要将组件的坐标以组件中心点开始的坐标系转换回来
   *
   * @param points
   * @param rect
   * @returns
   */
  static transPointsOfBox(points: IPoint[], renderRect: RenderRect) {
    const offset = CanvasUtils.calcOffsetByRect(renderRect);
    return MathUtils.batchTranslate(points, offset);
  }

  /**
   * 平移弧线点
   *
   * @param arcPoints
   * @param rect
   * @param rect
   * @returns
   */
  static translateArcPoints(arcPoints: ArcPoints[], renderRect: RenderRect): ArcPoints[] {
    const offset = CanvasUtils.calcOffsetByRect(renderRect);
    return MathUtils.translateArcPoints(arcPoints, offset);
  }

  /**
   * 绘制裁剪路径
   *
   * @param ctx
   * @param arcPoints
   * @param rect
   */
  static drawClipArcPoints(ctx: CanvasRenderingContext2D, arcPoints: ArcPoints[], renderRect: RenderRect) {
    arcPoints = CanvasUtils.transArcParamsWithScale(arcPoints)[0];
    arcPoints = CanvasUtils.translateArcPoints(arcPoints, renderRect);
    ctx.beginPath();
    CanvasUtils.drawBazierPoints(arcPoints, ctx);
    ctx.closePath();
    ctx.clip();
  }

  /**
   * 绘制一张旋转过的图片
   *
   * canvas是以x的正方向为0，顺时针为正角度旋转的
   *
   * @param target
   * @param data
   * @param rect
   * @param options
   */
  static drawRotateImage(target: HTMLCanvasElement, img: CanvasImageSource | HTMLCanvasElement, renderRect: RenderRect, options: RenderParams = {}): void {
    const { width, height, desX, desY, desWidth, desHeight } = renderRect;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, renderRect, this.getTransformValues(options));
    if (options.clipArcPoints) {
      CanvasUtils.drawClipArcPoints(ctx, options.clipArcPoints, renderRect);
    }
    if (every([desX, desY, desWidth, desHeight], isNumber)) {
      ctx.drawImage(img, desX - desWidth / 2, desY, desWidth, desHeight);
    } else {
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    }
    ctx.restore();
  }

  /**
   * 绘制图片
   *
   * @param target
   * @param imageData
   * @param rect
   * @param options
   */
  static drawRotateImageData(target: HTMLCanvasElement, imageData: ImageData, renderRect: RenderRect, options: RenderParams = {}) {
    const img = CanvasUtils.getCanvasByImageData(imageData); // 频繁调用有性能问题
    CanvasUtils.drawRotateImage(target, img, renderRect, options);
  }

  /**
   * 根据给定的rect范围绘制填充
   *
   * @param target
   * @param rect
   * @param fillStyle
   * @param options
   */
  static drawRectInRenderRect(target: HTMLCanvasElement, renderRect: RenderRect, fillStyle: FillStyle, options: RenderParams = {}): void {
    const { width, height, desX, desY, desWidth, desHeight } = renderRect;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, renderRect, this.getTransformValues(options));
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
    if (every([desX, desY, desWidth, desHeight], isNumber)) {
      ctx.fillRect(desX, desY, desWidth, desHeight);
    } else {
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }
    ctx.restore();
  }

  /**
   * 根据给定的rect范围绘制线
   *
   * @param target
   * @param rect
   * @param strokeStyle
   * @param options
   */
  static drawLineInRenderRect(target: HTMLCanvasElement, renderRect: RenderRect, strokeStyle: StrokeStyle, options: RenderParams = {}): void {
    const { desX, desY, desWidth } = renderRect;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, renderRect, this.getTransformValues(options));
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.lineWidth = strokeStyle.width;
    if (every([desX, desY, desWidth], isNumber)) {
      ctx.beginPath();
      ctx.moveTo(desX, desY);
      ctx.lineTo(desX + desWidth, desY);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 绘制一个旋转的文字

   * @param target
   * @param textData
   * @param points
   * @param rect
   * @param fontStyle
   * @param options
   */
  static drawRotateText(target: HTMLCanvasElement, textData: ITextData, points: IPoint[], renderRect: RenderRect, fontStyle: FontStyle, options: RenderParams = {}): void {
    const { fontColor, fontFamily, fontSize, textAlign, textBaseline, fontLineHeight: lineHeight, fontColorOpacity, textVerticalAlign, paragraphSpacing, fontStyler, textCase } = fontStyle;
    const { flipX } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, renderRect, this.getTransformValues(options));
    points = CanvasUtils.transPointsOfBox(points, renderRect);
    ctx.font = `${fontStyler !== FontStyler.normal ? fontStyler : ""} ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = StyleUtils.joinFillColor({ color: fontColor, colorOpacity: fontColorOpacity });
    // 前一个文本行的y坐标
    let lineY = points[0].y;
    const { x: left } = points[0];
    const { x: right } = points[1];
    // 组件渲染时的x坐标
    const elementX = flipX ? -left : left;
    // 组件的宽度
    const elementWidth = Math.abs(right - left);
    // 组件的高度
    const elementHeight = Math.abs(points[3].y - points[0].y);
    // 段落数量
    const paragraphSize = textData.lines.filter(line => line.isTailBreak).length;
    // 计算文本总高度
    let totalTextHeight = lineHeight * textData.lines.length + (paragraphSize - 1) * paragraphSpacing;
    // 根据垂直对齐方式调整lineY
    if (textVerticalAlign === "middle") {
      // 垂直居中对齐
      lineY = points[0].y + (elementHeight - totalTextHeight) / 2;
    } else if (textVerticalAlign === "bottom") {
      // 底部对齐
      lineY = points[0].y + (elementHeight - totalTextHeight);
    }
    // 平均基线值
    const { alphabeticBaseline: avgAlphabeticBaseline, fontBoundingBoxAscent, fontBoundingBoxDescent } = ctx.measureText("a");
    // 平均字体高度
    const avgFontHeight = fontBoundingBoxDescent - fontBoundingBoxAscent;
    textData.lines.forEach((line, lineIndex) => {
      // 当前整个行文本节点加起来的渲染宽度
      let lineWidth: number = 0;
      // 文本节点开始渲染时的x坐标
      let nodeX: number = elementX;
      Object.assign(line, { x: elementX, y: lineY, width: elementWidth, height: lineHeight, renderWidth: 0, renderHeight: lineHeight, renderY: lineY });
      const { nodes, isTailBreak } = line;
      if (nodes.length !== 0) {
        // 行基线坐标
        const baseline = lineY - avgAlphabeticBaseline + (lineHeight - avgFontHeight) / 2;
        // 遍历节点并渲染
        iterateNodes(nodes, ctx, (node, index) => {
          const {
            fontStyle: { fontLetterSpacing },
          } = node;
          const renderContent = getTextCaseContent(node, index, line, lineIndex, textCase, textData);
          node.renderContent = renderContent;
          // 字体度量
          const metrics = ctx.measureText(renderContent);
          // 字体宽度和基线值
          const { width: renderWidth, fontBoundingBoxDescent, fontBoundingBoxAscent, alphabeticBaseline } = metrics;
          // 缩进值（通常为负值）
          const indentX = calcTextNodeIndenX(node, index, metrics, nodes, ctx);
          // 字符间距(注意此处的字符间距是原始值，需要乘以缩放比例)
          const spaceWidth = fontLetterSpacing * CanvasUtils.scale;
          // 字符占用最大宽度
          const maxWidth = renderWidth + spaceWidth;
          // 文本节点的x坐标
          const x = nodeX + indentX;
          // 文本节点的y坐标（等于行的基线坐标加上文本的基线坐标）
          const y = baseline + alphabeticBaseline;
          // 更新文本节点关于位置和尺寸的属性
          Object.assign(node, {
            x,
            y: lineY,
            width: maxWidth,
            height: lineHeight,
            indentX,
            renderX: x,
            renderY: y,
            renderWidth,
            renderHeight: fontBoundingBoxDescent - fontBoundingBoxAscent,
            fontBoundingBoxDescent,
            fontBoundingBoxAscent,
            baseline,
          });
          // 更新前一个文本节点的x坐标
          nodeX = x + maxWidth;
          // 更新当前行的宽度
          lineWidth += maxWidth + indentX;
          // 如果是最后一个文本节点，更新当前行的宽度
          if (index === line.nodes.length - 1) {
            // 更新当前行的宽度
            line.renderWidth = lineWidth;
          }
          // 如果是左对齐，则绘制文本，如果是右对齐或者居中对齐，则此次循环是为了计算行宽，需要另外一个新的循环来绘制文本
          if (textAlign === "left") {
            ctx.fillText(renderContent, x, y);
            drawTextDecoration(ctx, node);
          }
        });
        if (textAlign === "right") {
          // 如果是右对齐那么行左侧会有缩进，需要减去缩进
          nodeX = elementX + elementWidth - lineWidth;
        } else if (textAlign === "center") {
          // 如果是居中对齐那么行左侧、右侧都会有缩进，需要减去缩进
          nodeX = elementX + elementWidth / 2 - lineWidth / 2;
        }
        if (textAlign !== "left") {
          line.renderX = nodeX;
          iterateNodes(nodes, ctx, node => {
            const { renderY, width, renderWidth, indentX, renderContent } = node;
            const renderX = nodeX + indentX + width - renderWidth;
            Object.assign(node, {
              x: nodeX,
              renderX,
            });
            ctx.fillText(renderContent, renderX, renderY);
            drawTextDecoration(ctx, node);
            nodeX += width + indentX;
          });
        }
      }
      line.height = lineHeight;
      lineY += lineHeight;
      // isTailBreak表示是否是段落尾部，如果是则需要加上段落间距
      if (isTailBreak) {
        lineY += paragraphSpacing;
      }
    });
    ctx.restore();
  }

  /**
   * 绘制中心点需要缩放的文本
   *
   * @param target
   * @param textData
   * @param points
   * @param rect
   * @param fontStyle
   * @param options
   */
  static drawRotateTextWithScale(target: HTMLCanvasElement, textData: ITextData, points: IPoint[], renderRect: RenderRect, fontStyle: FontStyle, options: RenderParams = {}) {
    points = CommonUtils.scalePoints(points, CanvasUtils.scale);
    fontStyle = CanvasUtils.transFontWithScale(fontStyle);
    CanvasUtils.drawRotateText(target, textData, points, renderRect, fontStyle, options);
  }

  /**
   * 绘制一个旋转的文字
   *
   * @param target
   * @param text
   * @param center
   * @param styles
   * @param options
   */
  static drawCommonRotateText(target: HTMLCanvasElement, text: string, center: IPoint, styles: ElementStyles, options: RenderParams = {}): void {
    const { angle = 0 } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(MathUtils.angleToRadian(angle));
    ctx.font = StyleUtils.joinFont(styles);
    ctx.fillStyle = StyleUtils.joinFillColor(styles.text[0]);
    ctx.textAlign = styles.textAlign;
    ctx.textBaseline = styles.textBaseline;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  /**
   * 测量文本
   *
   * @param target
   * @param text
   * @param center
   * @param styles
   * @param options
   */
  static measureText(ctx: CanvasRenderingContext2D, text: string, styles: ElementStyles): TextMetrics {
    ctx.save();
    ctx.font = StyleUtils.joinFont(styles);
    ctx.textAlign = styles.textAlign;
    ctx.textBaseline = styles.textBaseline;
    const result = ctx.measureText(text);
    ctx.restore();
    return result;
  }

  /**
   * 绘制中心点需要缩放的文本
   *
   * @param target
   * @param text
   * @param center
   * @param styles
   * @param options
   */
  static drawCommonRotateTextWithScale(target: HTMLCanvasElement, text: string, center: IPoint, styles: ElementStyles, options: RenderParams = {}) {
    center = CommonUtils.scalePoint(center, CanvasUtils.scale);
    CanvasUtils.drawCommonRotateText(target, text, center, styles, options);
  }

  /**
   * 线宽缩放
   *
   * @param strokeStyle
   * @returns
   */
  static transStrokeWithScale(strokeStyle: StrokeStyle): StrokeStyle {
    if (CanvasUtils.scale === 1) return strokeStyle;
    return {
      ...strokeStyle,
      width: strokeStyle.width * CanvasUtils.scale,
    };
  }

  /**
   * 字体缩放
   *
   * @param fontStyle
   * @returns
   */
  static transFontWithScale(fontStyle: FontStyle): FontStyle {
    if (CanvasUtils.scale === 1) return fontStyle;
    return {
      ...fontStyle,
      fontSize: fontStyle.fontSize * CanvasUtils.scale,
      fontLineHeight: fontStyle.fontLineHeight * CanvasUtils.scale,
      paragraphSpacing: fontStyle.paragraphSpacing * CanvasUtils.scale,
    };
  }

  /**
   * 曲线参数缩放
   *
   * @param arcPoints
   * @param strokeStyle
   * @returns
   */
  static transArcParamsWithScale(arcPoints: ArcPoints[], strokeStyle?: StrokeStyle): [ArcPoints[], StrokeStyle] {
    if (CanvasUtils.scale === 1) return [arcPoints, strokeStyle];
    arcPoints = CanvasUtils.scaleArcPoints(arcPoints);
    if (strokeStyle) {
      strokeStyle = {
        ...strokeStyle,
        width: strokeStyle.width * CanvasUtils.scale,
      };
    }
    return [arcPoints, strokeStyle];
  }

  /**
   * 椭圆模型缩放
   *
   * @param ellipseModel
   * @returns
   */
  static transEllipseModelWithScale(ellipseModel: EllipseModel) {
    if (CanvasUtils.scale === 1) return ellipseModel;
    return {
      ...ellipseModel,
      rx: ellipseModel.rx * CanvasUtils.scale,
      ry: ellipseModel.ry * CanvasUtils.scale,
    };
  }

  /**
   * 绘制路径
   *
   * @param target
   * @param points
   * @param fillStyle
   * @param strokeStyle
   * @param options
   */
  static drawPathWithScale(target: HTMLCanvasElement, points: IPoint[], fillStyle: FillStyle, strokeStyle: StrokeStyle, options: RenderParams = {}): void {
    points = CommonUtils.scalePoints(points, CanvasUtils.scale);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    if (fillStyle.colorOpacity) {
      CanvasUtils.drawInnerPathFill(target, points, fillStyle, strokeStyle, options);
    }
    if (strokeStyle.width && strokeStyle.colorOpacity) {
      CanvasUtils.drawPathStroke(target, points, strokeStyle, options);
    }
  }

  /**
   * 绘制路径
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawInnerPathFill(target: HTMLCanvasElement, points: IPoint[], fillStyle: FillStyle, strokeStyle: StrokeStyle, options: RenderParams = {}): void {
    const { calcVertices = true } = options;
    let innerPoints: IPoint[];
    if (calcVertices) {
      innerPoints = ArbitraryUtils.getArbitraryInnerVertices(points, strokeStyle.width / 2, options);
    } else {
      innerPoints = points;
    }
    CanvasUtils.drawPathFill(target, innerPoints, fillStyle);
  }

  /**

  /**
   * 绘制内填充
   *
   * @param target
   * @param points
   * @param fillStyle
   * @param strokeStyle
   * @param options
   */
  static drawInnerPathFillWithScale(target: HTMLCanvasElement, points: IPoint[], fillStyle: FillStyle, strokeStyle: StrokeStyle, options: RenderParams = {}): void {
    points = CommonUtils.scalePoints(points, CanvasUtils.scale);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    if (fillStyle.colorOpacity) {
      CanvasUtils.drawInnerPathFill(target, points, fillStyle, strokeStyle, options);
    }
  }

  /**
   * 缩放曲线点数组
   *
   * @param arcPoints
   * @param scale
   * @returns
   */
  static scaleArcPoints(arcPoints: ArcPoints[]) {
    if (CanvasUtils.scale === 1) return arcPoints;
    arcPoints = arcPoints.map(arc => {
      const { start, controller, end, value, corner } = arc;
      const [p1, p2, p3, p4] = CommonUtils.scalePoints([start, controller, end, corner], CanvasUtils.scale);
      return {
        start: p1,
        controller: p2,
        end: p3,
        corner: p4,
        value: value * CanvasUtils.scale,
      };
    });
    return arcPoints;
  }

  /**
   * 绘制曲线内填充
   *
   * @param target
   * @param arcPoints
   * @param fillStyle
   * @param options
   */
  static drawInnerArcPathFillWithScale(target: HTMLCanvasElement, renderRect: RenderRect, arcPoints: ArcPoints[], fillStyle: FillStyle, options: RenderParams = {}): void {
    arcPoints = CanvasUtils.scaleArcPoints(arcPoints);
    if (fillStyle.colorOpacity) {
      CanvasUtils.drawArcPathFill(target, arcPoints, renderRect, fillStyle, options);
    }
  }

  /**
   * 绘制描边
   *
   * @param target
   * @param points
   * @param styles
   */
  static drawPathStrokeWidthScale(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle, options: RenderParams = {}) {
    points = CommonUtils.scalePoints(points, CanvasUtils.scale);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    CanvasUtils.drawPathStroke(target, points, strokeStyle, options);
  }

  /**
   * 绘制曲线描边
   * 绘制曲线描边
   *
   * @param target
   * @param arcPoints
   * @param strokeStyle
   * @param options
   */
  static drawArcPathStrokeWidthScale(target: HTMLCanvasElement, arcPoints: ArcPoints[], renderRect: RenderRect, strokeStyle: StrokeStyle, options: RenderParams = {}) {
    [arcPoints, strokeStyle] = CanvasUtils.transArcParamsWithScale(arcPoints, strokeStyle);
    CanvasUtils.drawArcPathStroke(target, arcPoints, renderRect, strokeStyle, options);
  }

  /**
   * 绘制描边形状
   *
   * @param target
   * @param points
   * @param styles
   * @param options
   */
  static drawPathStroke(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle, options: RenderParams = {}) {
    const { isFold = true, miterLimit } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    if (miterLimit) {
      ctx.miterLimit = miterLimit;
    }
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    isFold && ctx.closePath();
    // 即使线宽为0，但若是调用了stroke()方法，也会绘制出边框
    if (strokeStyle.width) {
      ctx.lineWidth = strokeStyle.width;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 计算曲线起点
   *
   * @param arcPoints
   * @returns
   */
  static calcStartOfArcPoints(arcPoints: ArcPoints[]): {
    point: IPoint;
    index: number;
  } {
    let index = 0;
    let point: IPoint;
    const [A, B, C] = arcPoints;
    const controllers = arcPoints.map(arc => arc.controller);
    const { width, height } = MathUtils.calcParallelogramVerticalSize(controllers);
    if (width >= height) {
      point = MathUtils.calcCenter([A.end, B.start]);
      index = 1;
    } else {
      point = MathUtils.calcCenter([B.end, C.start]);
      index = 2;
    }
    return { point, index };
  }

  /**
   * 将曲线点转换为贝塞尔曲线
   *
   * @param arcPoints
   * @param ctx
   *
   * @deprecated 此圆角绘制在组件y轴倾斜状态下不美观~
   */
  static arcToBezierPoints(arcPoints: ArcPoints[], ctx: CanvasRenderingContext2D) {
    let { point, index } = CanvasUtils.calcStartOfArcPoints(arcPoints);
    // 从index开始绘制
    let counter = 0;
    let current = arcPoints[index];
    while (current) {
      const { start, controller, end, corner, value } = current;
      if (counter === 0) {
        ctx.moveTo(point.x, point.y);
      }
      if (value) {
        const r = MathUtils.calcDistance(start, corner);
        ctx.arcTo(controller.x, controller.y, end.x, end.y, r);
      } else {
        ctx.lineTo(controller.x, controller.y);
      }
      current = CommonUtils.getNextOfArray(arcPoints, index, 1);
      index++;
      if (index >= arcPoints.length) {
        index = 0;
      }
      counter++;
      if (counter >= arcPoints.length) {
        break;
      }
    }
  }

  /**
   * 绘制二次贝塞尔曲线
   *
   * @param arcPoints
   * @param ctx
   */
  static drawBazierPoints(arcPoints: ArcPoints[], ctx: CanvasRenderingContext2D) {
    arcPoints.forEach((arc, index) => {
      const { start, controller, end, value } = arc;
      if (index === 0) {
        ctx.moveTo(start.x, start.y);
      } else {
        ctx.lineTo(start.x, start.y);
      }
      if (value) {
        ctx.arcTo(controller.x, controller.y, end.x, end.y, value);
      } else {
        ctx.lineTo(controller.x, controller.y);
      }
    });
  }

  /**
   * 绘制曲线描边
   *
   * @param target
   * @param arcPoints
   * @param strokeStyle
   * @param options
   */
  static drawArcPathStroke(target: HTMLCanvasElement, arcPoints: ArcPoints[], renderRect: RenderRect, strokeStyle: StrokeStyle, options: RenderParams = {}) {
    const { isFold = true } = options;
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, renderRect, CanvasUtils.getTransformValues(options));
    ctx.miterLimit = 0;
    ctx.lineCap = "round";
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.beginPath();
    arcPoints = CanvasUtils.translateArcPoints(arcPoints, renderRect);
    CanvasUtils.drawBazierPoints(arcPoints, ctx);
    isFold && ctx.closePath();
    // 即使线宽为0，但若是调用了stroke()方法，也会绘制出边框
    if (strokeStyle.width) {
      ctx.lineWidth = strokeStyle.width;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 绘制填充形状
   *
   * @param target
   * @param points
   * @param styles
   */
  static drawPathFill(target: HTMLCanvasElement, points: IPoint[], fillStyle: FillStyle) {
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 绘制贝塞尔曲线填充
   *
   * @param target
   * @param arcPoints
   * @param fillStyle
   */
  static drawArcPathFill(target: HTMLCanvasElement, arcPoints: ArcPoints[], renderRect: RenderRect, fillStyle: FillStyle, options: RenderParams = {}) {
    const ctx = target.getContext("2d");
    ctx.save();
    CanvasUtils.transformCtx(ctx, renderRect, CanvasUtils.getTransformValues(options));
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
    ctx.beginPath();
    arcPoints = CanvasUtils.translateArcPoints(arcPoints, renderRect);
    CanvasUtils.drawBazierPoints(arcPoints, ctx);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 变换椭圆
   *
   * @param ctx
   * @param point
   * @param model
   * @param rect
   * @param options
   */
  static transformEllipse(ctx: CanvasRenderingContext2D, point: IPoint, model: EllipseModel, rect?: RenderRect, options?: RenderParams): { point: IPoint; model: EllipseModel } {
    if (rect && options) {
      CanvasUtils.transformCtx(ctx, rect, CanvasUtils.getTransformValues(options));
      point = CanvasUtils.transPointsOfBox([point], rect)[0];
    }
    model = CanvasUtils.transEllipseModelWithScale(model);
    return { point, model };
  }

  /**
   * 绘制填充圆形
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseFill(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, fillStyle: FillStyle, rect?: RenderRect, options?: RenderParams) {
    const ctx = target.getContext("2d");
    ctx.save();
    const {
      point: { x, y },
      model: { rx, ry },
    } = CanvasUtils.transformEllipse(ctx, point, model, rect, options);
    ctx.fillStyle = StyleUtils.joinFillColor(fillStyle);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 绘制描边圆形
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseStroke(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, strokeStyle: StrokeStyle, rect?: RenderRect, options?: RenderParams) {
    const ctx = target.getContext("2d");
    ctx.save();
    const {
      point: { x, y },
      model: { rx, ry },
    } = CanvasUtils.transformEllipse(ctx, point, model, rect, options);
    ctx.lineWidth = strokeStyle.width;
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 需要缩放的圆形描边
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseStrokeWithScale(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, strokeStyle: StrokeStyle, rect?: RenderRect, options?: RenderParams) {
    const points = CommonUtils.scalePoints([point], CanvasUtils.scale);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    CanvasUtils.drawEllipseStroke(target, points[0], model, strokeStyle, rect, options);
  }

  /**
   * 需要缩放的圆形填充
   *
   * @param target
   * @param point
   * @param corner
   * @param styles
   */
  static drawEllipseFillWithScale(target: HTMLCanvasElement, point: IPoint, model: EllipseModel, fillStyle: FillStyle, rect?: RenderRect, options?: RenderParams) {
    const points = CommonUtils.scalePoints([point], CanvasUtils.scale);
    CanvasUtils.drawEllipseFill(target, points[0], model, fillStyle, rect, options);
  }

  /**
   * 绘制线段
   *
   * @param ctx
   * @param points
   * @param styles
   */
  static drawLine(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle) {
    const ctx = target.getContext("2d");
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = strokeStyle.width;
    ctx.strokeStyle = StyleUtils.joinStrokeColor(strokeStyle);
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 绘制线段
   *
   * @param target
   * @param points
   * @param styles
   */
  static drawLineWidthScale(target: HTMLCanvasElement, points: IPoint[], strokeStyle: StrokeStyle) {
    points = CommonUtils.scalePoints(points, CanvasUtils.scale);
    strokeStyle = CanvasUtils.transStrokeWithScale(strokeStyle);
    CanvasUtils.drawLine(target, points, strokeStyle);
  }

  /**
   * 将blob转换为ImageData
   *
   * @param blob
   * @returns
   */
  static getImageDataFromBlob(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * 从图片组件中提取ImageData
   *
   * @param image
   * @returns
   */
  static getImageDataFromImage(image: HTMLImageElement): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        resolve(ctx.getImageData(0, 0, image.width, image.height));
      } else {
        reject(new Error("Failed to get 2d context from canvas"));
      }
    });
  }

  /**
   * 将ImageData转换为canvas
   *
   * @param imageData
   * @returns
   */
  static getCanvasByImageData(imageData: ImageData): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
  }

  /**
   * 从图片组件中提取DataURL
   *
   * @param image
   * @returns
   */
  static getDataUrlFromImage(image: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        resolve(canvas.toDataURL());
      } else {
        reject(new Error("Failed to get 2d context from canvas"));
      }
    });
  }

  /**
   * 计算圆角矩形路径
   *
   * @param radiuses 圆角值, 顺时针,从左上角开始到左下角
   * @param width
   * @param height
   * @param center 中心点坐标
   */
  static getRadiusRectanglePaths(radiuses: number[], width: number, height: number, center?: IPoint): ArcPoints[] {
    const hWidth = width / 2;
    const hHeight = height / 2;
    center = center || { x: hWidth, y: hHeight };
    const { x: cX, y: cY } = center;
    // 圆角半径
    const [tfR, trR, brR, blR] = radiuses;
    // 左上角控制点
    const topLeftController = { x: cX - hWidth, y: cY - hHeight };
    // 右上角控制点
    const topRightController = { x: cX + hWidth, y: cY - hHeight };
    // 右下角控制点
    const bottomRightController = { x: cX + hWidth, y: cY + hHeight };
    // 左下角控制点
    const bottomLeftController = { x: cX - hWidth, y: cY + hHeight };
    const result: ArcPoints[] = [];
    // 一下按照顺时针计算start\end坐标
    // 左上角
    result.push({
      start: { x: cX - hWidth, y: cY - hHeight + tfR },
      controller: topLeftController,
      end: { x: cX - hWidth + tfR, y: cY - hHeight },
      value: tfR,
    });
    // 右上角
    result.push({
      start: { x: cX + hWidth - trR, y: cY - hHeight },
      controller: topRightController,
      end: { x: cX + hWidth, y: cY - hHeight + trR },
      value: trR,
    });
    // 右下角
    result.push({
      start: { x: cX + hWidth, y: cY + hHeight - brR },
      controller: bottomRightController,
      end: { x: cX + hWidth - brR, y: cY + hHeight },
      value: brR,
    });
    // 左下角
    result.push({
      start: { x: cX - blR, y: cY + hHeight },
      controller: bottomLeftController,
      end: { x: cX - hWidth, y: cY + hHeight - blR },
      value: blR,
    });
    return result;
  }
}
