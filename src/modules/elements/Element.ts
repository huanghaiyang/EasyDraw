import { ElementStatus, IPoint } from "@/types";
import { ILinkedNodeValue } from "@/modules/struct/LinkedNode";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { clamp, cloneDeep } from "lodash";
import { action, makeObservable, observable, computed } from "mobx";
import IElement, {
  AngleModel,
  DefaultElementRefreshOptions,
  DefaultRefreshAnglesOptions,
  ElementObject,
  FlipModel,
  RefreshAnglesOptions,
  RefreshOptions,
  TransformByOptions,
} from "@/types/IElement";
import { StrokeTypes } from "@/styles/ElementStyles";
import { TransformerSize } from "@/styles/MaskStyles";
import IElementRotation from "@/types/IElementRotation";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import IStageShield from "@/types/IStageShield";
import CanvasUtils from "@/utils/CanvasUtils";
import {
  IVerticesTransformer,
  TransformerTypes,
  IBorderTransformer,
} from "@/types/ITransformer";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import { IElementGroup } from "@/types/IElementGroup";
import { CreatorTypes } from "@/types/Creator";
import { TransformTypes } from "@/types/Stage";

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
  protected _originalTransformerPoints: IPoint[];
  // 原始模型坐标
  protected _originalModelCoords: IPoint[];
  // 原始模型盒模型坐标
  protected _originalModelBoxCoords: IPoint[];
  // 原始变换矩阵
  protected _originalTransformMatrix: number[][] = [];
  // 变换矩阵
  protected _transformMatrix: number[][] = [];
  // 变换不动点
  protected _transformLockPoint: IPoint;
  // 变换不动点索引
  protected _transformLockIndex: number;
  // 变换原始拖动点
  protected _transformOriginalMovingPoint: IPoint;
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

  // 是否是组件
  get isElement(): boolean {
    return [
      CreatorTypes.image,
      CreatorTypes.text,
      CreatorTypes.arbitrary,
      CreatorTypes.rectangle,
      CreatorTypes.circle,
      CreatorTypes.polygon,
      CreatorTypes.line,
      CreatorTypes.text,
      CreatorTypes.pencil,
    ].includes(this.model.type);
  }

  // 是否是组合
  get isGroup(): boolean {
    return this.model.type === CreatorTypes.group;
  }

  // 所属组合
  get group(): IElementGroup {
    if (!this.isGroupSubject) return null;
    return this.shield.store.getElementById(
      this.model.groupId,
    ) as IElementGroup;
  }

  // 祖先组合
  get ancestorGroup(): IElementGroup {
    if (!this.isGroupSubject) return null;
    let group = this.group;
    while (group && group.isGroupSubject) {
      group = group.group;
    }
    return group;
  }

  // 是否是组合组件
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
  @computed
  get flipX(): boolean {
    if (!this.flipXEnable || !this.boxVerticesTransformEnable) return false;
    return MathUtils.calcFlipXByPoints(this.model.boxCoords);
  }

  // 是否翻转Y轴(由于组件按y轴翻转实际上是角度翻转，因此这里始终返回false)
  get flipY(): boolean {
    return false;
  }

  // 获取翻转信息
  get flip(): FlipModel {
    return {
      flipX: this.flipX,
      flipY: this.flipY,
    };
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
    return (
      this.ratioLockedEnable &&
      (this.isRatioLocked || this.shield.event.isShift)
    );
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
      x: this.model.x,
      y: this.model.y,
    };
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
    this.__setIsSelected(value);
  }

  protected __setIsSelected(value: boolean): void {
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
  protected _originalSize: Partial<DOMRect> = {};
  // 原始中心点-舞台坐标系
  protected _originalCenter: IPoint;
  // 变换器类型
  protected _transformType: TransformTypes;

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

  get alignOutlineCoords(): IPoint[] {
    return this._rotateOutlinePathCoords;
  }

  get visualStrokeWidth(): number {
    return this.strokeWidth * this.shield.stageScale;
  }

  get visualFontSize(): number {
    return this.fontSize * this.shield.stageScale;
  }

  get originalAngle(): number {
    return this._originalAngle;
  }

  set originalAngle(value: number) {
    this._originalAngle = value;
  }

  get transformMatrix(): number[][] {
    return this._transformMatrix;
  }

  get transformLockIndex(): number {
    return this._transformLockIndex;
  }

  get transformLockPoint(): IPoint {
    return this._transformLockPoint;
  }

  get transformOriginalMovingPoint(): IPoint {
    return this._transformOriginalMovingPoint;
  }

  get transformType(): TransformTypes {
    return this._transformType;
  }

  get viewAngle(): number {
    return this.model.viewAngle;
  }

  get internalAngle(): number {
    return this.model.internalAngle;
  }

  @computed
  get leanYAngle(): number {
    return this.model.leanYAngle;
  }

  get angles(): Partial<AngleModel> {
    return {
      angle: this.model.angle,
      leanYAngle: this.model.leanYAngle,
      internalAngle: this.model.internalAngle,
      actualAngle: this.model.actualAngle,
      viewAngle: this.model.viewAngle,
    };
  }

  get leanY(): number {
    return -Math.tan(MathUtils.angleToRadian(this.model.leanYAngle));
  }

  get actualAngle(): number {
    return this.model.actualAngle;
  }

  get viewAngleCalcEnable(): boolean {
    return true;
  }

  get leanYAngleCalcEnable(): boolean {
    return true;
  }

  get leanYAngleModifyEnable(): boolean {
    return true;
  }

  constructor(model: ElementObject, shield: IStageShield) {
    this.model = observable(model);
    this.id = CommonUtils.getRandomDateId();
    this.rotation = new ElementRotation(this);
    this.shield = shield;
    this.refresh({ originals: true });
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
        ...this.flip,
        isFold: this.model.isFold,
      },
    );
  }

  /**
   * 计算舞台坐标
   *
   * @returns
   */
  calcPathPoints(): IPoint[] {
    let points = this._pathPoints;
    if (this.activeCoordIndex !== -1) {
      const newCoord: IPoint = ElementUtils.calcStageRelativePoint(
        this.model.coords[this.activeCoordIndex],
        this.shield.stageCalcParams,
      );
      points[this.activeCoordIndex] = newCoord;
    } else {
      points = ElementUtils.calcStageRelativePoints(
        this.model.coords,
        this.shield.stageCalcParams,
      );
    }
    return points;
  }

  /**
   * 计算旋转路径坐标
   *
   * @returns
   */
  calcRotatePathPoints(): IPoint[] {
    const center = this.calcCenter();
    return this._pathPoints.map(point =>
      MathUtils.rotateWithCenter(point, this.model.angle, center),
    );
  }

  /**
   * 计算组件包含外边框宽度的坐标
   *
   * @returns
   */
  calcRotateOutlinePathPoints(): IPoint[] {
    const { strokeType, strokeWidth } = this.model.styles;
    return ElementUtils.calcOutlinePoints(
      this._rotatePathPoints,
      strokeType,
      strokeWidth,
      this.flip,
    );
  }

  /**
   * 计算旋转后的盒模型坐标
   */
  calcRotateBoxPoints(): IPoint[] {
    if (!this.model.boxCoords?.length) return [];
    const center = this.calcCenter();
    return this.model.boxCoords.map(coord => {
      const point = ElementUtils.calcStageRelativePoint(
        coord,
        this.shield.stageCalcParams,
      );
      return MathUtils.rotateWithCenter(point, this.model.angle, center);
    });
  }

  /**
   * 计算旋转后的盒模型坐标
   *
   * @returns
   */
  calcRotateBoxCoords(): IPoint[] {
    const centerCoord = this.calcCenterCoord();
    return this.model.boxCoords.map(coord =>
      MathUtils.rotateWithCenter(coord, this.model.angle, centerCoord),
    );
  }

  /**
   * 计算非旋转的最大盒模型
   *
   * @returns
   */
  calcMaxBoxPoints(): IPoint[] {
    return CommonUtils.getBoxPoints(this._rotatePathPoints);
  }

  /**
   * 计算带边框的最大盒模型
   *
   * @returns
   */
  calcMaxOutlineBoxPoints(): IPoint[] {
    return CommonUtils.getBoxPoints(this._rotateOutlinePathPoints);
  }

  /**
   * 计算旋转后的坐标
   *
   * @returns
   */
  calcRotatePathCoords(): IPoint[] {
    const centerCoord = this.calcCenterCoord();
    return this.model.coords.map(coord =>
      MathUtils.rotateWithCenter(coord, this.model.angle, centerCoord),
    );
  }

  /**
   * 计算世界坐标下的旋转边框坐标
   *
   * @returns
   */
  calcRotateOutlinePathCoords(): IPoint[] {
    return ElementUtils.calcOutlinePoints(
      this._rotatePathCoords,
      this.model.styles.strokeType,
      this.model.styles.strokeWidth,
      {
        ...this.flip,
        isFold: this.model.isFold,
      },
    );
  }

  /**
   * 计算中心点
   *
   * @returns
   */
  calcCenter(): IPoint {
    const centerCoord = this.calcCenterCoord();
    return ElementUtils.calcStageRelativePoint(
      centerCoord,
      this.shield.stageCalcParams,
    );
  }

  /**
   * 计算世界坐标中心点
   *
   * @returns
   */
  calcCenterCoord(): IPoint {
    return MathUtils.calcCenter(this.model.boxCoords);
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
      const points = CommonUtils.get4BoxPoints(
        point,
        {
          width: TransformerSize / this.shield.stageScale,
          height: TransformerSize / this.shield.stageScale,
        },
        {
          angle: this.model.actualAngle,
          leanYAngle: this.model.leanYAngle,
        },
      );
      let transformer = this._transformers[index];
      if (transformer) {
        transformer.points = points;
        transformer.x = x;
        transformer.y = y;
      } else {
        transformer = new VerticesTransformer(this, x, y, points);
      }
      return transformer;
    });
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
      const nextPoint = CommonUtils.getNextOfArray(
        this._rotateBoxPoints,
        index,
      );
      let borderTransformer = this._borderTransformers[index];
      if (borderTransformer) {
        borderTransformer.start = point;
        borderTransformer.end = nextPoint;
      } else {
        borderTransformer = new BorderTransformer(
          this,
          point,
          nextPoint,
          index,
        );
      }
      return borderTransformer;
    });
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
   * 计算非倾斜盒模型坐标
   *
   * @returns
   */
  calcUnLeanCoords(): IPoint[] {
    return MathUtils.calcUnLeanByPoints(
      this.model.coords,
      0,
      this.model.leanYAngle,
    );
  }

  /**
   * 计算非倾斜盒模型坐标
   *
   * @returns
   */
  calcUnleanBoxCoords(): IPoint[] {
    return MathUtils.calcUnLeanByPoints(
      this.model.boxCoords,
      0,
      this.model.leanYAngle,
    );
  }

  /**
   * 计算非倾斜点坐标
   *
   * @returns
   */
  calcUnLeanPoints(): IPoint[] {
    const coords = this.calcUnLeanCoords();
    return ElementUtils.calcStageRelativePoints(
      coords,
      this.shield.stageCalcParams,
    );
  }

  /**
   * 计算非倾斜盒模型坐标
   *
   * @returns
   */
  calcUnLeanBoxPoints(): IPoint[] {
    const boxCoords = this.calcUnleanBoxCoords();
    return ElementUtils.calcStageRelativePoints(
      boxCoords,
      this.shield.stageCalcParams,
    );
  }

  /**
   * 计算内部角度
   *
   * @returns
   */
  calcInternalAngle(): number {
    return MathUtils.calcInternalAngle(this.model.boxCoords);
  }

  /**
   * 计算倾斜角度
   *
   * @returns
   */
  calcLeanYAngle(): number {
    if (!this.leanYAngleCalcEnable) return 0;
    return MathUtils.calcLeanYAngle(this.model.internalAngle, this.flipX);
  }

  /**
   * 计算视角角度
   *
   * @returns
   */
  calcViewAngle(): number {
    if (!this.viewAngleCalcEnable) return this.model.angle;
    return MathUtils.calcViewAngleByPoints(this.rotateBoxCoords);
  }

  /**
   * 计算实际角度
   *
   * @returns
   */
  calcActualAngle(): number {
    return MathUtils.mirrorAngle(this.model.viewAngle - this.model.leanYAngle);
  }

  /**
   * 刷新角度
   */
  refreshAngles(options?: RefreshAnglesOptions): void {
    options = options || DefaultRefreshAnglesOptions;
    // 计算视觉角度
    if (options.view) this.model.viewAngle = this.calcViewAngle();
    // 计算内部角度
    if (options.internal) this.model.internalAngle = this.calcInternalAngle();
    // 计算y倾斜角度
    if (options.leanY) this.model.leanYAngle = this.calcLeanYAngle();
    // 计算实际角度
    if (options.actual) this.model.actualAngle = this.calcActualAngle();
  }

  /**
   * 刷新旋转坐标
   */
  refreshRotation(): void {
    this.rotation.refresh();
  }

  /**
   * 刷新舞台坐标
   */
  refreshPoints() {
    // 计算舞台坐标
    this._pathPoints = this.calcPathPoints();
    // 计算旋转后的路径点
    this._rotatePathPoints = this.calcRotatePathPoints();
    // 计算旋转后的路径坐标
    this._rotatePathCoords = this.calcRotatePathCoords();
    // 计算旋转后的盒模型点
    this._rotateBoxPoints = this.calcRotateBoxPoints();
    // 计算旋转后的盒模型坐标
    this._rotateBoxCoords = this.calcRotateBoxCoords();
    // 计算变换器
    this._transformers = this.calcTransformers();
    // 判断是否启用边框变换
    if (this.borderTransformEnable) {
      // 计算边框变换器
      this._borderTransformers = this.calcBorderTransformers();
    }
    // 计算最大盒模型点
    this._maxBoxPoints = this.calcMaxBoxPoints();
    // 计算矩形
    this._rect = this.calcRect();
    // 刷新边框路径点
    this._refreshOutlinePoints();
  }

  /**
   * 判断是否包含点
   *
   * @param point
   */
  isContainsPoint(point: IPoint): boolean {
    return MathUtils.isPointInPolygonByRayCasting(
      point,
      this.rotateOutlinePathPoints,
    );
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
    // 维护原始旋转路径点
    this._originalRotatePathPoints = cloneDeep(this._rotatePathPoints);
    // 维护原始旋转盒模型点
    this._originalRotateBoxPoints = cloneDeep(this._rotateBoxPoints);
    // 维护原始矩形
    this._originalSize = { width: this.model.width, height: this.model.height };
    // 维护原始变换矩阵
    this._originalTransformMatrix = [];
    // 如果路径点存在，则维护原始中心点
    if (this.pathPoints.length) {
      this._originalCenter = cloneDeep(this.calcCenter());
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
        y,
      };
    });
  }

  /**
   * 重新维护原始坐标
   */
  refreshOriginalModelCoords() {
    // 维护原始模型坐标
    this._originalModelCoords = cloneDeep(this.model.coords);
    // 维护原始模型盒模型坐标
    this._originalModelBoxCoords = cloneDeep(this.model.boxCoords);
    // 维护原始中心点坐标
    this._originalCenterCoord = cloneDeep(this.calcCenterCoord());
  }

  /**
   * 重新维护原始属性，用于组件的移动、旋转、大小变换
   */
  refreshOriginalProps(): void {
    // 维护原始模型坐标
    this.refreshOriginalModelCoords();
    // 维护原始变换器坐标
    this.refreshOriginalTransformerPoints();
    // 维护原始组件属性
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
    const centerCoord = this.calcCenterCoord();
    Object.assign(this.model, centerCoord);
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
    let angle;
    if (this.model.angle > 0) {
      angle = this.model.angle - 180;
    } else {
      angle = this.model.angle + 180;
    }
    this.model.angle = MathUtils.mirrorAngle(angle);
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
  protected batchCalcTransformPointsByCenter(
    points: IPoint[],
    matrix: number[][],
    lockPoint: IPoint,
    centroid: IPoint,
  ): IPoint[] {
    points = this.calcTransformPointsByCenter(
      points,
      matrix,
      lockPoint,
      centroid,
      this.angles,
    );
    return ElementUtils.calcWorldPoints(points, this.shield.stageCalcParams);
  }

  /**
   * 计算变换后的点
   *
   * @param points
   * @param matrix
   * @param lockPoint
   * @param centroid
   * @param angles
   * @returns
   */
  protected calcTransformPointsByCenter(
    points: IPoint[],
    matrix: number[][],
    lockPoint: IPoint,
    centroid: IPoint,
    angles: Partial<AngleModel>,
  ): IPoint[] {
    const center = ElementUtils.calcMatrixPoint(
      centroid,
      matrix,
      lockPoint,
      angles,
    );
    return points.map(point => {
      point = ElementUtils.calcMatrixPoint(point, matrix, lockPoint, angles);
      // 坐标重新按照角度偏转
      return MathUtils.rotateWithCenter(point, -angles.angle, center);
    });
  }

  /**
   * 形变
   *
   * @param offset
   */
  transform(offset: IPoint): void {
    // 如果有顶点变形器激活，则进行顶点变形
    if (this.getActiveElementTransformer()) {
      this.transformByVertices(offset);
      this._transformType = TransformTypes.vertices;
    } else if (this.getActiveElementBorderTransformer()) {
      // 否则如果有边框变形器激活，则进行边框变形
      this.transformByBorder(offset);
      this._transformType = TransformTypes.border;
    }
    this.refresh(
      {
        points: true,
        rotation: true,
        size: true,
        position: true,
        angles: true,
      },
      { angles: { view: true, actual: true } },
    );
  }

  /**
   * 矩阵变换
   *
   * @param options
   * @returns
   */
  transformBy(options: TransformByOptions): void {
    // 解构参数
    const {
      lockPoint,
      lockIndex,
      transformType,
      originalMovingPoint,
      offset,
      groupAngle,
      groupLeanYAngle,
    } = options;
    // 还原坐标需要用到的角度
    const groupAngles = { angle: groupAngle, leanYAngle: groupLeanYAngle };
    // 获取变换矩阵
    const matrix = this.getTransformMatrix(
      lockPoint,
      originalMovingPoint,
      offset,
      groupAngles,
      false,
    );
    // 如果变换类型为边框，则调整矩阵
    if (transformType === TransformTypes.border) {
      // 调整矩阵
      this._transBorderMatrix(matrix, lockIndex, false);
    }
    // 执行矩阵变换
    this._doTransformBy(matrix, lockPoint, groupAngles, originalMovingPoint);
  }

  /**
   * 执行矩阵变换
   *
   * @param matrix
   * @param lockPoint
   * @param groupAngles
   * @param originalMovingPoint
   */
  private _doTransformBy(
    matrix: number[][],
    lockPoint: IPoint,
    groupAngles: AngleModel,
    originalMovingPoint?: IPoint,
  ): void {
    // 计算变换后的点
    const points = ElementUtils.calcMatrixPoints(
      this._originalRotatePathPoints,
      matrix,
      lockPoint,
      groupAngles,
    );
    // 计算变换后的盒模型坐标
    const boxPoints = ElementUtils.calcMatrixPoints(
      this._originalRotateBoxPoints,
      matrix,
      lockPoint,
      groupAngles,
    );
    // 执行矩阵变换
    this._doTransformByPoints(
      points,
      boxPoints,
      lockPoint,
      matrix,
      originalMovingPoint,
    );
  }

  /**
   * 执行矩阵变换
   *
   * @param points
   * @param boxPoints
   * @param lockPoint
   * @param matrix
   * @param originalMovingPoint
   */
  private _doTransformByPoints(
    points: IPoint[],
    boxPoints: IPoint[],
    lockPoint: IPoint,
    matrix?: number[][],
    originalMovingPoint?: IPoint,
  ): void {
    // 计算内角
    this.model.internalAngle = MathUtils.calcInternalAngle(boxPoints);
    // 计算y倾斜角度
    this.model.leanYAngle = MathUtils.calcLeanYAngle(
      this.model.internalAngle,
      MathUtils.calcFlipXByPoints(boxPoints),
    );
    // 计算变换后的角度
    this.model.angle = MathUtils.mirrorAngle(
      MathUtils.calcActualAngleByPoints(boxPoints),
    );
    // 计算变换后的坐标
    const coords = ElementUtils.calcCoordsByTransPathPoints(
      points,
      this.angles,
      lockPoint,
      this.shield.stageCalcParams,
    );
    // 计算变换后的盒模型坐标
    const boxCoords = ElementUtils.calcCoordsByTransPathPoints(
      boxPoints,
      this.angles,
      lockPoint,
      this.shield.stageCalcParams,
    );
    // 设置变换后的坐标
    this.model.coords = coords;
    // 设置变换后的盒模型坐标
    this.model.boxCoords = boxCoords;
    // 判断是否需要翻转角度
    if (originalMovingPoint && matrix) {
      this._tryFlipAngle(lockPoint, originalMovingPoint, matrix);
    }
    this.refresh(
      {
        points: true,
        rotation: true,
        size: true,
        position: true,
        angles: true,
      },
      { angles: { view: true, actual: true } },
    );
  }

  /**
   * 按顶点形变
   *
   * @param offset
   * @returns
   */
  transformByVertices(offset: IPoint): void {
    if (!this.verticesTransformEnable && !this.boxVerticesTransformEnable)
      return;
    this.doVerticesTransform(offset);
  }

  /**
   * 按顶点变换
   *
   * @param offset
   * @returns
   */
  protected doVerticesTransform(offset: IPoint): void {
    const index = this._transformers.findIndex(item => item.isActive);
    if (index !== -1) {
      // 不动点坐标索引
      const lockIndex = CommonUtils.getPrevIndexOfArray(
        this._transformers.length,
        index,
        2,
      );
      // 不动点
      const lockPoint = this._originalTransformerPoints[lockIndex];
      // 当前拖动的点的原始位置
      const currentPointOriginal = this._originalTransformerPoints[index];
      // 当前拖动的点的原始位置
      this._transformOriginalMovingPoint = currentPointOriginal;
      // 根据不动点进行形变
      this.transformByLockPoint(lockPoint, currentPointOriginal, offset, index);
    }
  }

  /**
   * 根据不动点进行顶点变换
   *
   * @param lockPoint
   * @param currentPointOriginal
   * @param offset
   * @param index
   */
  protected transformByLockPoint(
    lockPoint: IPoint,
    currentPointOriginal: IPoint,
    offset: IPoint,
    lockIndex: number,
  ): void {
    // 获取变换矩阵
    const matrix = this.getTransformMatrix(
      lockPoint,
      currentPointOriginal,
      offset,
      this.angles,
    );
    // 设置变换矩阵
    this._transformMatrix = matrix;
    // 设置变换不动点
    this._transformLockPoint = lockPoint;
    // 设置变换不动点索引
    this._transformLockIndex = lockIndex;
    // 设置变换坐标
    this.model.coords = this.batchCalcTransformPointsByCenter(
      this._originalRotatePathPoints,
      matrix,
      lockPoint,
      this._originalCenter,
    );
    // 设置变换盒模型坐标
    this.model.boxCoords = this.batchCalcTransformPointsByCenter(
      this._originalRotateBoxPoints,
      matrix,
      lockPoint,
      this._originalCenter,
    );
    // 判断是否需要翻转角度
    this._tryFlipAngle(lockPoint, currentPointOriginal, matrix);
  }

  /**
   * 获取变换矩阵
   *
   * @param lockPoint
   * @param currentPointOriginal
   * @param offset
   * @param angles
   * @param wouldBeRatioLock
   * @returns
   */
  protected getTransformMatrix(
    lockPoint: IPoint,
    currentPointOriginal: IPoint,
    offset: IPoint,
    angles: Partial<AngleModel>,
    wouldBeRatioLock?: boolean,
  ): number[][] {
    if (typeof wouldBeRatioLock === "undefined") {
      wouldBeRatioLock = true;
    }
    // 当前拖动的点当前的位置
    const currentPoint = {
      x: currentPointOriginal.x + offset.x,
      y: currentPointOriginal.y + offset.y,
    };
    // 判断当前拖动点，在坐标系垂直轴的左边还是右边
    const matrix = MathUtils.calcTransformMatrix(
      lockPoint,
      currentPoint,
      currentPointOriginal,
      angles,
    );
    // 如果需要比例锁定，则调整纵轴缩放系数
    if (wouldBeRatioLock && this.shouldRatioLockResize) {
      // 调整纵轴缩放系数
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
  protected _tryFlipAngle(
    lockPoint: IPoint,
    currentPointOriginal: IPoint,
    matrix: number[][],
  ): boolean {
    // 判断是否已经计算过原始矩阵
    if (!this._originalTransformMatrix.length) {
      // 计算原始矩阵
      this._originalTransformMatrix = MathUtils.calcTransformMatrix(
        lockPoint,
        currentPointOriginal,
        currentPointOriginal,
        this.angles,
      );
    }
    // 判断是否需要翻转角度
    const isFlip = this._doFlipAngle(matrix, this._originalTransformMatrix);
    // 如果需要翻转角度，则更新原始矩阵
    if (isFlip) {
      // 更新原始矩阵以便下次判断是否需要翻转角度
      this._originalTransformMatrix = cloneDeep(matrix);
    }
    return isFlip;
  }

  /**
   * 翻转角度
   *
   * @param matrix
   * @param originalMatrix
   * @returns
   */
  protected _doFlipAngle(
    matrix: number[][],
    originalMatrix: number[][],
  ): boolean {
    // 原始的纵轴缩放系数
    const xScaleOriginal = originalMatrix[0][0];
    const yScaleOriginal = originalMatrix[1][1];
    // 纵轴缩放系数
    const xScale = matrix[0][0];
    const yScale = matrix[1][1];

    // 判断横轴缩放系数是否与原始的相同，如果不同，则旋转角度
    if (!MathUtils.isSameSign(yScale, yScaleOriginal)) {
      this.flipAngle();
      return true;
    }
    return false;
  }

  /**
   * 按边框形变
   *
   * @param offset
   * @returns
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
    const lockIndex = CommonUtils.getPrevIndexOfArray(
      this._borderTransformers.length,
      index,
      2,
    );
    // 不动边的点2索引
    const lockNextIndex = CommonUtils.getNextIndexOfArray(
      this._borderTransformers.length,
      index,
      3,
    );
    // 不动点
    return MathUtils.calcCenter([
      this._originalTransformerPoints[lockIndex],
      this._originalTransformerPoints[lockNextIndex],
    ]);
  }

  /**
   * 调整边框矩阵
   *
   * @param matrix
   * @param index
   * @param wouldBeRatioLock
   * @returns
   */
  private _transBorderMatrix(
    matrix: number[][],
    index: number,
    wouldBeRatioLock?: boolean,
  ): number[][] {
    if (typeof wouldBeRatioLock === "undefined") {
      wouldBeRatioLock = true;
    }
    const rationLock = wouldBeRatioLock && this.shouldRatioLockResize;
    if (index === 0 || index === 2) {
      // 调整高度，0上边/2下边
      matrix[0][0] = rationLock
        ? MathUtils.resignValue(matrix[0][0], matrix[1][1])
        : 1;
    } else if (index === 1 || index === 3) {
      // 调整宽度，1左边/3右边
      matrix[1][1] = rationLock
        ? MathUtils.resignValue(matrix[1][1], matrix[0][0])
        : 1;
    }
    // 如果是调整宽度，并且纵轴缩放系数小于0，则取绝对值
    if ([1, 3].includes(index) && matrix[1][1] < 0) {
      matrix[1][1] = Math.abs(matrix[1][1]);
    }
    // 如果是调整高度，并且横轴缩放系数小于0，则取绝对值
    if ([0, 2].includes(index) && matrix[0][0] < 0) {
      matrix[0][0] = Math.abs(matrix[0][0]);
    }
    return matrix;
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
      // 当前拖动的点的原始位置
      this._transformOriginalMovingPoint = currentPointOriginal;
      // 当前拖动的点当前的位置
      const currentPoint = {
        x: currentPointOriginal.x + offset.x,
        y: currentPointOriginal.y + offset.y,
      };
      // 判断当前拖动点，在坐标系垂直轴的左边还是右边
      const matrix = MathUtils.calcTransformMatrix(
        lockPoint,
        currentPoint,
        currentPointOriginal,
        this.angles,
      );
      // 调整矩阵
      this._transBorderMatrix(matrix, index);
      // 设置变换矩阵
      this._transformMatrix = matrix;
      // 设置变换不动点
      this._transformLockPoint = lockPoint;
      // 设置变换不动点索引
      this._transformLockIndex = index;
      // 设置变换坐标
      this.model.coords = this.batchCalcTransformPointsByCenter(
        this._originalRotatePathPoints,
        matrix,
        lockPoint,
        this._originalCenter,
      );
      // 设置变换盒模型坐标
      this.model.boxCoords = this.batchCalcTransformPointsByCenter(
        this._originalRotateBoxPoints,
        matrix,
        lockPoint,
        this._originalCenter,
      );
      // 尝试翻转角度
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
   * @param options
   * @param subOptions
   */
  refresh(
    options?: RefreshOptions,
    subOptions?: { angles?: RefreshAnglesOptions },
  ): void {
    options = options || DefaultElementRefreshOptions;
    // 刷新舞台坐标
    if (options?.points) this.refreshPoints();
    // 刷新尺寸
    if (options?.size) this.refreshSize();
    // 刷新位置
    if (options?.position) this.refreshPosition();
    // 刷新角度
    if (options?.angles) this.refreshAngles(subOptions?.angles);
    // 刷新旋转
    if (options?.rotation) this.refreshRotation();
    // 刷新原始属性
    if (options?.originals) this.refreshOriginalProps();
  }

  /**
   * 刷新与边框设置相关的坐标
   */
  protected _refreshOutlinePoints(): void {
    // 计算旋转后的边框路径点
    this._rotateOutlinePathPoints = this.calcRotateOutlinePathPoints();
    // 计算旋转后的边框路径坐标
    this._rotateOutlinePathCoords = this.calcRotateOutlinePathCoords();
    // 计算最大边框盒模型点
    this._maxOutlineBoxPoints = this.calcMaxOutlineBoxPoints();
  }

  /**
   * 设置组件宽度
   *
   * @param value
   */
  setWidth(value: number): number[][] {
    const matrix = MathUtils.calcScaleMatrix(
      value / this._originalSize.width,
      1,
    );
    // 调整矩阵
    matrix[1][1] = this.shouldRatioLockResize
      ? MathUtils.resignValue(matrix[1][1], matrix[0][0])
      : 1;
    this._setWH(matrix);
    return matrix;
  }

  /**
   * 设置组件高度
   *
   * @param value
   */
  setHeight(value: number): number[][] {
    // 计算变换矩阵
    const matrix = MathUtils.calcScaleMatrix(
      1,
      value / this._originalSize.height,
    );
    // 调整矩阵
    matrix[0][0] = this.shouldRatioLockResize
      ? MathUtils.resignValue(matrix[0][0], matrix[1][1])
      : 1;
    this._setWH(matrix);
    return matrix;
  }

  /**
   * 按比例缩放
   *
   * @param center
   * @param scaleX
   * @param scaleY
   * @param group
   */
  scaleBy(
    center: IPoint,
    scaleX: number,
    scaleY: number,
    group?: Partial<AngleModel>,
  ): void {
    const matrix = MathUtils.calcScaleMatrix(scaleX, scaleY);
    if (group) {
      this._doTransformBy(matrix, center, group);
    } else {
      this.model.coords = this.batchCalcTransformPointsByCenter(
        this._originalRotatePathPoints,
        matrix,
        center,
        this._originalCenter,
      );
      this.model.boxCoords = this.batchCalcTransformPointsByCenter(
        this._originalRotateBoxPoints,
        matrix,
        center,
        this._originalCenter,
      );
    }
    this.refresh({
      points: true,
      size: true,
      position: true,
      rotation: true,
      originals: true,
    });
  }

  /**
   * 设置宽高
   *
   * @param matrix
   */
  private _setWH(matrix: number[][]): void {
    // 设置变换矩阵
    this._transformMatrix = matrix;
    // 设置变换不动点
    this._transformLockPoint = this._originalCenter;
    // 设置变换坐标
    this.model.coords = this.batchCalcTransformPointsByCenter(
      this._originalRotatePathPoints,
      matrix,
      this._originalCenter,
      this._originalCenter,
    );
    // 设置变换盒模型坐标
    this.model.boxCoords = this.batchCalcTransformPointsByCenter(
      this._originalRotateBoxPoints,
      matrix,
      this._originalCenter,
      this._originalCenter,
    );
    // 刷新组件
    this.refresh({
      points: true,
      size: true,
      position: true,
      rotation: true,
      originals: true,
    });
  }

  /**
   * 设置坐标
   *
   * @param x
   * @param y
   * @param offset
   */
  setPosition(x: number, y: number, offset: IPoint): void {
    // 设置位置
    this.model.x = x;
    this.model.y = y;
    // 设置变换坐标
    this.model.coords = ElementUtils.translateCoords(this.model.coords, offset);
    // 设置变换盒模型坐标
    this.model.boxCoords = ElementUtils.translateCoords(
      this.model.boxCoords,
      offset,
    );
    // 刷新组件
    this.refresh();
  }

  /**
   * 设置角度
   *
   * @param value
   */
  setAngle(value: number): void {
    this.model.angle = value;
    this.refresh(null, { angles: { view: true, actual: true } });
  }

  /**
   * 设置Y倾斜角度
   *
   * @param value
   */
  setLeanYAngle(value: number): void {
    // 限制倾斜角度
    value = clamp(value, -89, 89);
    // 计算非倾斜坐标
    const coords = this.calcUnLeanCoords();
    // 计算中心坐标
    const centerCoord = this.calcCenterCoord();
    // 重新计算倾斜坐标
    this.model.coords = MathUtils.batchLeanYWithCenter(
      coords,
      value,
      centerCoord,
    );
    // 计算非倾斜盒模型坐标
    const boxCoords = this.calcUnleanBoxCoords();
    // 重新计算倾斜盒模型坐标
    this.model.boxCoords = MathUtils.batchLeanYWithCenter(
      boxCoords,
      value,
      centerCoord,
    );
    // 刷新y倾斜角度
    this.model.leanYAngle = value;
    // 刷新角度选项
    this.refresh(null, {
      angles: { view: true, actual: true, internal: true },
    });
  }

  /**
   * 组合子组件倾斜
   *
   * @param value
   * @param prevValue
   * @param groupAngle
   * @param center
   */
  leanYBy(
    value: number,
    prevValue: number,
    groupAngle: number,
    center: IPoint,
  ): void {
    // 计算旋转偏移前的坐标
    let points = MathUtils.batchTransWithCenter(
      this._rotatePathPoints,
      { angle: groupAngle, leanYAngle: prevValue },
      center,
      true,
    );
    // 计算旋转偏移前的盒模型坐标
    let boxPoints = MathUtils.batchTransWithCenter(
      this._rotateBoxPoints,
      { angle: groupAngle, leanYAngle: prevValue },
      center,
      true,
    );
    // 计算偏移后的坐标
    points = MathUtils.batchTransWithCenter(
      points,
      { angle: groupAngle, leanYAngle: value },
      center,
    );
    // 计算偏移后的盒模型坐标
    boxPoints = MathUtils.batchTransWithCenter(
      boxPoints,
      { angle: groupAngle, leanYAngle: value },
      center,
    );
    this._doTransformByPoints(points, boxPoints, center);
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

  /**
   * 按照某一点为圆心，旋转指定角度
   *
   * @param value
   * @param lockCenter
   */
  rotateBy(deltaAngle: number, lockCenterCoord: IPoint): void {
    // 计算旋转后的中心点坐标
    const newCenterCoord = MathUtils.rotateWithCenter(
      this._originalCenterCoord,
      deltaAngle,
      lockCenterCoord,
    );
    // 计算偏移量
    const offset = {
      dx: newCenterCoord.x - this._originalCenterCoord.x,
      dy: newCenterCoord.y - this._originalCenterCoord.y,
    };
    // 计算变换后的坐标
    const coords = this._originalModelCoords.map(coord =>
      MathUtils.translate(coord, offset),
    );
    // 计算变换后的盒模型坐标
    const boxCoords = this._originalModelBoxCoords.map(coord =>
      MathUtils.translate(coord, offset),
    );
    // 设置变换坐标
    this.model.coords = coords;
    // 设置变换盒模型坐标
    this.model.boxCoords = boxCoords;
    // 设置变换角度
    this.model.angle = MathUtils.mirrorAngle(
      MathUtils.normalizeAngle(this._originalAngle) +
        (MathUtils.normalizeAngle(deltaAngle) % 360),
    );
    // 刷新
    this.refresh({
      points: true,
      rotation: true,
      position: true,
      angles: true,
    });
  }

  /**
   * 激活旋转
   */
  activeRotation(): void {
    // 设置旋转为激活状态
    this.rotation.isActive = true;
  }

  /**
   * 取消旋转
   */
  deActiveRotation(): void {
    // 设置旋转为非激活状态
    this.rotation.isActive = false;
  }

  /**
   * 恢复原始角度
   */
  refreshOriginalAngle(): void {
    // 设置原始角度
    this._originalAngle = this.model.angle;
  }

  /**
   * 转换为JSON
   *
   * @returns
   */
  toJson(): ElementObject {
    return JSON.parse(JSON.stringify({ ...this.model, ...this.flip }));
  }

  /**
   * 从JSON转换
   *
   * @param json
   */
  fromJson(json: ElementObject): void {
    this.model = JSON.parse(JSON.stringify(json));
  }
}
