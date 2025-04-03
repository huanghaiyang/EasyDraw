/**
 * 约定：
 * points表示舞台坐标
 * coords表示相对于世界中心的坐标
 */
import { ElementStatus, IPoint, ISize, TextEditingStates } from "@/types/index";
import { CreatorTypes } from "@/types/Creator";
import { ElementStyles, FillStyle, StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";
import IElementRotation from "@/types/IElementRotation";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/ITransformer";
import { IBorderTransformer } from "@/types/ITransformer";
import { IVerticesTransformer } from "@/types/ITransformer";
import { IElementGroup } from "@/types/IElementGroup";
import { TransformTypes } from "@/types/Stage";
import IController, { IPointController } from "@/types/IController";
import { ArcPoints } from "@/types/IRender";
import { ILinkedNode } from "@/modules/struct/LinkedNode";
import ITextData, { ITextCursor, ITextSelection } from "@/types/IText";

// 椭圆模型
export type EllipseModel = {
  rx: number;
  ry: number;
};

// 刷新子组件选项
export type RefreshSubOptions = { subs?: boolean; deepSubs?: boolean };

// 默认刷新子组件选项
export const DefaultRefreshSubOptions: RefreshSubOptions = {
  subs: false,
  deepSubs: false,
};

// 变换参数
export type TransformByOptions = {
  // 变换器类型
  transformType: TransformTypes;
  // 不动点
  lockCoord: IPoint;
  // 不动点索引
  lockIndex: number;
  // 当前拖动的点的原始位置
  originalMovingCoord: IPoint;
  // 偏移量
  offset: IPoint;
  // 组合角度
  groupAngle: number;
  // 组合Y倾斜角度
  groupLeanYAngle: number;
};

export type AngleModel = {
  // 旋转角度
  angle?: number;
  // X倾斜角度
  leanXAngle?: number;
  // Y倾斜角度
  leanYAngle?: number;
  // 内部角度
  internalAngle?: number;
  // 实际需要旋转的角度
  actualAngle?: number;
  // 视觉角度
  viewAngle?: number;
};

// 翻转模型
export type FlipModel = {
  // 是否翻转x轴
  flipX?: boolean;
  // 是否翻转y轴
  flipY?: boolean;
};

// 默认角度
export const DefaultAngleModel: AngleModel = {
  angle: 0,
  leanYAngle: 0,
  internalAngle: 90,
  actualAngle: 0,
  viewAngle: 0,
};

// 圆角模型
export type CornerModel = {
  corners?: number[];
};

export type GroupModel = {
  // 组合id
  groupId?: string;
  // 子组件id集合
  subIds?: Array<string>;
};

export type ElementModelData = ITextData | string | HTMLImageElement | ImageData;

// 默认圆角模型
export const DefaultCornerModel: CornerModel = {
  corners: [0, 0, 0, 0],
};

// 舞台组件数据模型
export type ElementObject = AngleModel &
  FlipModel &
  CornerModel &
  GroupModel &
  IPoint & {
    // 组件id
    id: string;
    // 组件坐标
    coords?: IPoint[];
    // 盒模型坐标
    boxCoords?: IPoint[];
    // 组件类型
    type?: CreatorTypes;
    // 组件数据
    data?: ElementModelData;
    // 组件名称
    name?: string;
    // 宽度
    width?: number;
    // 高度
    height?: number;
    // 长度
    length?: number;
    // 样式
    styles?: ElementStyles;
    // 是否锁定比例
    isRatioLocked?: boolean;
    // 比例
    ratio?: number;
    // 是否闭合
    isFold?: boolean;
    // 图片颜色空间
    colorSpace?: string;
    // 图片自然宽度
    naturalWidth?: number;
    // 图片自然高度
    naturalHeight?: number;
  };

// 刷新角度选项参数
export type RefreshAnglesOptions = {
  view?: boolean;
  leanY?: boolean;
  actual?: boolean;
  internal?: boolean;
};

// 默认刷新角度选项
export const DefaultRefreshAnglesOptions: RefreshAnglesOptions = {
  view: true,
  leanY: true,
  actual: true,
  internal: true,
};

// 刷新参数
export type RefreshOptions = {
  size?: boolean;
  position?: boolean;
  points?: boolean;
  rotation?: boolean;
  angles?: boolean;
  originals?: boolean;
  outline?: boolean;
  strokes?: boolean;
  corners?: boolean;
};

// 默认刷新选项
export const DefaultElementRefreshOptions: RefreshOptions = {
  size: true,
  position: true,
  points: true,
  rotation: true,
  angles: true,
  originals: true,
  outline: true,
  strokes: true,
  corners: true,
};

// 舞台组件（组件）
export default interface IElement {
  // 组件模型
  model: ElementObject;
  // 组件旋转
  rotation: IElementRotation;
  // 舞台
  shield: IStageShield;
  // 所属节点
  node: ILinkedNode<IElement>;

  get isRangeElement(): boolean;
  // 组件ID
  get id(): string;
  // 是否是组件
  get isElement(): boolean;
  // 是否是组合
  get isGroup(): boolean;
  // 所属组合
  get group(): IElementGroup;
  // 祖先组合
  get ancestorGroup(): IElementGroup;
  // 是否是组合组件
  get isGroupSubject(): boolean;
  // 宽度是否可修改
  get widthModifyEnable(): boolean;
  // 高度是否可修改
  get heightModifyEnable(): boolean;
  // 旋转是否可修改
  get rotationEnable(): boolean;
  // 是否可以进行顶点旋转
  get verticesRotationEnable(): boolean;
  // 是否可以进行坐标变换
  get coordTransformEnable(): boolean;
  // 是否可以进行盒模型顶点变换
  get boxVerticesTransformEnable(): boolean;
  // 是否可以进行边框变换
  get borderTransformEnable(): boolean;
  // 控制器是否可见
  get transformersEnable(): boolean;
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
  // 视觉角度计算是否可用
  get viewAngleCalcEnable(): boolean;
  // y是否可倾斜
  get leanYAngleCalcEnable(): boolean;
  // y倾斜角度是否可修改
  get leanYAngleModifyEnable(): boolean;
  // 圆角是否可修改
  get cornersModifyEnable(): boolean;
  // 圆角是否展示
  get cornerEnable(): boolean;
  // 是否在编辑状态改变后刷新
  get tfRefreshAfterEdChanged(): boolean;
  // 原始旋转角度
  get originalAngle(): number;
  // 变换矩阵
  get transformMatrix(): number[][];
  // 视觉角度
  get viewAngle(): number;
  // 内夹角
  get internalAngle(): number;
  // 实际需要旋转的角度
  get actualAngle(): number;
  // 角度
  get angles(): Partial<AngleModel>;
  // 倾斜角度
  get leanY(): number;
  // 倾斜y角度
  get leanYAngle(): number;
  // 翻转
  get flip(): FlipModel;
  // 变换不动点索引
  get transformLockIndex(): number;
  // 变换不动点
  get transformLockCoord(): IPoint;
  // 变换原始拖动点
  get originalTransformMoveCoord(): IPoint;
  // 宽度
  get width(): number;
  // 高度
  get height(): number;
  // 最小内边框宽高
  get minParallelogramVerticalSize(): number;
  // 最小倾斜宽高
  get minLeanSize(): number;
  // 旋转角度
  get angle(): number;
  // 位置
  get position(): IPoint;
  // 描边样式
  get strokes(): StrokeStyle[];
  // 填充样式
  get fills(): FillStyle[];
  // 文本对齐
  get textAlign(): CanvasTextAlign;
  // 文本基线
  get textBaseline(): CanvasTextBaseline;
  // 字体是否启用
  get fontEnable(): boolean;
  // 字体大小
  get fontSize(): number;
  // 字体
  get fontFamily(): string;
  // 字体行高
  get fontLineHeight(): number;
  // 字体颜色
  get fontColor(): string;
  // 字体颜色透明度
  get fontColorOpacity(): number;
  // 圆角
  get corners(): number[];

  // 是否最顶层
  get isTopmost(): boolean;
  // 是否最底层
  get isBottommost(): boolean;

  // 是否在多选中（舞台多选，如果当前组件是组合或者子组件，那么当选中组合时，子组件也是选中状态，此属性也会放回true）
  get isInMultiSelected(): boolean;
  // 当属性变化时，书否应该触发emit通知外部
  get shouldPropChangedEmit(): boolean;

  // 视觉描边宽度
  get visualStrokeWidth(): number;
  // 视觉字体大小
  get visualFontSize(): number;
  // 激活的顶点索引
  get activeCoordIndex(): number;
  // 原始模型坐标
  get originalCoords(): IPoint[];
  // 原始模型盒模型坐标
  get originalBoxCoords(): IPoint[];
  // 最大盒模型顶点
  get maxBoxCoords(): IPoint[];
  // 旋转路径坐标
  get rotateCoords(): IPoint[];
  // 旋转盒模型坐标
  get rotateBoxCoords(): IPoint[];
  // 非倾斜坐标
  get unLeanCoords(): IPoint[];
  // 非倾斜盒模型坐标
  get unLeanBoxCoords(): IPoint[];
  // 最大外框盒模型顶点
  get maxOutlineBoxCoords(): IPoint[];
  // 旋转路径外框坐标
  get rotateOutlineCoords(): IPoint[][];
  // 描边路径坐标
  get strokeCoords(): IPoint[][];
  // 不倾斜描边路径坐标
  get unLeanStrokeCoords(): IPoint[][];
  // 中心内边框线段索引
  get innermostStrokeCoordIndex(): number;
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
  // 对齐坐标
  get alignCoords(): IPoint[];
  // 对齐外框坐标
  get alignOutlineCoords(): IPoint[][];
  // 控制器
  get controllers(): IController[];
  // 旋转控制器
  get rotateControllers(): IController[];

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
  // 是否修改圆角
  get isCornerMoving(): boolean;
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
  // 设置是否旋转目标
  set isRotatingTarget(value: boolean);
  // 设置是否拖动
  set isDragging(value: boolean);
  // 设置是否修改圆角
  set isCornerMoving(value: boolean);
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
  // 设置原始旋转角度
  set originalAngle(value: number);

  // 是否翻转X
  get flipX(): boolean;
  // 是否翻转Y
  get flipY(): boolean;
  // 变换器类型
  get transformType(): TransformTypes;

  /**
   * 设置位置
   * @param x 新的x坐标
   * @param y 新的y坐标
   * @param offset 偏移量
   */
  setPosition(x: number, y: number, offset: IPoint): void;

  /**
   * 设置宽度
   * @param value 宽度值（像素）
   */
  setWidth(value: number): number[][];

  /**
   * 设置高度
   * @param value 高度值（像素）
   */
  setHeight(value: number): number[][];

  /**
   * 设置旋转角度
   * @param value 旋转角度值（度）
   */
  setAngle(value: number): void;

  /**
   * 设置Y倾斜角度
   * @param value Y倾斜角度值（度）
   */
  setLeanYAngle(value: number): void;

  /**
   * 设置圆角
   * @param value 圆角值
   * @param index 圆角索引位置（从0开始）
   */
  setCorners(value: number, index?: number): void;

  /**
   * 设置描边类型
   * @param value 描边类型值
   * @param index 描边索引位置（从0开始）
   */
  setStrokeType(value: StrokeTypes, index: number): void;

  /**
   * 设置描边宽度
   * @param value 描边宽度值（像素）
   * @param index 描边索引位置（从0开始）
   */
  setStrokeWidth(value: number, index: number): void;

  /**
   * 设置描边颜色
   * @param value 颜色值（十六进制字符串，如#RRGGBB）
   * @param index 描边索引位置（从0开始）
   */
  setStrokeColor(value: string, index: number): void;

  /**
   * 设置描边颜色透明度
   * @param value 透明度值（0-1）
   * @param index 描边索引位置（从0开始）
   */
  setStrokeColorOpacity(value: number, index: number): void;

  /**
   * 添加描边
   * @param prevIndex 新描边要插入的索引位置（从0开始）
   */
  addStroke(prevIndex: number): void;

  /**
   * 删除描边
   * @param index 要删除的描边索引位置（从0开始）
   * @throws 当索引超出范围时抛出错误
   */
  removeStroke(index: number): void;

  /**
   * 设置填充颜色
   * @param value 颜色值（十六进制字符串，如#RRGGBB）
   * @param index 填充索引位置（从0开始）
   */
  setFillColor(value: string, index: number): void;

  /**
   * 设置填充颜色透明度
   * @param value 透明度值（0-1）
   * @param index 填充索引位置（从0开始）
   */
  setFillColorOpacity(value: number, index: number): void;

  /**
   * 添加填充
   * @param prevIndex 新填充要插入的索引位置（从0开始）
   */
  addFill(prevIndex: number): void;

  /**
   * 删除填充
   * @param index 要删除的填充索引位置（从0开始）
   * @throws 当索引超出范围时抛出错误
   */
  removeFill(index: number): void;

  /**
   * 设置字体大小
   * @param value 字体大小值（像素）
   */
  setFontSize(value: number): void;

  /**
   * 设置字体
   * @param value 字体名称（如'Microsoft YaHei'）
   */
  setFontFamily(value: string): void;

  /**
   * 设置字体行高
   * @param value 字体行高值
   */
  setFontLineHeight(value: number): void;

  /**
   * 设置字体颜色
   * @param value 颜色值（十六进制字符串，如#RRGGBB）
   */
  setFontColor(value: string): void;

  /**
   * 设置字体颜色透明度
   * @param value 透明度值（0-1）
   */
  setFontColorOpacity(value: number): void;

  /**
   * 设置文本对齐
   * @param value 文本对齐值
   */
  setTextAlign(value: CanvasTextAlign): void;

  /**
   * 设置文本基线对齐方式
   * @param value 文本基线值
   */
  setTextBaseline(value: CanvasTextBaseline): void;

  /**
   * 设置比例锁定
   * @param value 是否锁定比例
   */
  setRatioLocked(value: boolean): void;

  /**
   * 拉伸
   * @param center 中心点坐标
   * @param scaleX X轴缩放值
   * @param scaleY Y轴缩放值
   * @param group 组合角度
   */
  scaleBy(center: IPoint, scaleX: number, scaleY: number, group?: Partial<AngleModel>): void;

  /**
   * 旋转
   * @param deltaAngle 旋转角度值（度）
   * @param lockCenterCoord 锁定中心点坐标
   */
  rotateBy(deltaAngle: number, lockCenterCoord: IPoint): void;

  /**
   * 刷新尺寸
   */
  refreshSize(): void;

  /**
   * 刷新位置
   */
  refreshPosition(): void;

  /**
   * 刷新坐标
   */
  refreshPoints(): void;

  /**
   * 刷新旋转
   */
  refreshRotation(): void;

  /**
   * 刷新角度
   * @param options 刷新角度选项
   */
  refreshAngles(options?: RefreshAnglesOptions): void;

  /**
   * 刷新原始角度
   */
  refreshOriginalAngle(): void;

  /**
   * 刷新圆角
   */
  refreshCorners(): void;

  /**
   * 刷新翻转状态
   */
  refreshFlipX(): void;

  /**
   * 刷新
   * @param options 刷新选项
   * @param subOptions 子选项
   */
  refresh(options?: RefreshOptions, subOptions?: { angles?: RefreshAnglesOptions }): void;

  /**
   * 是否包含点
   * @param point 点坐标
   */
  isContainsCoord(coord: IPoint): boolean;

  /**
   * 是否多边形重叠
   * @param points 多边形点坐标
   */
  isPolygonOverlap(points: IPoint[]): boolean;

  /**
   * 是否模型多边形重叠
   * @param points 模型多边形点坐标
   */
  isModelPolygonOverlap(points: IPoint[]): boolean;

  /**
   * 计算最大盒模型顶点
   */
  calcMaxBoxCoords(): IPoint[];

  /**
   * 计算最大外框盒模型顶点
   */
  calcMaxOutlineBoxCoords(): IPoint[];

  /**
   * 计算旋转外框坐标
   */
  calcRotateOutlineCoords(): IPoint[][];

  /**
   * 计算中心点坐标
   */
  calcCenterCoord(): IPoint;

  /**
   * 计算变换器
   */
  calcTransformers(): IPoint[];

  /**
   * 计算顶点变换器
   */
  calcCoordTransformers(): IPoint[];

  /**
   * 计算盒模型顶点变换器
   */
  calcBoxVerticesTransformers(): IPoint[];

  /**
   * 计算旋转控制器
   */
  calcRotateControllers(): IPoint[];

  /**
   * 计算旋转路径坐标
   */
  calcRotateCoords(): IPoint[];

  /**
   * 计算非倾斜坐标
   */
  calcUnLeanCoords(): IPoint[];

  /**
   * 计算非倾斜盒模型坐标
   */
  calcUnLeanBoxCoords(): IPoint[];

  /**
   * 计算倾斜Y角度
   */
  calcLeanYAngle(): number;

  /**
   * 计算内部角度
   */
  calcInternalAngle(): number;

  /**
   * 计算视角角度
   */
  calcViewAngle(): number;

  /**
   * 计算实际角度
   */
  calcActualAngle(): number;
  /**
   * 计算原始尺寸
   */
  calcPrimitiveSize(): ISize;
  /**
   * 获取激活的控制器
   */
  getActiveController(): IController;
  /**
   * 切换控制器激活状态
   *
   * @param controllers 控制器
   * @param isActive 激活状态
   */
  setControllersActive(controllers: IController[], isActive: boolean): void;
  /**
   * 根据点获取控制器
   *
   * @param coord 点
   * @returns 控制器
   */
  getControllerByCoord(coord: IPoint): IController;

  /**
   * 变换
   * @param offset 偏移量
   */
  transform(offset: IPoint): void;

  /**
   * 顶点变换
   * @param offset 偏移量
   */
  transformByVertices(offset: IPoint): void;

  /**
   * 边框变换
   * @param offset 偏移量
   */
  transformByBorder(offset: IPoint): void;

  /**
   * 矩阵变换
   * @param options 变换选项
   */
  transformBy(options: TransformByOptions): void;

  /**
   * 组合子组件倾斜
   * @param value 倾斜值
   * @param prevValue 前一次倾斜值
   * @param groupAngle 组合角度
   * @param center 中心点坐标
   */
  leanYBy(value: number, prevValue: number, groupAngle: number, center: IPoint): void;

  /**
   * 位移
   * @param offset 偏移量
   */
  translateBy(offset: IPoint): void;

  /**
   * 刷新旋转
   */
  refreshRotation(): void;

  /**
   * 刷新原始组件属性
   */
  refreshOriginalElementProps(): void;

  /**
   * 刷新原始变换器点坐标
   */
  refreshOriginalTransformerCoords(): void;

  /**
   * 刷新原始属性
   */
  refreshOriginalProps(): void;

  /**
   * 刷新变换器
   */
  refreshTransformers(): void;

  /**
   * 刷新圆角
   */
  refreshCorners(): void;

  /**
   * 位置变化
   */
  onPositionChanged(): void;

  /**
   * 宽度变化
   */
  onWidthChanged(): void;

  /**
   * 高度变化
   */
  onHeightChanged(): void;

  /**
   * 层级变化
   */
  onLayerChanged(): void;

  /**
   * 位移前
   */
  onTranslateBefore(): void;

  /**
   * 位移后
   */
  onTranslateAfter(): void;

  /**
   * 位移中
   */
  onTranslating(): void;

  /**
   * 旋转前
   */
  onRotateBefore(): void;

  /**
   * 旋转后
   */
  onRotateAfter(): void;

  /**
   * 旋转中
   */
  onRotating(): void;

  /**
   * 变换前
   */
  onTransformBefore(): void;

  /**
   * 变换后
   */
  onTransformAfter(): void;

  /**
   * 变换中
   */
  onTransforming(): void;

  /**
   * 角度变化
   */
  onAngleChanged(): void;

  /**
   * 倾斜角度变化
   */
  onLeanyAngleChanged(): void;

  /**
   * 圆角变化中
   */
  onCornerChanging(): void;

  /**
   * 圆角变化
   */
  onCornerChanged(): void;

  /**
   * 边框类型变化
   */
  onStrokeTypeChanged(): void;

  /**
   * 边框宽度变化
   */
  onStrokeWidthChanged(): void;

  /**
   * 边框颜色变化
   */
  onStrokeColorChanged(): void;

  /**
   * 边框颜色透明度变化
   */
  onStrokeColorOpacityChanged(): void;

  /**
   * 添加描边
   */
  onStrokeAdded(): void;

  /**
   * 删除描边
   */
  onStrokeRemoved(): void;

  /**
   * 设置填充颜色
   */
  onFillColorChanged(): void;

  /**
   * 设置填充颜色透明度
   */
  onFillColorOpacityChanged(): void;

  /**
   * 添加填充
   */
  onFillAdded(): void;

  /**
   * 删除填充
   */
  onFillRemoved(): void;

  /**
   * 设置文本对齐方式
   */
  onTextAlignChanged(): void;

  /**
   * 设置文本基线
   */
  onTextBaselineChanged(): void;

  /**
   * 设置文本字体大小
   */
  onFontSizeChanged(): void;

  /**
   * 设置文本字体
   */
  onFontFamilyChanged(): void;

  /**
   * 设置文本字体行高
   */
  onFontLineHeightChanged(): void;

  /**
   * 设置文本颜色
   */
  onFontColorChanged(): void;

  /**
   * 设置文本颜色透明度
   */
  onFontColorOpacityChanged(): void;

  /**
   * 锁定比例
   */
  onRatioLockedChanged(): void;

  /**
   * 舞台缩放、滚动、大小变化
   */
  onStageChanged(): void;

  /**
   * 转换为JSON
   */
  toJson(): Promise<ElementObject>;
  /**
   * 转换为JSON
   */
  toJson(): Promise<ElementObject>;

  /**
   * 从JSON转换
   * @param json JSON数据
   */
  fromJson(json: ElementObject): void;

  /**
   * 将组件移动之前的数据转换为json
   */
  toOriginalTranslateJson(): Promise<ElementObject>;

  /**
   * 将组件移动后的数据转换为json
   */
  toTranslateJson(): Promise<ElementObject>;

  /**
   * 将组件旋转之前的数据转换为json
   */
  toOriginalRotateJson(): Promise<ElementObject>;

  /**
   * 将组件旋转后的数据转换为json
   */
  toRotateJson(): Promise<ElementObject>;

  /**
   * 将组件原始变换数据转换为json
   */
  toOriginalTransformJson(): Promise<ElementObject>;

  /**
   * 将组件变换数据转换为json
   */
  toTransformJson(): Promise<ElementObject>;

  /**
   * 将组件原始圆角数据转换为json
   */
  toOriginalCornerJson(): Promise<ElementObject>;

  /**
   * 将组件圆角数据转换为json
   */
  toCornerJson(): Promise<ElementObject>;

  /**
   * 将组件描边数据转换为json
   */
  toStrokesJson(): Promise<ElementObject>;

  /**
   * 将组件填充数据转换为json
   */
  toFillsJson(): Promise<ElementObject>;

  /**
   * 将组件组合数据转换为json
   */
  toGroupJson(): Promise<ElementObject>;

  /**
   * 将组件样式数据转换为json
   */
  toFontStyleJson(): Promise<ElementObject>;
}

// 舞台组件（组件）-React
export interface IElementRect extends IElement {
  // 圆角控制器
  get cornerControllers(): IPointController[];
  // 圆角点
  get cornerCoords(): IPoint[];
  // 是否所有圆角半径相等
  get isAllCornerEqual(): boolean;
  // 曲线点
  get arcCoords(): ArcPoints[][];
  // 曲线填充点
  get arcFillCoords(): ArcPoints[];
  /**
   * 刷新圆角控制器
   *
   * @param indexes 刷新圆角控制器选项
   */
  refreshCornersControllers(indexes?: number[]): void;
  /**
   * 刷新圆角
   *
   * @param indexes 刷新圆角选项
   */
  refreshCornersCoords(indexes?: number[]): void;
  /**
   * 通过偏移量更新圆角
   * @param offset 偏移量
   */
  updateCornerByOffset(offset: IPoint): void;
}

// 舞台组件（组件）-圆形
export interface IElementEllipse extends IElement {}

// 舞台组件（组件）-图片
export interface IElementImage extends IElementRect {}

// 舞台组件（组件）-任意多边形&线条
export interface IElementPolygon extends IElement {}

// 舞台组件（组件）-文本
export interface IElementText extends IElement {
  // 文本光标
  get textCursor(): ITextCursor;
  // 文本选区
  get textSelection(): ITextSelection;
  // 文本选区是否可用
  get isSelectionAvailable(): boolean;
  // 文本光标是否可见
  get isCursorVisible(): boolean;
  // 文本
  get text(): string;
  // 刷新文本光标
  refreshTextCursorAtPosition(point: IPoint, isSelectionMove?: boolean): void;
  // 刷新文本光标
  refreshTextCursors(): void;
  // 更新文本
  updateText(value: string, states: TextEditingStates): boolean;
  // 重新排版文本
  reflowText(force?: boolean): void;
  // 刷新文本框
  reCalcSizeAndCoords(): void;
}

// 舞台组件（组件）-线段
export interface IElementLine extends IElement {
  // 开始旋转路径点
  get startRotateCoord(): IPoint;
  // 结束旋转路径点
  get endRotateCoord(): IPoint;
  // 外框坐标
  get outerCoords(): IPoint[][];
  /**
   * 计算外框坐标
   */
  calcOuterCoords(): IPoint[][];
}

// 舞台组件（组件）-任意多边形&线条
export interface IElementArbitrary extends IElement {
  // 尾点索引
  tailCoordIndex: number;
  // 编辑点索引
  editingCoordIndex: number;

  // 外框世界路径
  get outerWorldPaths(): IPoint[][][];

  /**
   * 计算外框世界路径
   */
  calcOuterWorldPaths(): IPoint[][][];

  /**
   * 激活编辑点
   * @param index 编辑点索引
   */
  activeEditingCoord(index: number): void;

  /**
   * 取消编辑点
   */
  deActiveEditingCoord(): void;
}
