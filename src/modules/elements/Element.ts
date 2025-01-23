import { ElementStatus, IPoint } from "@/types";
import { ILinkedNodeValue } from '@/modules/struct/LinkedNode';
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { cloneDeep } from "lodash";
import { action, makeObservable, observable, computed } from "mobx";
import { multiply } from 'mathjs';
import IElement, { ElementObject } from "@/types/IElement";
import { StrokeTypes } from "@/styles/ElementStyles";
import { TransformerSize } from "@/styles/MaskStyles";
import IElementRotation from "@/types/IElementRotation";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import IStageShield from "@/types/IStageShield";
import CanvasUtils from "@/utils/CanvasUtils";
import { IVerticesTransformer, TransformerTypes, IBorderTransformer } from "@/types/ITransformer";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import { IElementGroup } from "@/types/IElementGroup";

export default class Element implements IElement, ILinkedNodeValue {
  // 组件ID
  id: string;
  // 组件模型
  model: ElementObject;
  // 组件旋转
  rotation: IElementRotation;
  // 舞台
  shield: IStageShield;
  // 原始变换器点坐标
  _originalTransformerPoints: IPoint[];
  // 原始模型坐标
  _originalModelCoords: IPoint[];
  // 原始模型盒模型坐标
  _originalModelBoxCoords: IPoint[];
  // 原始变换矩阵
  _originalMatrix: number[][] = [];
  // 组件状态
  @observable _status: ElementStatus = ElementStatus.initialed;
  // 是否选中
  @observable _isSelected: boolean = false;
  // 是否可见
  @observable _isVisible: boolean = true;
  // 是否正在编辑
  @observable _isEditing: boolean = false;
  // 是否锁定
  @observable _isLocked: boolean = false;
  // 是否正在移动
  @observable _isMoving: boolean = false;
  // 是否正在变换
  @observable _isTransforming: boolean = false;
  // 是否正在旋转
  @observable _isRotating: boolean = false;
  // 是否正在旋转目标
  @observable _isRotatingTarget: boolean = false;
  // 是否正在拖动
  @observable _isDragging: boolean = false;
  // 是否处于临时状态
  @observable _isProvisional: boolean = false;
  // 是否命中
  @observable _isTarget: boolean = false;
  // 是否在选区范围内
  @observable _isInRange: boolean = false;
  // 是否在舞台上
  @observable _isOnStage: boolean = false;

  // 所属组合
  get group(): IElementGroup {
    return this.shield.store.getElementGroupById(this.model.groupId);
  }

  // 是否是组合元素
  get isGroupSubject(): boolean {
    return this.model.groupId !== undefined;
  }

  // 获取边框线段点坐标
  get strokePathPoints(): IPoint[] {
    return this.convertPointsByStrokeType(this._rotatePathPoints);
  }

  // 获取边框线段坐标
  get strokePathCoords(): IPoint[] {
    return this.convertPointsByStrokeType(this._rotatePathCoords);
  }

  // 是否翻转X轴
  get flipX(): boolean {
    if (!this.flipXEnable || !this.boxVerticesTransformEnable || !this.transformers.length) return false;
    const refers = CommonUtils.sortPointsByY([this.transformers[0], this.transformers[3]])
    return MathUtils.isPointClockwise(this.center, refers[0], refers[1]);
  }

  // 是否翻转Y轴
  get flipY(): boolean {
    if (!this.flipYEnable || !this.boxVerticesTransformEnable || !this.transformers.length) return false;
    const refers = CommonUtils.sortPointsByX([this.transformers[3], this.transformers[2]])
    return MathUtils.isPointClockwise(this.center, refers[0], refers[1]);
  }

  // 是否可以翻转X轴
  get flipXEnable(): boolean {
    return true;
  }

  // 是否可以翻转Y轴
  get flipYEnable(): boolean {
    return true;
  }

  // 是否可以修改宽度
  get widthModifyEnable(): boolean {
    return true;
  }

  // 是否可以修改高度
  get heightModifyEnable(): boolean {
    return true;
  }

  // 是否可以旋转
  get rotationEnable(): boolean {
    return true;
  }

  // 是否可以通过顶点旋转
  get verticesRotationEnable(): boolean {
    return true;
  }

  // 是否可以通过顶点变形
  get verticesTransformEnable(): boolean {
    return false;
  }

  // 是否可以通过盒模型顶点变形
  get boxVerticesTransformEnable(): boolean {
    return true;
  }

  // 是否可以通过边框变形
  get borderTransformEnable(): boolean {
    return true;
  }

  // 是否可以填充颜色
  get fillEnabled(): boolean {
    return true;
  }

  // 是否可以描边
  get strokeEnable(): boolean {
    return true;
  }

  // 是否可以锁定比例
  get ratioLockedEnable(): boolean {
    return true;
  }

  // 是否可以编辑
  get editingEnable(): boolean {
    return true;
  }

  // 是否应该刷新变换控制器
  get tfRefreshAfterEdChanged(): boolean {
    return false;
  }

  // 是否应该锁定比例变换尺寸
  get shouldRatioLockResize(): boolean {
    return this.ratioLockedEnable && (this.isRatioLocked || this.shield.event.isShift);
  }

