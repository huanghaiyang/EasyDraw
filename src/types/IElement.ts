/**
 * 约定：
 * points表示舞台坐标
 * coords表示相对于世界中心的坐标
 */
import { ElementStatus, IPoint } from "@/types/index";
import { CreatorTypes } from "@/types/Creator";
import { ElementStyles, StrokeTypes } from "@/styles/ElementStyles";
import IElementRotation from "@/types/IElementRotation";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/ITransformer";
import { IBorderTransformer } from "@/types/ITransformer";
import { IVerticesTransformer } from "@/types/ITransformer";
import { IElementGroup } from "@/types/IElementGroup";

// 舞台元素数据模型
export type ElementObject = {
  // 元素id
  id: string;
  // 元素坐标
  coords?: IPoint[];
  // 盒模型坐标
  boxCoords?: IPoint[];
  // 元素类型
  type?: CreatorTypes;
  // 元素数据
  data?: any;
  // 旋转角度
  angle?: number;
  // 元素名称
  name?: string;
  // 宽度
  width?: number;
  // 高度
  height?: number;
  // 长度
  length?: number;
  // 样式
  styles?: ElementStyles;
  // 左上角坐标
  left?: number;
  // 上边坐标
  top?: number;
  // 是否锁定比例
  isRatioLocked?: boolean;
  // 比例
  ratio?: number;
  // 变换矩阵
  matrix?: number[][];
  // 是否闭合
  isFold?: boolean;
  // 组合id
  groupId?: string;
  // 图片颜色空间
  colorSpace?: string;
  // 图片自然宽度
  naturalWidth?: number;
  // 图片自然高度
  naturalHeight?: number;
  // 子元素id集合
  subIds?: Set<string>;
}

// 舞台元素（组件）
export default interface IElement {
  // 组件ID
  id: string;
  // 组件模型
  model: ElementObject;
  // 组件旋转
  rotation: IElementRotation;
  // 舞台
  shield: IStageShield;

  // 是否是元素
  get isElement(): boolean;
  // 所属组合
  get group(): IElementGroup;
  // 是否是组合元素
  get isGroupSubject(): boolean;
  // 宽度是否可修改
  get widthModifyEnable(): boolean;
  // 高度是否可修改
  get heightModifyEnable(): boolean;
  // 旋转是否可修改
  get rotationEnable(): boolean;
  // 顶点旋转是否可修改
  get verticesRotationEnable(): boolean;
  // 顶点变换是否可修改
  get verticesTransformEnable(): boolean;
  // 盒模型顶点变换是否可修改
  get boxVerticesTransformEnable(): boolean;
  // 边框变换是否可修改
  get borderTransformEnable(): boolean;
  // 填充是否可修改
  get fillEnabled(): boolean;
  // 描边是否可修改
  get strokeEnable(): boolean;
  // 比例锁定是否可修改
  get ratioLockedEnable(): boolean;
  // 是否应该比例锁定
  get shouldRatioLockResize(): boolean;
  // 是否翻转X
  get flipXEnable(): boolean;
  // 是否翻转Y
  get flipYEnable(): boolean;
  // 是否可编辑
  get editingEnable(): boolean;
  // 是否在编辑后刷新
  get tfRefreshAfterEdChanged(): boolean;

  // 宽度
  get width(): number;
  // 高度
  get height(): number;
  // 旋转角度
  get angle(): number;
  // 位置
  get position(): IPoint;
  // 描边类型
  get strokeType(): StrokeTypes;
  // 描边宽度
  get strokeWidth(): number;
  // 描边颜色
  get strokeColor(): string;
  // 描边颜色透明度
  get strokeColorOpacity(): number;
  // 填充颜色
  get fillColor(): string;
  // 填充颜色透明度
  get fillColorOpacity(): number;
  // 文本对齐
  get textAlign(): CanvasTextAlign;
  // 文本基线
  get textBaseline(): CanvasTextBaseline;
  // 字体大小
  get fontSize(): number;
  // 字体
  get fontFamily(): string;

  // 视觉描边宽度
  get visualStrokeWidth(): number;
  // 视觉字体大小
  get visualFontSize(): number;

