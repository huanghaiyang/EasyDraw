import { ElementStatus, IPoint } from "@/types/index";
import IElementTransformer, { IElementBorderTransformer } from "@/types/IElementTransformer";
import { CreatorTypes } from "@/types/Creator";
import { ElementStyles, StrokeTypes } from "@/types/ElementStyles";
import IElementRotation from "@/types/IElementRotation";
import IStageShield from "@/types/IStageShield";

// 舞台元素数据模型
export type ElementObject = {
  id: string;
  coords: IPoint[]; // 相对于世界中心的坐标
  type: CreatorTypes;
  data: any;
  angle: number;
  name: string;
  width: number;
  height: number;
  length?: number;
  styles: ElementStyles;
  left: number;
  top: number;
  isRatioLocked: boolean;
  ratio?: number;
  matrix?: number[][];
}

// 图片元素数据模型
export type ImageElementObject = ElementObject & {
  colorSpace: string;
  naturalWidth: number;
  naturalHeight: number;
}

// 舞台元素（组件）
export default interface IElement {
  id: string;
  model: ElementObject;
  rotation: IElementRotation;
  shield: IStageShield;

  get widthModifyEnable(): boolean;
  get heightModifyEnable(): boolean;
  get rotationEnable(): boolean;
  get verticesRotationEnable(): boolean;
  get verticesTransformEnable(): boolean;
  get borderTransformEnable(): boolean;
  get fillEnabled(): boolean;
  get strokeEnable(): boolean;
  get ratioLockedEnable(): boolean;
  get shouldRatioLockResize(): boolean;

  get width(): number;
  get height(): number;
  get angle(): number;
  get position(): IPoint;
  get strokeType(): StrokeTypes;
  get strokeWidth(): number;
  get strokeColor(): string;
  get strokeColorOpacity(): number;
  get fillColor(): string;
  get fillColorOpacity(): number;
  get textAlign(): CanvasTextAlign;
  get textBaseline(): CanvasTextBaseline;
  get fontSize(): number;
  get fontFamily(): string;

  get originalModelCoords(): IPoint[];
  get points(): IPoint[]; // 相对于舞台画布的坐标(此坐标是绘制是鼠标的路径坐标)
  get pathPoints(): IPoint[]; // 相对于舞台画布的坐标
  get maxBoxPoints(): IPoint[];
  get rotatePoints(): IPoint[];
  get rotatePathPoints(): IPoint[];
  get rotateOutlinePathPoints(): IPoint[];
  get maxOutlineBoxPoints(): IPoint[];
  get rotateOutlinePathCoords(): IPoint[];
  get centroid(): IPoint;
  get centroidCoord(): IPoint;
  get transformers(): IElementTransformer[];
  get borderTransformers(): IElementBorderTransformer[];
  get rect(): Partial<DOMRect>;

  get isSelected(): boolean;
  get isVisible(): boolean;
  get isEditing(): boolean;
  get isLocked(): boolean;
  get isMoving(): boolean;
  get isTransforming(): boolean;
  get isRotating(): boolean;
  get isRotatingTarget(): boolean;
  get isDragging(): boolean;
  get isProvisional(): boolean;
  get isTarget(): boolean;
  get isOnStage(): boolean;
  get isInRange(): boolean;
  get isRatioLocked(): boolean;
  get status(): ElementStatus;

  set isSelected(value: boolean);
  set isVisible(value: boolean);
  set isEditing(value: boolean);
  set isLocked(value: boolean);
  set isMoving(value: boolean);
  set isTransforming(value: boolean);
  set isRotating(value: boolean);
  set isDragging(value: boolean);
  set isProvisional(value: boolean);
  set isTarget(value: boolean);
  set isOnStage(value: boolean);
  set isInRange(value: boolean);
  set status(value: ElementStatus);

  get flipX(): boolean;
  get flipY(): boolean;

  setPosition(x: number, y: number, coords: IPoint[]): void;
  setWidth(value: number): void;
  setHeight(value: number): void;
  setAngle(value: number): void;
  setStrokeType(value: StrokeTypes): void;
  setStrokeWidth(value: number): void;
  setStrokeColor(value: string): void;
  setStrokeColorOpacity(value: number): void;
  setFillColor(value: string): void;
  setFillColorOpacity(value: number): void;
  setFontSize(value: number): void;
  setFontFamily(value: string): void;
  setTextAlign(value: CanvasTextAlign): void;
  setTextBaseline(value: CanvasTextBaseline): void;
  setRatioLocked(value: boolean): void;

  refreshSize(): void;
  refreshPosition(): void;
  refreshStagePoints(): void;
  refreshInternalProps(): void;

  isInPolygon(points: IPoint[]): boolean;
  isContainsPoint(point: IPoint): boolean;
  isPolygonOverlap(points: IPoint[]): boolean;
  isModelPolygonOverlap(points: IPoint[]): boolean;

  calcPoints(): IPoint[];
  calcPathPoints(): IPoint[];
  calcRotatePoints(): IPoint[];
  calcRotatePathPoints(): IPoint[];
  calcRotateOutlinePathPoints(): IPoint[];
  calcMaxBoxPoints(): IPoint[];
  calcMaxOutlineBoxPoints(): IPoint[];
  calcRotateOutlinePathCoords(): IPoint[];
  calcCentroid(): IPoint;
  calcCentroidCoord(): IPoint;
  calcTransformers(): IPoint[];
  calcRotateCoords(): IPoint[];
  calcRect(): Partial<DOMRect>;

  getTransformerByPoint(point: IPoint): IElementTransformer;
  getBorderTransformerByPoint(point: IPoint): IElementBorderTransformer;
  activeTransformer(transformer: IElementTransformer): void;
  activeBorderTransformer(transformer: IElementBorderTransformer): void;
  deActiveAllTransformers(): void;
  deActiveAllBorderTransformers(): void;
  getActiveElementTransformer(): IElementTransformer;
  getActiveElementBorderTransformer(): IElementBorderTransformer;
  transform(offset: IPoint): void;
  transformByVertices(offset: IPoint): void;
  transformByBorder(offset: IPoint): void;

  refreshOriginalElementProps(): void;
  refreshOriginalModelCoords(): void;
  refreshOriginalProps(): void;
}

// 舞台元素（组件）-React
export interface IElementReact extends IElement { }

// 舞台元素（组件）-圆形
export interface IElementCircle extends IElement { }

// 舞台元素（组件）-图片
export interface IElementImage extends IElementReact { }

// 舞台元素（组件）-线段
export interface IElementLine extends IElement {
  get startRotatePathPoint(): IPoint;
  get endRotatePathPoint(): IPoint;
  get outerPathPoints(): IPoint[];
  get outerPathCoords(): IPoint[];

  calcOuterPathPoints(): IPoint[];
  calcOuterPathCoords(): IPoint[];
}