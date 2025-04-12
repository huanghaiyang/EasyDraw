import { IPoint } from "@/types/index";
import { StrokeTypes, TextDecoration, TextVerticalAlign } from "@/styles/ElementStyles";
import IElement from "@/types/IElement";

export default interface IStageSetter {
  /**
   * 设置组件位置
   *
   * @param elements 要修改的元件集合
   * @param value 新的位置坐标
   */
  setElementsPosition(elements: IElement[], value: IPoint): Promise<void>;

  /**
   * 设置组件宽度
   *
   * @param elements 要修改的元件集合
   * @param value 宽度值（像素）
   */
  setElementsWidth(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件高度
   *
   * @param elements 要修改的元件集合
   * @param value 高度值（像素）
   */
  setElementsHeight(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件角度
   *
   * @param elements 要修改的元件集合
   * @param value 角度值（度）
   */
  setElementsAngle(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置圆角
   *
   * @param elements 要修改的元件集合
   * @param value 圆角值
   * @param index 圆角索引位置（从0开始）
   */
  setElementsCorners(elements: IElement[], value: number, index?: number): Promise<void>;

  /**
   * 设置组件Y倾斜角度
   *
   * @param elements 要修改的元件集合
   * @param value Y倾斜角度值（度）
   */
  setElementsLeanYAngle(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件描边类型
   *
   * @param elements 要修改的元件集合
   * @param value 描边类型
   * @param index 描边索引位置（从0开始）
   */
  setElementsStrokeType(elements: IElement[], value: StrokeTypes, index: number): Promise<void>;

  /**
   * 设置组件描边宽度
   *
   * @param elements 要修改的元件集合
   * @param value 描边宽度值（像素）
   * @param index 描边索引位置（从0开始）
   */
  setElementsStrokeWidth(elements: IElement[], value: number, index: number): Promise<void>;

  /**
   * 设置组件描边颜色
   *
   * @param elements 要修改的元件集合
   * @param value 颜色值（十六进制字符串，如#RRGGBB）
   * @param index 描边索引位置（从0开始）
   */
  setElementsStrokeColor(elements: IElement[], value: string, index: number): Promise<void>;

  /**
   * 设置组件描边颜色透明度
   *
   * @param elements 要修改的元件集合
   * @param value 透明度值（0-1）
   * @param index 描边索引位置（从0开始）
   */
  setElementsStrokeColorOpacity(elements: IElement[], value: number, index: number): Promise<void>;

  /**
   * 添加组件描边
   *
   * @param elements 要修改的元件集合
   * @param prevIndex 添加描边的索引位置（从0开始）
   */
  addElementsStroke(elements: IElement[], prevIndex: number): Promise<void>;

  /**
   * 删除组件描边
   *
   * @param elements 要修改的元件集合
   * @param index 要删除的描边索引位置（从0开始）
   */
  removeElementsStroke(elements: IElement[], index: number): Promise<void>;

  /**
   * 设置组件填充颜色
   * @param elements 要修改的元件集合
   * @param value 颜色值（十六进制字符串，如#RRGGBB）
   * @param index 填充索引位置（从0开始）
   */
  setElementsFillColor(elements: IElement[], value: string, index: number): Promise<void>;

  /**
   * 设置组件填充颜色透明度
   *
   * @param elements 要修改的元件集合
   * @param value 透明度值（0-1）
   * @param index 填充索引位置（从0开始）
   */
  setElementsFillColorOpacity(elements: IElement[], value: number, index: number): Promise<void>;

  /**
   * 添加组件填充
   *
   * @param elements 要修改的元件集合
   * @param prevIndex 添加填充的索引位置（从0开始）
   */
  addElementsFill(elements: IElement[], prevIndex: number): Promise<void>;

  /**
   * 删除组件填充
   *
   * @param elements 要修改的元件集合
   * @param index 要删除的填充索引位置（从0开始）
   */
  removeElementsFill(elements: IElement[], index: number): Promise<void>;

  /**
   * 设置组件文本对齐
   *
   * @param elements 要修改的元件集合
   * @param value 文本对齐方式
   */
  setElementsTextAlign(elements: IElement[], value: CanvasTextAlign): Promise<void>;

  /**
   * 设置文本垂直对齐方式
   *
   * @param elements 要修改的元件集合
   * @param value 文本垂直对齐方式
   */
  setElementsTextVerticalAlign(elements: IElement[], value: TextVerticalAlign): Promise<void>;

  /**
   * 设置组件文本基线
   *
   * @param elements 要修改的元件集合
   * @param value 文本基线方式
   */
  setElementsTextBaseline(elements: IElement[], value: CanvasTextBaseline): Promise<void>;

  /**
   * 设置组件字体大小
   *
   * @param elements 要修改的元件集合
   * @param value 字体大小（像素）
   */
  setElementsFontSize(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件字体
   *
   * @param elements 要修改的元件集合
   * @param value 字体名称
   */
  setElementsFontFamily(elements: IElement[], value: string): Promise<void>;

  /**
   * 设置组件字体行高
   *
   * @param elements 要修改的元件集合
   * @param value 字体行高
   */
  setElementsFontLineHeight(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件字体颜色
   *
   * @param elements 要修改的元件集合
   * @param value 颜色值（十六进制字符串，如#RRGGBB）
   */
  setElementsFontColor(elements: IElement[], value: string): Promise<void>;

  /**
   * 设置组件字体颜色透明度
   *
   * @param elements 要修改的元件集合
   * @param value 透明度值（0-1）
   */
  setElementsFontColorOpacity(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件字间距
   *
   * @param elements 要修改的元件集合
   * @param value 字间距
   */
  setElementsFontLetterSpacing(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件文本装饰
   *
   * @param elements 要修改的元件集合
   * @param value 文本装饰方式
   */
  setElementsTextDecoration(elements: IElement[], value: TextDecoration): Promise<void>;

  /**
   * 设置组件文本装饰颜色
   *
   * @param elements 要修改的元件集合
   * @param value 颜色值（十六进制字符串，如#RRGGBB）
   */
  setElementsTextDecorationColor(elements: IElement[], value: string): Promise<void>;

  /**
   * 设置组件文本装饰颜色透明度
   *
   * @param elements 要修改的元件集合
   * @param value 透明度值（0-1）
   */
  setElementsTextDecorationOpacity(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件文本装饰粗细
   *
   * @param elements 要修改的元件集合
   * @param value 粗细值
   */
  setElementsTextDecorationThickness(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件段落间距
   *
   * @param elements 要修改的元件集合
   * @param value 段落间距
   */
  setElementsParagraphSpacing(elements: IElement[], value: number): Promise<void>;

  /**
   * 设置组件比例锁定

   * @param elements 要修改的元件集合
   * @param value 是否锁定比例
   */
  setElementsRatioLocked(elements: IElement[], value: boolean): Promise<void>;

  /**
   * 组件上移
   *
   * @param elements 要修改的元件集合
   */
  setElementsShiftMove(elements: IElement[]): Promise<void>;

  /**
   * 组件下移
   *
   * @param elements 要修改的元件集合
   */
  setElementsGoDown(elements: IElement[]): Promise<void>;
}