  // 激活的顶点索引
  get activeCoordIndex(): number;
  // 原始模型坐标
  get originalModelCoords(): IPoint[];
  // 原始模型盒模型坐标
  get originalModelBoxCoords(): IPoint[];
  // 路径点-相对于舞台画布的坐标
  get pathPoints(): IPoint[];
  // 最大盒模型顶点
  get maxBoxPoints(): IPoint[];
  // 旋转路径点
  get rotatePathPoints(): IPoint[];
  // 旋转路径坐标
  get rotatePathCoords(): IPoint[];
  // 旋转路径外框点
  get rotateOutlinePathPoints(): IPoint[];
  // 旋转盒模型顶点
  get rotateBoxPoints(): IPoint[];
  // 旋转盒模型坐标
  get rotateBoxCoords(): IPoint[];
  // 最大外框盒模型顶点
  get maxOutlineBoxPoints(): IPoint[];
  // 旋转路径外框坐标
  get rotateOutlinePathCoords(): IPoint[];
  // 描边路径点
  get strokePathPoints(): IPoint[];
  // 描边路径坐标
  get strokePathCoords(): IPoint[];
  // 中心点
  get center(): IPoint;
  // 中心点坐标
  get centerCoord(): IPoint;
  // 变换器
  get transformers(): IVerticesTransformer[];
  // 边框变换器
  get borderTransformers(): IBorderTransformer[];
  // 变换器类型
  get transformerType(): TransformerTypes;
  // 矩形
  get rect(): Partial<DOMRect>;
  // 对齐点
  get alignPoints(): IPoint[];
  // 对齐坐标
  get alignCoords(): IPoint[];
  // 对齐外框点
  get alignOutlinePoints(): IPoint[];
  // 对齐外框坐标
  get alignOutlineCoords(): IPoint[];

  // 是否选中
  get isSelected(): boolean;
  // 是否可见
  get isVisible(): boolean;
  // 是否在编辑
  get isEditing(): boolean;
  // 是否锁定
  get isLocked(): boolean;
  // 是否移动
  get isMoving(): boolean;
  // 是否变换
  get isTransforming(): boolean;
  // 是否旋转
  get isRotating(): boolean;
  // 是否旋转目标
  get isRotatingTarget(): boolean;
  // 是否拖动
  get isDragging(): boolean;
  // 是否临时
  get isProvisional(): boolean;
  // 是否目标
  get isTarget(): boolean;
  // 是否在舞台上
  get isOnStage(): boolean;
  // 是否在范围内
  get isInRange(): boolean;
  // 是否比例锁定
  get isRatioLocked(): boolean;
  // 状态
  get status(): ElementStatus;

  // 设置是否选中
  set isSelected(value: boolean);
  // 设置是否可见
  set isVisible(value: boolean);
  // 设置是否在编辑
  set isEditing(value: boolean);
  // 设置是否锁定
  set isLocked(value: boolean);
  // 设置是否移动
  set isMoving(value: boolean);
  // 设置是否变换
  set isTransforming(value: boolean);
  // 设置是否旋转
  set isRotating(value: boolean);
  // 设置是否拖动
  set isDragging(value: boolean);
  // 设置是否临时
  set isProvisional(value: boolean);
  // 设置是否目标
  set isTarget(value: boolean);
  // 设置是否在舞台上
  set isOnStage(value: boolean);
  // 设置是否在范围内
  set isInRange(value: boolean);
  // 设置状态
  set status(value: ElementStatus);

  // 是否翻转X
  get flipX(): boolean;
  // 是否翻转Y
  get flipY(): boolean;

  // 设置位置
  setPosition(x: number, y: number, offset: IPoint): void;
  // 设置宽度
  setWidth(value: number): void;
  // 设置高度
  setHeight(value: number): void;
  // 设置旋转角度
  setAngle(value: number): void;
  // 设置描边类型
  setStrokeType(value: StrokeTypes): void;
  // 设置描边宽度
  setStrokeWidth(value: number): void;
  // 设置描边颜色
  setStrokeColor(value: string): void;
  // 设置描边颜色透明度
  setStrokeColorOpacity(value: number): void;
  // 设置填充颜色
  setFillColor(value: string): void;
  // 设置填充颜色透明度
  setFillColorOpacity(value: number): void;
  // 设置字体大小
  setFontSize(value: number): void;
  // 设置字体
  setFontFamily(value: string): void;
  // 设置文本对齐
  setTextAlign(value: CanvasTextAlign): void;
  // 设置文本基线
  setTextBaseline(value: CanvasTextBaseline): void;
  // 设置比例锁定
  setRatioLocked(value: boolean): void;