  // 获取变形/移动/旋转操作之前的原始坐标
  get originalModelCoords(): IPoint[] {
    return this._originalModelCoords;
  }

  // 获取原始模型盒模型坐标
  get originalModelBoxCoords(): IPoint[] {
    return this._originalModelBoxCoords;
  }

  @computed
  get width(): number {
    return this.model.width;
  }

  @computed
  get height(): number {
    return this.model.height;
  }

  /**
   * 获取显示角度
   * 
   * @returns 
   */
  protected getAngle(): number {
    return this.model.angle;
  }

  @computed
  get angle(): number {
    return this.getAngle();
  }

  get center(): IPoint {
    return this.calcCenter();
  }

  get centerCoord(): IPoint {
    return this.calcCenterCoord();
  }

  @computed
  get position(): IPoint {
    return {
      x: this.model.left,
      y: this.model.top
    }
  }

  @computed
  get strokeType(): StrokeTypes {
    return this.model.styles.strokeType;
  }

  @computed
  get strokeWidth(): number {
    return this.model.styles.strokeWidth;
  }

  @computed
  get strokeColor(): string {
    return this.model.styles.strokeColor;
  }

  @computed
  get strokeColorOpacity(): number {
    return this.model.styles.strokeColorOpacity;
  }

  @computed
  get fillColor(): string {
    return this.model.styles.fillColor;
  }

  @computed
  get fillColorOpacity(): number {
    return this.model.styles.fillColorOpacity;
  }

  @computed
  get textAlign(): CanvasTextAlign {
    return this.model.styles.textAlign;
  }

  @computed
  get textBaseline(): CanvasTextBaseline {
    return this.model.styles.textBaseline;
  }

  @computed
  get fontSize(): number {
    return this.model.styles.fontSize;
  }

  @computed
  get fontFamily(): string {
    return this.model.styles.fontFamily;
  }

  @computed
  get status(): ElementStatus {
    return this._status;
  }

  set status(value: ElementStatus) {
    this._setStatus(value);
  }

  @computed
  get isSelected(): boolean {
    return this._isSelected;
  }

  set isSelected(value: boolean) {
    this._setIsSelected(value);
  }

  @computed
  get isVisible(): boolean {
    return this._isVisible;
  }

  set isVisible(value: boolean) {
    this._setIsVisible(value);
  }

  @computed
  get isEditing(): boolean {
    return this._isEditing;
  }

  set isEditing(value: boolean) {
    this._setIsEditing(value);
  }

  @computed
  get isLocked(): boolean {
    return this._isLocked;
  }

  set isLocked(value: boolean) {
    this._setIsLocked(value);
  }

  @computed
  get isMoving(): boolean {
    return this._isMoving;
  }

  set isMoving(value: boolean) {
    this._setIsMoving(value);
  }

  @computed
  get isTransforming(): boolean {
    return this._isTransforming;
  }

  set isTransforming(value: boolean) {
    this._setIsTransforming(value);
  }

  @computed
  get isRotating(): boolean {
    return this._isRotating;
  }

  set isRotating(value: boolean) {
    this._setIsRotating(value);
  }

  @computed
  get isRotatingTarget(): boolean {
    return this._isRotatingTarget;
  }

  set isRotatingTarget(value: boolean) {
    this._setIsRotatingTarget(value);
  }

  @computed
  get isDragging(): boolean {
    return this._isDragging;
  }

  set isDragging(value: boolean) {
    this._setIsDragging(value);
  }

  @computed
  get isProvisional(): boolean {
    return this._isProvisional;
  }

  set isProvisional(value: boolean) {
    this._setIsRendered(value);
  }

  @computed
  get isTarget(): boolean {
    return this._isTarget;
  }

  set isTarget(value: boolean) {
    this._setIsTarget(value);
  }

  @computed
  get isInRange(): boolean {
    return this._isInRange;
  }

  set isInRange(value: boolean) {
    this._setIsInRange(value);
  }

  @computed
  get isOnStage(): boolean {
    return this._isOnStage;
  }

  set isOnStage(value: boolean) {
    this._setIsOnStage(value);
  }

  @computed
  get isRatioLocked(): boolean {
    return this.model.isRatioLocked;
  }

  @action
  protected _setStatus(status: ElementStatus): void {
    this.__setStatus(status);
  }

  protected __setStatus(status: ElementStatus): void {
    this._status = status;
  }

  @action
  protected _setIsSelected(value: boolean): void {
    this._isSelected = value;
  }

  @action
  protected _setIsVisible(value: boolean): void {
    this._isVisible = value;
  }

  @action
  protected _setIsEditing(value: boolean): void {
    this._isEditing = value;
  }

  @action
  protected _setIsLocked(value: boolean): void {
    this._isLocked = value;
  }

  @action
  protected _setIsMoving(value: boolean): void {
    this._isMoving = value;
  }

  @action
  protected _setIsTransforming(value: boolean): void {
    this._isTransforming = value;
  }

  @action
  protected _setIsRotating(value: boolean): void {
    this._isRotating = value;
  }

  @action
  protected _setIsRotatingTarget(value: boolean): void {
    this._isRotatingTarget = value;
  }