  // 刷新尺寸
  refreshSize(): void;
  // 刷新位置
  refreshPosition(): void;
  // 刷新舞台点
  refreshStagePoints(): void;
  // 刷新
  refresh(): void;
  // 刷新盒模型坐标
  refreshBoxCoords(): void;
  // 是否包含点
  isContainsPoint(point: IPoint): boolean;
  // 是否多边形重叠
  isPolygonOverlap(points: IPoint[]): boolean;
  // 是否模型多边形重叠
  isModelPolygonOverlap(points: IPoint[]): boolean;
  // 计算路径点
  calcPathPoints(): IPoint[];
  // 计算旋转路径点
  calcRotatePathPoints(): IPoint[];
  // 计算旋转外框路径点
  calcRotateOutlinePathPoints(): IPoint[];
  // 计算最大盒模型顶点
  calcMaxBoxPoints(): IPoint[];
  // 计算最大外框盒模型顶点
  calcMaxOutlineBoxPoints(): IPoint[];
  // 计算旋转外框坐标
  calcRotateOutlinePathCoords(): IPoint[];
  // 计算旋转盒模型顶点
  calcRotateBoxPoints(): IPoint[];
  // 计算中心点
  calcCenter(): IPoint;
  // 计算中心点坐标
  calcCenterCoord(): IPoint;
  // 计算变换器
  calcTransformers(): IPoint[];
  // 计算顶点变换器
  calcVerticesTransformers(): IPoint[];
  // 计算盒模型顶点变换器
  calcBoxVerticesTransformers(): IPoint[];
  // 计算旋转路径坐标
  calcRotatePathCoords(): IPoint[];
  // 计算矩形
  calcRect(): Partial<DOMRect>;

  // 获取变换器
  getTransformerByPoint(point: IPoint): IVerticesTransformer;
  // 获取边框变换器
  getBorderTransformerByPoint(point: IPoint): IBorderTransformer;
  // 激活变换器
  activeTransformer(transformer: IVerticesTransformer): void;
  // 激活边框变换器
  activeBorderTransformer(transformer: IBorderTransformer): void;
  // 取消所有变换器
  deActiveAllTransformers(): void;
  // 取消所有边框变换器
  deActiveAllBorderTransformers(): void;
  // 获取激活的元素变换器
  getActiveElementTransformer(): IVerticesTransformer;
  // 获取激活的元素边框变换器
  getActiveElementBorderTransformer(): IBorderTransformer;
  // 变换
  transform(offset: IPoint): void;
  // 顶点变换
  transformByVertices(offset: IPoint): void;
  // 边框变换
  transformByBorder(offset: IPoint): void;

  // 刷新旋转
  refreshRotation(): void;
  // 刷新原始元素属性
  refreshOriginalElementProps(): void;
  // 刷新原始模型坐标
  refreshOriginalModelCoords(): void;
  // 刷新原始变换器点坐标
  refreshOriginalTransformerPoints(): void;
  // 刷新原始属性
  refreshOriginalProps(): void;
  // 刷新变换器
  refreshTransformers(): void;
}

// 舞台元素（组件）-React
export interface IElementReact extends IElement { }

// 舞台元素（组件）-圆形
export interface IElementCircle extends IElement { }

// 舞台元素（组件）-图片
export interface IElementImage extends IElementReact { }

// 舞台元素（组件）-任意多边形&线条
export interface IElementPolygon extends IElement { }

// 舞台元素（组件）-文本
export interface IElementText extends IElement { }

// 舞台元素（组件）-线段
export interface IElementLine extends IElement {
  // 开始旋转路径点
  get startRotatePathPoint(): IPoint;
  // 结束旋转路径点
  get endRotatePathPoint(): IPoint;
  // 外框点
  get outerPathPoints(): IPoint[];
  // 外框坐标
  get outerPathCoords(): IPoint[];

  // 计算外框点
  calcOuterPathPoints(): IPoint[];
  // 计算外框坐标
  calcOuterPathCoords(): IPoint[];
}

// 舞台元素（组件）-任意多边形&线条
export interface IElementArbitrary extends IElement {
  // 尾点索引
  tailCoordIndex: number;
  // 编辑点索引
  editingCoordIndex: number;

  // 外框路径
  get outerPaths(): IPoint[][];
  // 外框世界路径
  get outerWorldPaths(): IPoint[][];

  // 计算外框路径
  calcOuterPaths(): IPoint[][];
  // 计算外框世界路径
  calcOuterWorldPaths(): IPoint[][];

  // 激活编辑点
  activeEditingCoord(index: number): void;
  // 取消编辑点
  deActiveEditingCoord(): void;
}