  @action
  protected _setIsDragging(value: boolean): void {
    this._isDragging = value;
  }

  @action
  protected _setIsRendered(value: boolean): void {
    this._isProvisional = value;
  }

  @action
  protected _setIsTarget(value: boolean): void {
    this._isTarget = value;
  }

  @action
  protected _setIsOnStage(value: boolean): void {
    this._isOnStage = value;
  }

  @action
  protected _setIsInRange(value: boolean): void {
    this._isInRange = value;
  }

  // 坐标-舞台坐标系
  protected _pathPoints: IPoint[] = [];
  // 最大盒模型-舞台坐标系
  protected _maxBoxPoints: IPoint[] = [];
  // 旋转坐标-舞台坐标系
  protected _rotatePathPoints: IPoint[] = [];
  // 旋转坐标-世界坐标系
  protected _rotatePathCoords: IPoint[] = [];
  // 旋转外框线坐标-舞台坐标系（组件命中处理）
  protected _rotateOutlinePathPoints: IPoint[] = [];
  // 旋转盒模型-舞台坐标系
  protected _rotateBoxPoints: IPoint[] = [];
  // 旋转盒模型坐标-舞台坐标系
  protected _rotateBoxCoords: IPoint[] = [];
  // 旋转坐标计算出来的最大外框盒模型-舞台坐标系
  protected _maxOutlineBoxPoints: IPoint[] = [];
  // 旋转外框线坐标-世界坐标系(组件对齐时使用)
  protected _rotateOutlinePathCoords: IPoint[] = [];
  // 盒模型，同_maxBoxPoints-舞台坐标系
  protected _rect: Partial<DOMRect> = {};
  // 顶点变换器-舞台坐标系
  protected _transformers: IVerticesTransformer[] = [];
  // 边框变换器-舞台坐标系
  protected _borderTransformers: IBorderTransformer[] = [];
  // 原始中心点-世界坐标系
  protected _originalCenterCoord: IPoint;
  // 原始旋转的组件坐标-世界坐标系
  protected _originalRotatePathPoints: IPoint[] = [];
  // 原始的盒模型坐标
  protected _originalRotateBoxPoints: IPoint[] = [];
  // 原始角度-舞台坐标系&世界坐标系
  protected _originalAngle: number = 0;
  // 原始盒模型-舞台坐标系
  protected _originalRect: Partial<DOMRect> = {};
  // 原始中心点-舞台坐标系
  protected _originalCenter: IPoint;

  get pathPoints(): IPoint[] {
    return this._pathPoints;
  }

  get maxBoxPoints(): IPoint[] {
    return this._maxBoxPoints;
  }

  get maxOutlineBoxPoints(): IPoint[] {
    return this._maxOutlineBoxPoints;
  }

  get rotatePathPoints(): IPoint[] {
    return this._rotatePathPoints;
  }

  get rotatePathCoords(): IPoint[] {
    return this._rotatePathCoords;
  }

  get rotateOutlinePathPoints(): IPoint[] {
    return this._rotateOutlinePathPoints;
  }

  get rotateBoxPoints(): IPoint[] {
    return this._rotateBoxPoints;
  }

  get rotateBoxCoords(): IPoint[] {
    return this._rotateBoxCoords;
  }

  get rotateOutlinePathCoords(): IPoint[] {
    return this._rotateOutlinePathCoords;
  }

  get transformers(): IVerticesTransformer[] {
    return this._transformers;
  }

  get borderTransformers(): IBorderTransformer[] {
    return this._borderTransformers;
  }

  get transformerType(): TransformerTypes {
    return TransformerTypes.rect;
  }

  get rect(): Partial<DOMRect> {
    return this._rect;
  }

  get activeCoordIndex(): number {
    return -1;
  }

  get alignPoints(): IPoint[] {
    return this._rotatePathPoints;
  }

  get alignCoords(): IPoint[] {
    return this._rotatePathCoords;
  }

  get alignOutlinePoints(): IPoint[] {
    return this._rotateOutlinePathPoints;
  }

  get alignOutlineCoords(): IPoint[] {
    return this._rotateOutlinePathCoords;
  }

  get visualStrokeWidth(): number {
    return this.strokeWidth * this.shield.stageScale;
  }

  get visualFontSize(): number {
    return this.fontSize * this.shield.stageScale;
  }

  constructor(model: ElementObject, shield: IStageShield) {
    this.model = observable(model);
    this.id = CommonUtils.getRandomDateId();
    this.rotation = new ElementRotation(this);
    this.shield = shield;
    this.refreshOriginalProps();
    makeObservable(this);
  }

  /**
   * 将坐标根据描边类型进行转换
   * 
   * @param points 
   * @returns 
   */
  private convertPointsByStrokeType(points: IPoint[]): IPoint[] {
    return CanvasUtils.convertPointsByStrokeType(
      points,
      this.model.styles.strokeType,
      this.model.styles.strokeWidth,
      {
        flipX: this.flipX,
        flipY: this.flipY,
        isFold: this.model.isFold,
      }
    )
  }

  /**
   * 计算舞台坐标
   * 
   * @returns 
   */
  calcPathPoints(): IPoint[] {
    let points = this._pathPoints;
    if (this.activeCoordIndex !== -1) {
      const newCoord: IPoint = ElementUtils.calcStageRelativePoint(this.model.coords[this.activeCoordIndex], this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale);
      points[this.activeCoordIndex] = newCoord;
    } else {
      points = ElementUtils.calcStageRelativePoints(this.model.coords, this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale);
    }
    return points;
  }

  /**
   * 计算旋转路径坐标
   * 
   * @returns 
   */
  calcRotatePathPoints(): IPoint[] {
    const center = this.center;
    return this._pathPoints.map(point => MathUtils.rotateRelativeCenter(point, this.model.angle, center));
  }

  /**
   * 计算组件包含外边框宽度的坐标
   * 
   * @returns 
   */
  calcRotateOutlinePathPoints(): IPoint[] {
    const { strokeType, strokeWidth } = this.model.styles;
    return ElementUtils.calcOutlinePoints(this._rotatePathPoints, strokeType, strokeWidth, {
      flipX: this.flipX,
      flipY: this.flipY
    });
  }

  /**
   * 计算旋转后的盒模型坐标
   */
  calcRotateBoxPoints(): IPoint[] {
    if (!this.model.boxCoords?.length) return [];
    const center = this.center;
    return this.model.boxCoords.map(coord => {
      const point = ElementUtils.calcStageRelativePoint(coord, this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale);
      return MathUtils.rotateRelativeCenter(point, this.model.angle, center)
    });
  }

  /**
   * 计算旋转后的盒模型坐标
   * 
   * @returns 
   */
  calcRotateBoxCoords(): IPoint[] {
    const centerCoord = this.centerCoord;
    return this.model.coords.map(coord => MathUtils.rotateRelativeCenter(coord, this.model.angle, centerCoord));
  }

  /**
   * 计算非旋转的最大盒模型
   * 
   * @returns 
   */
  calcMaxBoxPoints(): IPoint[] {
    return CommonUtils.getBoxPoints(this._rotatePathPoints)
  }

  /**
   * 计算带边框的最大盒模型
   * 
   * @returns 
   */
  calcMaxOutlineBoxPoints(): IPoint[] {
    return CommonUtils.getBoxPoints(this._rotateOutlinePathPoints)
  }

  /**
   * 计算旋转后的坐标
   * 
   * @returns 
   */
  calcRotatePathCoords(): IPoint[] {
    const centerCoord = this.centerCoord;
    return this.model.coords.map(coord => MathUtils.rotateRelativeCenter(coord, this.model.angle, centerCoord))
  }

  /**
   * 计算世界坐标下的旋转边框坐标
   * 
   * @returns 
   */
  calcRotateOutlinePathCoords(): IPoint[] {
    return ElementUtils.calcOutlinePoints(this._rotatePathCoords, this.model.styles.strokeType, this.model.styles.strokeWidth, {
      flipX: this.flipX,
      flipY: this.flipY,
      isFold: this.model.isFold,
    });
  }

  /**
   * 计算中心点
   * 
   * @returns 
   */
  calcCenter(): IPoint {
    return MathUtils.calcCenter(this.pathPoints);
  }

  /**
   * 计算世界坐标中心点
   * 
   * @returns 
   */
  calcCenterCoord(): IPoint {
    return MathUtils.calcCenter(this.model.coords);
  }

  /**
   * 根据给定的点坐标生成变换器
   * 
   * @param points 
   * @returns 
   */
  private calcTransformersByPoints(points: IPoint[]): IVerticesTransformer[] {
    const result = points.map((point, index) => {
      const { x, y } = point;
      const points = CommonUtils.get4BoxPoints(point, {
        width: TransformerSize / this.shield.stageScale,
        height: TransformerSize / this.shield.stageScale,
      }, {
        angle: this.model.angle
      });
      let transformer = this._transformers[index];
      if (transformer) {
        transformer.points = points;
        transformer.x = x;
        transformer.y = y;
      } else {
        transformer = new VerticesTransformer(this, x, y, points);
      }
      return transformer;
    })
    return result;
  }

  /**
   * 计算边框变换器坐标
   */
  calcBoxVerticesTransformers(): IVerticesTransformer[] {
    return this.calcTransformersByPoints(this._rotateBoxPoints);
  }

  /**
   * 计算大小变换器坐标
   * 
   * @returns 
   */
  calcVerticesTransformers(): IVerticesTransformer[] {
    return this.calcTransformersByPoints(this._rotatePathPoints);
  }

  /**
   * 直线允许顶点变换，但是其他组件仅允许根据盒模型顶点变换
   * 
   * @returns 
   */
  calcTransformers(): IVerticesTransformer[] {
    if (this.verticesTransformEnable) {
      return this.calcVerticesTransformers();
    }
    if (this.boxVerticesTransformEnable) {
      return this.calcBoxVerticesTransformers();
    }
  }

  /**
   * 计算边框变换器
   */
  calcBorderTransformers(): IBorderTransformer[] {
    const result = this._rotateBoxPoints.map((point, index) => {
      const nextPoint = CommonUtils.getNextOfArray(this._rotateBoxPoints, index);
      let borderTransformer = this._borderTransformers[index];
      if (borderTransformer) {
        borderTransformer.start = point;
        borderTransformer.end = nextPoint;
      } else {
        borderTransformer = new BorderTransformer(this, point, nextPoint);
      }
      return borderTransformer;
    })
    return result;
  }

  /**
   * 计算未旋转之前的盒模型
   * 
   * @returns 
   */
  calcRect(): Partial<DOMRect> {
    return CommonUtils.getRect(this._pathPoints);
  }

  /**
   * 刷新旋转坐标
   */
  refreshRotation(): void {
    this.rotation.model.scale = 1 / this.shield.stageScale;
    this.rotation.refresh();
  }

  /**
   * 刷新坐标
   */
  refreshStagePoints(): void {
    this.refreshElementPoints();
    this.refreshRotation();
  }

  /**
   * 刷新舞台坐标
   */
  refreshElementPoints() {
    this._pathPoints = this.calcPathPoints();
    this._rotatePathPoints = this.calcRotatePathPoints();
    this._rotatePathCoords = this.calcRotatePathCoords();
    this._rotateBoxPoints = this.calcRotateBoxPoints();
    this._transformers = this.calcTransformers();
    if (this.borderTransformEnable) {
      this._borderTransformers = this.calcBorderTransformers();
    }
    this._maxBoxPoints = this.calcMaxBoxPoints();
    this._rect = this.calcRect();
    this._refreshOutlinePoints();
  }

  /**
   * 判断是否包含点
   * 
   * @param point 
   */
  isContainsPoint(point: IPoint): boolean {
    return MathUtils.isPointInPolygonByRayCasting(point, this.rotateOutlinePathPoints);
  }

  /**
   * 判断是否于多边形相交
   * 
   * @param points 
   * @returns 
   */
  isPolygonOverlap(points: IPoint[]): boolean {
    return MathUtils.isPolygonsOverlap(this.rotateOutlinePathPoints, points);
  }
  /**
   * 判断世界模型是否与多边形相交、
   * 
   * @param coords 
   * @returns 
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return MathUtils.isPolygonsOverlap(this._rotateOutlinePathCoords, coords);
  }

  /**
   * 获取变换器
   * 
   * @param point 
   * @returns 
   */
  getTransformerByPoint(point: IPoint): IVerticesTransformer {
    return this.transformers.find(item => item.isContainsPoint(point));
  }

  /**
   * 获取边框变换器
   * 
   * @param point 
   * @returns 
   */
  getBorderTransformerByPoint(point: IPoint): IBorderTransformer {
    return this.borderTransformers.find(item => item.isClosest(point));
  }

  /**
   * 获取处于激活状态的变换器
   * 
   * @returns 
   */
  getActiveElementTransformer(): IVerticesTransformer {
    return this.transformers.find(item => item.isActive);
  }

  /**
   * 获取处于激活状态的边框变换器
   * 
   * @returns 
   */
  getActiveElementBorderTransformer(): IBorderTransformer {
    return this.borderTransformers.find(item => item.isActive);
  }

  /**
   * 重新维护原始变形器坐标
   */
  refreshOriginalElementProps() {
    this._originalRotatePathPoints = cloneDeep(this._rotatePathPoints);
    this._originalRotateBoxPoints = cloneDeep(this._rotateBoxPoints);
    this._originalAngle = this.model.angle;
    this._originalRect = this.calcRect();
    this._originalMatrix = [];
    if (this.pathPoints.length) {
      this._originalCenter = cloneDeep(this.center);
    }
  }

  /**
   * 刷新原始顶点坐标
   */
  refreshOriginalTransformerPoints(): void {
    this._originalTransformerPoints = this.transformers.map(transformer => {
      const { x, y } = transformer;
      return {
        x,
        y
      }
    })
  }

  /**
   * 重新维护原始坐标
   */
  refreshOriginalModelCoords() {
    this._originalModelCoords = cloneDeep(this.model.coords);
    this._originalModelBoxCoords = cloneDeep(this.model.boxCoords);
    this._originalCenterCoord = cloneDeep(this.centerCoord);
  }

  /**
   * 重新维护原始属性，用于组件的移动、旋转、大小变换
   */
  refreshOriginalProps(): void {
    this.refreshOriginalModelCoords();
    this.refreshOriginalTransformerPoints();
    this.refreshOriginalElementProps();
  }

  /**
   * 激活变形器
   * 
   * @param transformer 
   */
  activeTransformer(transformer: IVerticesTransformer): void {
    this._transformers.forEach(item => {
      item.isActive = item.id === transformer.id;
    });
  }

  /**
   * 激活边框变形器
   * 
   * @param transformer 
   */
  activeBorderTransformer(transformer: IBorderTransformer): void {
    this._borderTransformers.forEach(item => {
      item.isActive = item.id === transformer.id;
    });
  }

  /**
   * 将所有变形器设置为未激活状态
   */
  deActiveAllTransformers(): void {
    this._transformers.forEach(item => {
      item.isActive = false;
    });
  }

  /**
   * 将所有边框变形器设置为未激活状态
   */
  deActiveAllBorderTransformers(): void {
    this._borderTransformers.forEach(item => {
      item.isActive = false;
    });
  }

  /**
   * 更新尺寸
   */
  refreshSize(): void {
    const { width, height } = ElementUtils.calcSize(this.model);
    this.model.width = width;
    this.model.height = height;
  }

  /**
   * 更新坐标
   */
  refreshPosition(): void {
    const { x, y } = ElementUtils.calcPosition(this.model);
    this.model.left = x;
    this.model.top = y;
  }

  /**
   * 刷新盒模型坐标
   */
  refreshBoxCoords(): void {
    this.model.boxCoords = CommonUtils.getBoxPoints(this.model.coords);
  }

  /**
   * 刷新变换控制器
   */
  refreshTransformers(): void {
    this._transformers = this.calcTransformers();
  }

  /**
   * 角度修正
   */
  protected flipAngle(): void {
    if (this.model.angle > 0) {
      this.model.angle = this.model.angle - 180;
    } else {
      this.model.angle = this.model.angle + 180;
    }
  }

  /**
   * 根据矩阵计算新的坐标
   * 
   * @param point 
   * @param matrix 
   * @param lockPoint 
   * @returns 
   */
  private _calcMatrixPoint(point: IPoint, matrix: number[][], lockPoint: IPoint): IPoint {
    // 先旋转回角度0
    point = MathUtils.rotateRelativeCenter(point, -this.model.angle, lockPoint);
    // 以不动点为圆心，计算形变
    const [x, y] = multiply(matrix, [point.x - lockPoint.x, point.y - lockPoint.y, 1]);
    // 重新计算坐标
    point = { x: x + lockPoint.x, y: y + lockPoint.y };
    // 坐标重新按照角度偏转
    point = MathUtils.rotateRelativeCenter(point, this.model.angle, lockPoint);
    return point;
  }

  /**
   * 根据矩阵和中心点计算新的坐标
   * 
   * @param matrix 
   * @param lockPoint 
   * @returns 
   */
  protected calcTransformCoords(points: IPoint[], matrix: number[][], lockPoint: IPoint): IPoint[] {
    return this.calcTransformCoordsByCenter(points, matrix, lockPoint, this._originalCenter);
  }

  /**
   * 根据中心点计算变换后的坐标
   * 
   * @param points 
   * @param matrix 
   * @param lockPoint 
   * @param centroid 
   * @returns 
   */
  protected calcTransformCoordsByCenter(points: IPoint[], matrix: number[][], lockPoint: IPoint, centroid: IPoint): IPoint[] {
    points = points.map(point => {
      return this._calcMatrixPoint(point, matrix, lockPoint);
    });
    const center = this._calcMatrixPoint(centroid, matrix, lockPoint);
    const coords = points.map(point => {
      point = MathUtils.rotateRelativeCenter(point, -this.model.angle, center);
      const coord = ElementUtils.calcWorldPoint(point, this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale);
      return coord;
    })
    return coords;
  }

  /**
   * 形变
   * 
   * @param offset 
   */
  transform(offset: IPoint): void {
    if (this.getActiveElementTransformer()) {
      this.transformByVertices(offset);
    } else if (this.getActiveElementBorderTransformer()) {
      this.transformByBorder(offset);
    }
    this.refreshStagePoints();
    this.refreshSize();
    this.refreshPosition();
  }

  /**
   * 按顶点形变
   * 
   * @param offset 
   * @returns 
   */
  transformByVertices(offset: IPoint): void {
    if (!this.verticesTransformEnable && !this.boxVerticesTransformEnable) return;
    this.doVerticesTransform(offset);
  }

  /**
   * 按顶点变换
   * 
   * @param offset 
   */
  protected doVerticesTransform(offset: IPoint): void {
    const index = this._transformers.findIndex(item => item.isActive);
    if (index !== -1) {
      // 不动点坐标索引
      const lockIndex = CommonUtils.getPrevIndexOfArray(this._transformers.length, index, 2);
      // 不动点
      const lockPoint = this._originalTransformerPoints[lockIndex];
      // 当前拖动的点的原始位置
      const currentPointOriginal = this._originalTransformerPoints[index];
      // 根据不动点进行形变
      this.transformByLockPoint(lockPoint, currentPointOriginal, offset);
    }
  }

  /**
   * 根据不动点进行顶点变换
   * 
   * @param lockPoint 
   * @param currentPointOriginal 
   * @param offset 
   */
  protected transformByLockPoint(lockPoint: IPoint, currentPointOriginal: IPoint, offset: IPoint): void {
    const matrix = this.getTransformMatrix(lockPoint, currentPointOriginal, offset);
    this.model.coords = this.calcTransformCoords(this._originalRotatePathPoints, matrix, lockPoint);
    this.model.boxCoords = this.calcTransformCoords(this._originalRotateBoxPoints, matrix, lockPoint);
    // 判断是否需要翻转角度
    this._tryFlipAngle(lockPoint, currentPointOriginal, matrix);
  }

  /**
   * 获取变换矩阵
   * 
   * @param lockPoint 
   * @param currentPointOriginal 
   * @param offset 
   * @returns 
   */
  protected getTransformMatrix(lockPoint: IPoint, currentPointOriginal: IPoint, offset: IPoint): number[][] {
    // 当前拖动的点当前的位置
    const currentPoint = { x: currentPointOriginal.x + offset.x, y: currentPointOriginal.y + offset.y };
    // 判断当前拖动点，在坐标系垂直轴的左边还是右边
    const matrix = MathUtils.calcTransformMatrixOfCenter(lockPoint, currentPoint, currentPointOriginal, this.model.angle);
    if (this.shouldRatioLockResize) {
      matrix[1][1] = MathUtils.resignValue(matrix[1][1], matrix[0][0]);
    }
    return matrix;
  }

  /**
   * 尝试翻转角度
   * 
   * @param lockPoint 
   * @param currentPointOriginal 
   * @param matrix 
   */
  protected _tryFlipAngle(lockPoint: IPoint, currentPointOriginal: IPoint, matrix: number[][]): void {
    // 判断是否已经计算过原始矩阵
    if (!this._originalMatrix.length) {
      // 计算原始矩阵
      this._originalMatrix = MathUtils.calcTransformMatrixOfCenter(lockPoint, currentPointOriginal, currentPointOriginal, this.model.angle);
    }
    // 原始的纵轴缩放系数
    const xScaleOriginal = this._originalMatrix[0][0];
    const yScaleOriginal = this._originalMatrix[1][1];
    // 纵轴缩放系数
    const xScale = matrix[0][0];
    const yScale = matrix[1][1];

    // 判断横轴缩放系数是否与原始的相同，如果不同，则旋转角度
    if (!MathUtils.isSameSign(yScale, yScaleOriginal)) {
      this.flipAngle();
      this._originalMatrix = matrix;
    }
  }

  /**
   * 按边框形变
   * 
   * @param offset 
   */
  transformByBorder(offset: IPoint): void {
    if (!this.borderTransformEnable) return;
    this.doBorderTransform(offset);
  }

  /**
   * 获取边形形变锁定点
   * 
   * @param index 
   * @returns 
   */
  protected getBorderTransformLockPoint(index: number): IPoint {
    // 不动边的点1索引
    const lockIndex = CommonUtils.getPrevIndexOfArray(this._borderTransformers.length, index, 2);
    // 不动边的点2索引
    const lockNextIndex = CommonUtils.getNextIndexOfArray(this._borderTransformers.length, index, 3);
    // 不动点
    const lockPoint = MathUtils.calcCenter([this._originalTransformerPoints[lockIndex], this._originalTransformerPoints[lockNextIndex]]);
    return lockPoint;
  }

  /**
   * 按边框变换
   * 
   * @param offset 
   */
  protected doBorderTransform(offset: IPoint): void {
    const index = this._borderTransformers.findIndex(item => item.isActive);
    if (index !== -1) {
      // 不动点
      const lockPoint = this.getBorderTransformLockPoint(index);
      // 当前拖动的点的原始位置
      const currentPointOriginal = this._originalTransformerPoints[index];
      // 当前拖动的点当前的位置
      const currentPoint = { x: currentPointOriginal.x + offset.x, y: currentPointOriginal.y + offset.y };
      // 判断当前拖动点，在坐标系垂直轴的左边还是右边
      const matrix = MathUtils.calcTransformMatrixOfCenter(lockPoint, currentPoint, currentPointOriginal, this.model.angle);
      if (index === 0 || index === 2) {
        matrix[0][0] = this.shouldRatioLockResize ? MathUtils.resignValue(matrix[0][0], matrix[1][1]) : 1;
      } else if (index === 1 || index === 3) {
        matrix[1][1] = this.shouldRatioLockResize ? MathUtils.resignValue(matrix[1][1], matrix[0][0]) : 1;
      }
      if ([1, 3].includes(index) && matrix[1][1] < 0) {
        matrix[1][1] = Math.abs(matrix[1][1]);
      }
      if ([0, 2].includes(index) && matrix[0][0] < 0) {
        matrix[0][0] = Math.abs(matrix[0][0]);
      }
      this.model.coords = this.calcTransformCoords(this._originalRotatePathPoints, matrix, lockPoint);
      this.model.boxCoords = this.calcTransformCoords(this._originalRotateBoxPoints, matrix, lockPoint);
      this._tryFlipAngle(lockPoint, currentPointOriginal, matrix);
    }
  }

  /**
   * 获取设置尺寸变换的变换点（设置宽度的时候使用）
   * 
   * @returns 
   */
  protected getTransformPointForSizeChange(): IPoint {
    return this._originalTransformerPoints[2];
  }

  /**
   * 刷新组件必要数据
   */
  refresh(): void {
    this.refreshStagePoints();
    this.refreshSize();
    this.refreshPosition();
    this.refreshOriginalProps();
  }

  /**
   * 刷新与边框设置相关的坐标
   */
  protected _refreshOutlinePoints(): void {
    this._rotateOutlinePathPoints = this.calcRotateOutlinePathPoints();
    this._rotateOutlinePathCoords = this.calcRotateOutlinePathCoords();
    this._maxOutlineBoxPoints = this.calcMaxOutlineBoxPoints();
  }

  /**
   * 设置组件宽度
   * 
   * @param value 
   */
  setWidth(value: number): void {
    const lockPoint = this._originalCenter;
    const currentPointOriginal = this.getTransformPointForSizeChange();
    const xValue = MathUtils.calcTriangleSide1By3(this.model.angle, value);
    const yValue = MathUtils.calcTriangleSide2By3(this.model.angle, value);
    const originXValue = MathUtils.calcTriangleSide1By3(this.model.angle, this._originalRect.width);
    const originYValue = MathUtils.calcTriangleSide2By3(this.model.angle, this._originalRect.width);
    const offset = { x: (xValue - originXValue) / 2, y: (yValue - originYValue) / 2 };
    const currentPoint = { x: currentPointOriginal.x + offset.x, y: currentPointOriginal.y + offset.y };
    const matrix = MathUtils.calcTransformMatrixOfCenter(lockPoint, currentPoint, currentPointOriginal, this.model.angle);
    matrix[1][1] = this.shouldRatioLockResize ? MathUtils.resignValue(matrix[1][1], matrix[0][0]) : 1;
    this.model.coords = this.calcTransformCoords(this._originalRotatePathPoints, matrix, lockPoint);
    this.model.boxCoords = this.calcTransformCoords(this._originalRotateBoxPoints, matrix, lockPoint);
    this.refresh();
  }

  /**
   * 设置组件高度
   * 
   * @param value 
   */
  setHeight(value: number): void {
    const lockPoint = this._originalCenter;
    const currentPointOriginal = this.getTransformPointForSizeChange();
    const xValue = MathUtils.calcTriangleSide2By3(this.model.angle, value)
    const yValue = MathUtils.calcTriangleSide1By3(this.model.angle, value);
    const originXValue = MathUtils.calcTriangleSide2By3(this.model.angle, this._originalRect.height)
    const originYValue = MathUtils.calcTriangleSide1By3(this.model.angle, this._originalRect.height);
    const offset = { x: (xValue - originXValue) / 2, y: (yValue - originYValue) / 2 };
    const currentPoint = { x: currentPointOriginal.x + offset.x, y: currentPointOriginal.y + offset.y };
    const matrix = MathUtils.calcTransformMatrixOfCenter(lockPoint, currentPoint, currentPointOriginal, this.model.angle);
    matrix[0][0] = this.shouldRatioLockResize ? MathUtils.resignValue(matrix[0][0], matrix[1][1]) : 1;
    this.model.coords = this.calcTransformCoords(this._originalRotatePathPoints, matrix, lockPoint);
    this.model.boxCoords = this.calcTransformCoords(this._originalRotateBoxPoints, matrix, lockPoint);
    this.refresh();
  }

  /**
   * 设置坐标
   * 
   * @param x 
   * @param y 
   * @param offset 
   */
  setPosition(x: number, y: number, offset: IPoint): void {
    this.model.left = x;
    this.model.top = y;
    this.model.coords = ElementUtils.translateCoords(this.model.coords, offset);
    this.model.boxCoords = ElementUtils.translateCoords(this.model.boxCoords, offset);
    this.refresh();
  }

  /**
   * 设置角度
   * 
   * @param value 
   */
  setAngle(value: number): void {
    this.model.angle = value;
    this.refresh();
  }

  /**
   * 设置边框样式
   * 
   * @param value 
   */
  setStrokeType(value: StrokeTypes): void {
    this.model.styles.strokeType = value;
    this._refreshOutlinePoints();
  }

  /**
   * 设置边框颜色
   * 
   * @param value 
   */
  setStrokeColor(value: string): void {
    this.model.styles.strokeColor = value;
  }

  /**
   * 设置边框透明度
   * 
   * @param value 
   */
  setStrokeColorOpacity(value: number): void {
    this.model.styles.strokeColorOpacity = value;
  }

  /**
   * 设置边框宽度
   * 
   * @param value 
   */
  setStrokeWidth(value: number): void {
    this.model.styles.strokeWidth = value;
    this._refreshOutlinePoints();
  }

  /**
   * 设置填充颜色
   * @param value 
   */
  setFillColor(value: string): void {
    this.model.styles.fillColor = value;
  }

  /**
   * 设置填充颜色透明度
   * @param value 
   */
  setFillColorOpacity(value: number): void {
    this.model.styles.fillColorOpacity = value;
  }

  /**
   * 设置字体大小
   * @param value 
   */
  setFontSize(value: number): void {
    this.model.styles.fontSize = value;
  }

  /**
   * 设置字体样式
   * @param value 
   */
  setFontFamily(value: string): void {
    this.model.styles.fontFamily = value;
  }

  /**
   * 设置字体对齐方式
   * @param value 
   */
  setTextAlign(value: CanvasTextAlign): void {
    this.model.styles.textAlign = value;
  }

  /**
   * 设置字体基线
   * @param value 
   */
  setTextBaseline(value: CanvasTextBaseline): void {
    this.model.styles.textBaseline = value;
  }

  /**
   * 锁定比例
   * 
   * @param value 
   */
  setRatioLocked(value: boolean): void {
    this.model.isRatioLocked = value;
    if (value) {
      this.model.ratio = this.model.width / this.model.height;
    } else {
      this.model.ratio = null;
    }
  }
}