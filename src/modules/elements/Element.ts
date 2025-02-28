import { ElementStatus, IPoint, ISize } from "@/types";
import { ILinkedNode, ILinkedNodeValue } from "@/modules/struct/LinkedNode";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { clamp, cloneDeep, isNumber, some } from "lodash";
import { action, makeObservable, observable, computed } from "mobx";
import IElement, { AngleModel, DefaultElementRefreshOptions, DefaultRefreshAnglesOptions, ElementObject, FlipModel, RefreshAnglesOptions, RefreshOptions, TransformByOptions } from "@/types/IElement";
import { DefaultFillStyle, DefaultStrokeStyle, FillStyle, StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";
import { RotateControllerMargin, RotationSize, TransformerSize } from "@/styles/MaskStyles";
import IElementRotation from "@/types/IElementRotation";
import ElementRotation from "@/modules/elements/rotation/ElementRotation";
import IStageShield from "@/types/IStageShield";
import CanvasUtils from "@/utils/CanvasUtils";
import { IVerticesTransformer, TransformerTypes, IBorderTransformer } from "@/types/ITransformer";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";
import BorderTransformer from "@/modules/handler/transformer/BorderTransformer";
import { IElementGroup } from "@/types/IElementGroup";
import { CreatorTypes } from "@/types/Creator";
import { TransformTypes } from "@/types/Stage";
import IController, { IPointController } from "@/types/IController";
import RotateController from "@/modules/handler/controller/RotateController";
import CreatorHelper from "@/types/CreatorHelper";

export default class Element implements IElement, ILinkedNodeValue {
  // 组件模型
  model: ElementObject;
  // 组件旋转
  rotation: IElementRotation;
  // 舞台
  shield: IStageShield;
  // 所属节点
  node: ILinkedNode<IElement>;

  // 原始变换器点坐标
  _originalTransformerCoords: IPoint[] = [];
  // 原始模型坐标
  _originalCoords: IPoint[] = [];
  // 原始旋转坐标
  _originalRotateCoords: IPoint[] = [];
  // 原始模型盒模型坐标
  _originalBoxCoords: IPoint[] = [];
  // 原始旋转盒模型坐标
  _originalRotateBoxCoords: IPoint[] = [];
  // 原始旋转轮廓坐标
  _originalRotateOutlineCoords: IPoint[][] = [];
  // 原始描边坐标
  _originalStrokeCoords: IPoint[][] = [];
  // 原始不倾斜坐标
  _originalUnLeanCoords: IPoint[] = [];
  // 原始不倾斜盒模型坐标
  _originalUnLeanBoxCoords: IPoint[] = [];
  // 原始不倾斜描边坐标
  _originalUnLeanStrokeCoords: IPoint[][] = [];
  // 原始最大盒模型坐标
  _originalMaxBoxCoords: IPoint[] = [];
  // 原始最大轮廓坐标
  _originalMaxOutlineBoxCoords: IPoint[] = [];
  // 原始变换矩阵
  _originalTransformMatrix: number[][] = [];
  // 变换原始拖动点
  _originalTransformMoveCoord: IPoint;
  // 原始中心点-世界坐标系
  _originalCenterCoord: IPoint;
  // 原始角度-舞台坐标系&世界坐标系
  _originalAngle: number = 0;
  // 原始盒模型-舞台坐标系
  _originalSize: Partial<DOMRect> = {};

  // 变换矩阵
  _transformMatrix: number[][] = [];
  // 变换不动点
  _transformLockCoord: IPoint;
  // 变换不动点索引
  _transformLockIndex: number;

  // 不倾斜路径点-世界坐标系
  _unLeanCoords: IPoint[] = [];
  // 不倾斜盒模型-世界坐标系
  _unLeanBoxCoords: IPoint[] = [];
  // 最大盒模型-舞台坐标系
  _maxBoxCoords: IPoint[] = [];
  // 旋转坐标-世界坐标系
  _rotateCoords: IPoint[] = [];
  // 旋转盒模型坐标-舞台坐标系
  _rotateBoxCoords: IPoint[] = [];
  // 旋转坐标计算出来的最大外框盒模型-舞台坐标系
  _maxOutlineBoxCoords: IPoint[] = [];
  // 旋转外框线坐标-世界坐标系(组件对齐时使用)
  _rotateOutlineCoords: IPoint[][] = [];
  // 描边坐标-世界坐标系
  _strokeCoords: IPoint[][] = [];
  // 不倾斜描边坐标-世界坐标系
  _unLeanStrokeCoords: IPoint[][] = [];

  // 盒模型
  _rect: Partial<DOMRect> = {};
  // 顶点变换器-舞台坐标系
  _transformers: IVerticesTransformer[] = [];
  // 边框变换器-舞台坐标系
  _borderTransformers: IBorderTransformer[] = [];
  // 变换器类型
  _transformType: TransformTypes;
  // 旋转控制器
  _rotateControllers: IPointController[] = [];
  // 最小倾斜矩阵垂直尺寸
  _minParallelogramVerticalSize: number;

  // 用于记录翻转状态
  private _flipX: boolean = false;
  // 用于记录内边框线段点索引
  private _innermostStrokeCoordIndex: number = 0;

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
  // 是否正在修改圆角
  @observable _isCornerMoving: boolean = false;
  // 是否处于临时状态
  @observable _isProvisional: boolean = false;
  // 是否命中
  @observable _isTarget: boolean = false;
  // 是否在选区范围内
  @observable _isInRange: boolean = false;
  // 是否在舞台上
  @observable _isOnStage: boolean = false;

  // 组件ID
  get id(): string {
    return this.model.id;
  }

  // 是否是组件
  get isElement(): boolean {
    return CreatorHelper.isElement(this.model.type);
  }

  // 是否是组合
  get isGroup(): boolean {
    return this.model.type === CreatorTypes.group;
  }

  // 所属组合
  get group(): IElementGroup {
    if (!this.isGroupSubject) return null;
    return this.shield.store.getElementById(this.model.groupId) as IElementGroup;
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

  // 获取边框线段坐标
  get strokeCoords(): IPoint[][] {
    return this._strokeCoords;
  }

  get unLeanStrokeCoords(): IPoint[][] {
    return this._unLeanStrokeCoords;
  }

  /**
   * 获取最内边框线段点索引
   */
  get innermostStrokeCoordIndex(): number {
    return this._innermostStrokeCoordIndex;
  }

  /**
   * 获取最内边框线段点
   */
  get innermostStrokeCoords(): IPoint[] {
    return this._strokeCoords[this.innermostStrokeCoordIndex];
  }

  // 是否翻转X轴
  @computed
  get flipX(): boolean {
    if (!this.flipXEnable || !this.boxVerticesTransformEnable) return false;
    if (!this._isTransforming) return this._flipX;
    this._flipX = MathUtils.calcFlipXByPoints(this.model.boxCoords);
    return this._flipX;
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
    return this.ratioLockedEnable && (this.isRatioLocked || this.shield.event.isShift);
  }

  // 获取变形/移动/旋转操作之前的原始坐标
  get originalCoords(): IPoint[] {
    return this._originalCoords;
  }

  // 获取原始模型盒模型坐标
  get originalBoxCoords(): IPoint[] {
    return this._originalBoxCoords;
  }

  @computed
  get width(): number {
    return this.model.width;
  }

  @computed
  get height(): number {
    return this.model.height;
  }

  get minParallelogramVerticalSize(): number {
    return this._minParallelogramVerticalSize;
  }

  @computed
  get angle(): number {
    return this.getAngle();
  }

  @computed
  get corners(): number[] {
    return this.model.corners;
  }

  get center(): IPoint {
    return ElementUtils.calcStageRelativePoint(this.centerCoord);
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
  get strokes(): StrokeStyle[] {
    return this.model.styles.strokes;
  }

  @computed
  get fills(): FillStyle[] {
    return this.model.styles.fills;
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
  get isCornerMoving(): boolean {
    return this._isCornerMoving;
  }

  set isCornerMoving(value: boolean) {
    this._setIsCornerMoving(value);
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
  _setStatus(status: ElementStatus): void {
    this.__setStatus(status);
  }

  __setStatus(status: ElementStatus): void {
    this._status = status;
  }

  @action
  _setIsSelected(value: boolean): void {
    this.__setIsSelected(value);
  }

  __setIsSelected(value: boolean): void {
    this._isSelected = value;
  }

  @action
  _setIsVisible(value: boolean): void {
    this._isVisible = value;
  }

  @action
  _setIsEditing(value: boolean): void {
    this._isEditing = value;
  }

  @action
  _setIsLocked(value: boolean): void {
    this._isLocked = value;
  }

  @action
  _setIsMoving(value: boolean): void {
    this._isMoving = value;
  }

  @action
  _setIsTransforming(value: boolean): void {
    this._isTransforming = value;
  }

  @action
  _setIsRotating(value: boolean): void {
    this._isRotating = value;
  }

  @action
  _setIsRotatingTarget(value: boolean): void {
    this._isRotatingTarget = value;
  }

  @action
  _setIsDragging(value: boolean): void {
    this._isDragging = value;
  }

  @action
  _setIsRendered(value: boolean): void {
    this._isProvisional = value;
  }

  @action
  _setIsTarget(value: boolean): void {
    this._isTarget = value;
  }

  @action
  _setIsOnStage(value: boolean): void {
    this._isOnStage = value;
  }

  @action
  _setIsInRange(value: boolean): void {
    this._isInRange = value;
  }

  @action
  _setIsCornerMoving(value: boolean): void {
    this._isCornerMoving = value;
  }

  get maxBoxCoords(): IPoint[] {
    return this._maxBoxCoords;
  }

  get maxOutlineBoxCoords(): IPoint[] {
    return this._maxOutlineBoxCoords;
  }

  get rotateCoords(): IPoint[] {
    return this._rotateCoords;
  }

  get rotateBoxCoords(): IPoint[] {
    return this._rotateBoxCoords;
  }

  get rotateOutlineCoords(): IPoint[][] {
    return this._rotateOutlineCoords;
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

  get alignCoords(): IPoint[] {
    return this._rotateCoords;
  }

  get alignOutlineCoords(): IPoint[][] {
    return this._rotateOutlineCoords;
  }

  get visualStrokeWidth(): number {
    return Math.max(...this.strokes.map(stroke => stroke.width * this.shield.stageScale));
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

  get transformLockCoord(): IPoint {
    return this._transformLockCoord;
  }

  get originalTransformMoveCoord(): IPoint {
    return this._originalTransformMoveCoord;
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

  get cornersModifyEnable(): boolean {
    return false;
  }

  get rotateControllers(): IPointController[] {
    return this._rotateControllers;
  }

  get controllers(): IController[] {
    const result: IController[] = [];

    if (this.rotationEnable) {
      if (this.shield.configure.rotationIconEnable) {
        result.push(this.rotation);
      }
      result.push(...this._rotateControllers);
    }
    if (this.verticesTransformEnable || this.boxVerticesTransformEnable) {
      result.push(...this._transformers);
    }
    if (this.borderTransformEnable) {
      result.push(...this._borderTransformers);
    }
    return result;
  }

  get isTopmost(): boolean {
    return this.node.next === null;
  }

  get isBottommost(): boolean {
    return this.node.prev === null;
  }

  get isInMultiSelected(): boolean {
    const { selectedElementIds } = this.shield.store;
    return selectedElementIds.has(this.id) && selectedElementIds.size > 1;
  }

  constructor(model: ElementObject, shield: IStageShield) {
    this.model = observable(model);
    this.rotation = new ElementRotation(this);
    this.shield = shield;
    makeObservable(this);
  }

  /**
   * 获取显示角度
   *
   * @returns
   */
  getAngle(): number {
    return this.model.angle;
  }

  /**
   * 将坐标根据描边类型进行转换
   *
   * @param points
   * @param strokeStyle
   * @returns
   */
  convertPointsByStrokeType(points: IPoint[], strokeStyle: StrokeStyle): IPoint[] {
    return CanvasUtils.convertPointsByStrokeType(points, strokeStyle.type, strokeStyle.width, {
      ...this.flip,
      isFold: this.model.isFold,
    });
  }

  /**
   * 计算旋转后的盒模型坐标
   *
   * @returns
   */
  calcRotateBoxCoords(): IPoint[] {
    return this.model.boxCoords.map(coord => MathUtils.rotateWithCenter(coord, this.model.angle, this.centerCoord));
  }

  /**
   * 计算非旋转的最大盒模型
   *
   * @returns
   */
  calcMaxBoxCoords(): IPoint[] {
    return CommonUtils.getBoxPoints(this._rotateCoords);
  }

  /**
   * 计算带边框的最大盒模型
   *
   * @returns
   */
  calcMaxOutlineBoxCoords(): IPoint[] {
    return CommonUtils.getBoxPoints(this._rotateOutlineCoords.flat());
  }

  /**
   * 计算旋转后的坐标
   *
   * @returns
   */
  calcRotateCoords(): IPoint[] {
    return this.model.coords.map(coord => MathUtils.rotateWithCenter(coord, this.model.angle, this.centerCoord));
  }

  /**
   * 计算世界坐标下的旋转边框坐标
   *
   * @returns
   */
  calcRotateOutlineCoords(): IPoint[][] {
    return this.model.styles.strokes.map(stroke => {
      return ElementUtils.calcOutlinePoints(this._rotateCoords, stroke.type, stroke.width, {
        ...this.flip,
        isFold: this.model.isFold,
      });
    });
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
   * 获取控制点的盒模型坐标
   *
   * @param controllerCoord
   * @param size
   * @returns
   */
  getController4BoxCoords(controllerCoord: IPoint, size?: number): IPoint[] {
    size = size || TransformerSize;
    return CommonUtils.get4BoxPoints(
      controllerCoord,
      {
        width: size / this.shield.stageScale,
        height: size / this.shield.stageScale,
      },
      {
        angle: this.model.actualAngle,
        leanYAngle: this.model.leanYAngle,
      },
    );
  }

  /**
   * 根据给定的点坐标生成变换器
   *
   * @param points
   * @returns
   */
  private calcTransformersByCoords(points: IPoint[]): IVerticesTransformer[] {
    return points.map((point, index) => {
      const { x, y } = point;
      const points = this.getController4BoxCoords(point);
      let transformer = this._transformers[index];
      if (transformer) {
        transformer.points = points;
        transformer.x = x;
        transformer.y = y;
      } else {
        transformer = new VerticesTransformer(this, {
          points,
          x,
          y,
        });
      }
      return transformer;
    });
  }

  /**
   * 计算边框变换器坐标
   */
  calcBoxVerticesTransformers(): IVerticesTransformer[] {
    return this.calcTransformersByCoords(this._rotateBoxCoords);
  }

  /**
   * 计算大小变换器坐标
   *
   * @returns
   */
  calcVerticesTransformers(): IVerticesTransformer[] {
    return this.calcTransformersByCoords(this._rotateCoords);
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
   * 计算旋转控制器
   */
  calcRotateControllers(): IPointController[] {
    const centerCoord = this.centerCoord;
    return this._rotateBoxCoords.map((coord, index) => {
      const angle = MathUtils.calcAngle(centerCoord, coord);
      const { x, y } = MathUtils.calcTargetPoint(coord, RotateControllerMargin / this.shield.stageScale, angle);
      const points = this.getController4BoxCoords({ x, y }, RotationSize);
      let controller = this._rotateControllers[index];
      if (controller) {
        controller.points = points;
        controller.x = x;
        controller.y = y;
      } else {
        controller = new RotateController(this, {
          x,
          y,
          points,
        });
      }
      return controller;
    });
  }

  /**
   * 计算边框变换器
   */
  calcBorderTransformers(): IBorderTransformer[] {
    const result = this._rotateBoxCoords.map((coord, index) => {
      const nextCoord = CommonUtils.getNextOfArray(this._rotateBoxCoords, index);
      let borderTransformer = this._borderTransformers[index];
      if (borderTransformer) {
        borderTransformer.start = coord;
        borderTransformer.end = nextCoord;
      } else {
        borderTransformer = new BorderTransformer(this, {
          start: coord,
          end: nextCoord,
          index,
        });
      }
      return borderTransformer;
    });
    return result;
  }

  /**
   * 计算非倾斜盒模型坐标
   *
   * @returns
   */
  calcUnLeanCoords(): IPoint[] {
    return MathUtils.calcUnLeanByPoints(this.model.coords, 0, this.model.leanYAngle);
  }

  /**
   * 计算非倾斜盒模型坐标
   *
   * @returns
   */
  calcUnLeanBoxCoords(): IPoint[] {
    return MathUtils.calcUnLeanByPoints(this.model.boxCoords, 0, this.model.leanYAngle);
  }

  /**
   * 计算边框坐标
   *
   * @returns
   */
  calcStrokeCoords(): IPoint[][] {
    return this.model.styles.strokes.map(stroke => {
      return this.convertPointsByStrokeType(this._rotateCoords, stroke);
    });
  }

  /**
   * 计算内边框线段点索引
   */
  calcInnermostStrokeCoordIndex(): number {
    let result = 0;
    let innerWidth = 0;
    this._strokeCoords.forEach((points, index) => {
      const { width, type } = this.model.styles.strokes[index];
      if (type === StrokeTypes.middle && innerWidth < width / 2) {
        innerWidth = width / 2;
        result = index;
      }
      if (type === StrokeTypes.inside && innerWidth < width) {
        innerWidth = width;
        result = index;
      }
    });
    return result;
  }

  /**
   * 计算非倾斜边框坐标
   *
   * @returns
   */
  calcUnLeanStrokeCoords(): IPoint[][] {
    return this.model.styles.strokes.map(stroke => {
      return this.convertPointsByStrokeType(this._unLeanCoords, stroke);
    });
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
    return MathUtils.calcViewAngleByPoints(this._rotateBoxCoords);
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
   * 计算原始尺寸
   */
  calcPrimitiveSize(): ISize {
    return CommonUtils.calcRectangleSize(MathUtils.batchLeanWithCenter(this.model.boxCoords, -this.model.leanXAngle, -this.model.leanYAngle, this.centerCoord));
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
    if (this.rotationEnable) {
      if (this.shield.configure.rotationIconEnable) {
        this.rotation.refresh();
      }
      this._rotateControllers = this.calcRotateControllers();
    }
  }

  /**
   * 刷新舞台坐标
   */
  refreshPoints() {
    // 计算旋转后的路径坐标
    this._rotateCoords = this.calcRotateCoords();
    // 计算旋转后的盒模型坐标
    this._rotateBoxCoords = this.calcRotateBoxCoords();
    // 计算不倾斜路径坐标
    this._unLeanCoords = this.calcUnLeanCoords();
    // 计算不倾斜盒模型坐标
    this._unLeanBoxCoords = this.calcUnLeanBoxCoords();
    // 计算最大盒模型点
    this._maxBoxCoords = this.calcMaxBoxCoords();
    this.refreshTransformers();
  }

  /**
   * 判断是否包含点
   *
   * @param point
   */
  isContainsCoord(coord: IPoint): boolean {
    return some(this._rotateOutlineCoords, paths => {
      return MathUtils.isPointInPolygonByRayCasting(coord, paths);
    });
  }

  /**
   * 判断是否于多边形相交
   *
   * @param points
   * @returns
   */
  isPolygonOverlap(coords: IPoint[]): boolean {
    return some(this._rotateOutlineCoords, paths => {
      return MathUtils.isPolygonsOverlap(paths, coords);
    });
  }
  /**
   * 判断世界模型是否与多边形相交、
   *
   * @param coords
   * @returns
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return some(this._rotateOutlineCoords, paths => {
      return MathUtils.isPolygonsOverlap(paths, coords);
    });
  }

  /**
   * 重新维护原始变形器坐标
   */
  refreshOriginalElementProps() {
    this.refreshOriginalCoords();
    this.refreshOriginalStrokes();
    // 维护原始矩形
    this._originalSize = { width: this.model.width, height: this.model.height };
    // 维护原始变换矩阵
    this._originalTransformMatrix = [];
  }

  /**
   * 重新维护原始坐标
   */
  refreshOriginalCoords(): void {
    // 维护原始模型坐标
    this._originalCoords = cloneDeep(this.model.coords);
    // 维护原始模型盒模型坐标
    this._originalBoxCoords = cloneDeep(this.model.boxCoords);
    // 维护原始旋转坐标
    this._originalRotateCoords = cloneDeep(this._rotateCoords);
    // 维护原始旋转盒模型坐标
    this._originalRotateBoxCoords = cloneDeep(this._rotateBoxCoords);
    // 维护原始中心点坐标
    this._originalCenterCoord = cloneDeep(this.centerCoord);
    // 维护原始路径坐标
    this._originalRotateOutlineCoords = cloneDeep(this._rotateOutlineCoords);
    // 维护原始最大外轮廓坐标
    this._originalMaxOutlineBoxCoords = cloneDeep(this._maxOutlineBoxCoords);
    // 维护原始最大轮廓盒模型坐标
    this._originalMaxBoxCoords = cloneDeep(this._maxBoxCoords);
  }

  /**
   * 重新维护原始描边
   */
  refreshOriginalStrokes(): void {
    // 维护原始描边坐标
    this._originalStrokeCoords = cloneDeep(this._strokeCoords);
    // 维护原始不倾斜描边坐标
    this._originalUnLeanStrokeCoords = cloneDeep(this._unLeanStrokeCoords);
  }

  /**
   * 刷新原始顶点坐标
   */
  refreshOriginalTransformerCoords(): void {
    this._originalTransformerCoords = this.transformers.map(transformer => {
      const { x, y } = transformer;
      return {
        x,
        y,
      };
    });
  }

  /**
   * 重新维护原始属性，用于组件的移动、旋转、大小变换
   */
  refreshOriginalProps(): void {
    // 维护原始变换器坐标
    this.refreshOriginalTransformerCoords();
    // 维护原始组件属性
    this.refreshOriginalElementProps();
  }

  /**
   * 更新尺寸
   */
  refreshSize(): void {
    const { width, height } = ElementUtils.calcSize(this.model);
    this.model.width = MathUtils.precise(width, 1);
    this.model.height = MathUtils.precise(height, 1);
    if (this._rotateBoxCoords && this._rotateBoxCoords.length) {
      const { width: verticalSize, height: horizontalSize } = MathUtils.calcParallelogramVerticalSize(this._rotateBoxCoords);
      this._minParallelogramVerticalSize = Math.min(verticalSize, horizontalSize);
    }
  }

  /**
   * 更新坐标
   */
  refreshPosition(): void {
    Object.assign(this.model, this.calcCenterCoord());
  }

  /**
   * 刷新变换控制器
   */
  refreshTransformers(): void {
    this._transformers = this.calcTransformers();
    if (this.borderTransformEnable) {
      this._borderTransformers = this.calcBorderTransformers();
    }
  }

  /**
   * 角度修正
   */
  flipAngle(): void {
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
   * @param lockCoord
   * @param centroid
   * @returns
   */
  batchCalcTransformPointsByCenter(coords: IPoint[], matrix: number[][], lockCoord: IPoint, centroid: IPoint): IPoint[] {
    return this.calcTransformPointsByCenter(coords, matrix, lockCoord, centroid, this.angles);
  }

  /**
   * 计算变换后的点
   *
   * @param points
   * @param matrix
   * @param lockCoord
   * @param centroid
   * @param angles
   * @returns
   */
  calcTransformPointsByCenter(coords: IPoint[], matrix: number[][], lockCoord: IPoint, centroid: IPoint, angles: Partial<AngleModel>): IPoint[] {
    const center = ElementUtils.calcMatrixPoint(centroid, matrix, lockCoord, angles);
    return coords.map(coord => {
      coord = ElementUtils.calcMatrixPoint(coord, matrix, lockCoord, angles);
      // 坐标重新按照角度偏转
      return MathUtils.rotateWithCenter(coord, -angles.angle, center);
    });
  }

  /**
   * 形变
   *
   * @param offset
   */
  transform(offset: IPoint): void {
    // 如果有顶点变形器激活，则进行顶点变形
    if (this.getActiveController() instanceof VerticesTransformer) {
      this.transformByVertices(offset);
      this._transformType = TransformTypes.vertices;
    } else if (this.getActiveController() instanceof BorderTransformer) {
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
        outline: true,
        strokes: true,
        corners: true,
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
    const { lockCoord, lockIndex, transformType, originalMovingCoord, offset, groupAngle, groupLeanYAngle } = options;
    // 还原坐标需要用到的角度
    const groupAngles = { angle: groupAngle, leanYAngle: groupLeanYAngle };
    // 获取变换矩阵
    const matrix = this.getTransformMatrix(lockCoord, originalMovingCoord, offset, groupAngles, false);
    // 如果变换类型为边框，则调整矩阵
    if (transformType === TransformTypes.border) {
      // 调整矩阵
      this._transBorderMatrix(matrix, lockIndex, false);
    }
    // 执行矩阵变换
    this._doTransformBy(matrix, lockCoord, groupAngles, originalMovingCoord);
  }

  /**
   * 执行矩阵变换
   *
   * @param matrix
   * @param lockCoord
   * @param groupAngles
   * @param originalMovingCoord
   */
  private _doTransformBy(matrix: number[][], lockCoord: IPoint, groupAngles: AngleModel, originalMovingCoord?: IPoint): void {
    // 计算变换后的点
    const points = ElementUtils.calcMatrixPoints(this._originalRotateCoords, matrix, lockCoord, groupAngles);
    // 计算变换后的盒模型坐标
    const boxPoints = ElementUtils.calcMatrixPoints(this._originalRotateBoxCoords, matrix, lockCoord, groupAngles);
    // 执行矩阵变换
    this._doTransformByPoints(points, boxPoints, lockCoord, matrix, originalMovingCoord);
  }

  /**
   * 执行矩阵变换
   *
   * @param coords
   * @param boxCoords
   * @param lockCoord
   * @param matrix
   * @param originalMovingCoord
   */
  private _doTransformByPoints(coords: IPoint[], boxCoords: IPoint[], lockCoord: IPoint, matrix?: number[][], originalMovingCoord?: IPoint): void {
    // 计算内角
    this.model.internalAngle = MathUtils.calcInternalAngle(boxCoords);
    // 计算y倾斜角度
    this.model.leanYAngle = MathUtils.calcLeanYAngle(this.model.internalAngle, MathUtils.calcFlipXByPoints(boxCoords));
    // 计算变换后的角度
    this.model.angle = MathUtils.mirrorAngle(MathUtils.calcActualAngleByPoints(boxCoords));
    // 设置变换后的坐标
    this.model.coords = MathUtils.batchPrecisePoint(ElementUtils.calcCoordsByTransPoints(coords, this.angles, lockCoord), 1);
    // 设置变换后的盒模型坐标
    this.model.boxCoords = MathUtils.batchPrecisePoint(ElementUtils.calcCoordsByTransPoints(boxCoords, this.angles, lockCoord), 1);
    // 判断是否需要翻转角度
    if (originalMovingCoord && matrix) {
      this._tryFlipAngle(lockCoord, originalMovingCoord, matrix);
    }
    this.refresh(
      {
        points: true,
        rotation: true,
        size: true,
        position: true,
        angles: true,
        outline: true,
        strokes: true,
        corners: true,
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
    if (!this.verticesTransformEnable && !this.boxVerticesTransformEnable) return;
    this.doVerticesTransform(offset);
  }

  /**
   * 按顶点变换
   *
   * @param offset
   * @returns
   */
  doVerticesTransform(offset: IPoint): void {
    const index = this._transformers.findIndex(item => item.isActive);
    if (index !== -1) {
      // 不动点坐标索引
      const lockIndex = CommonUtils.getPrevIndexOfArray(this._transformers.length, index, 2);
      // 不动点
      const lockCoord = this._originalTransformerCoords[lockIndex];
      // 当前拖动的点的原始位置
      const currentCoordOriginal = this._originalTransformerCoords[index];
      // 当前拖动的点的原始位置
      this._originalTransformMoveCoord = currentCoordOriginal;
      // 根据不动点进行形变
      this.transformByLockPoint(lockCoord, currentCoordOriginal, offset, index);
    }
  }

  /**
   * 根据不动点进行顶点变换
   *
   * @param lockCoord
   * @param currentCoordOriginal
   * @param offset
   * @param index
   */
  transformByLockPoint(lockCoord: IPoint, currentCoordOriginal: IPoint, offset: IPoint, lockIndex: number): void {
    // 获取变换矩阵
    const matrix = this.getTransformMatrix(lockCoord, currentCoordOriginal, offset, this.angles);
    // 设置变换矩阵
    this._transformMatrix = matrix;
    // 设置变换不动点
    this._transformLockCoord = lockCoord;
    // 设置变换不动点索引
    this._transformLockIndex = lockIndex;
    // 设置变换坐标
    this.model.coords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateCoords, matrix, lockCoord, this._originalCenterCoord), 1);
    // 设置变换盒模型坐标
    this.model.boxCoords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateBoxCoords, matrix, lockCoord, this._originalCenterCoord), 1);
    // 判断是否需要翻转角度
    this._tryFlipAngle(lockCoord, currentCoordOriginal, matrix);
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
  getTransformMatrix(lockCoord: IPoint, currentCoordOriginal: IPoint, offset: IPoint, angles: Partial<AngleModel>, wouldBeRatioLock?: boolean): number[][] {
    if (typeof wouldBeRatioLock === "undefined") {
      wouldBeRatioLock = true;
    }
    // 当前拖动的点当前的位置
    const currentCoord = {
      x: currentCoordOriginal.x + offset.x,
      y: currentCoordOriginal.y + offset.y,
    };
    // 判断当前拖动点，在坐标系垂直轴的左边还是右边
    const matrix = MathUtils.calcTransformMatrix(lockCoord, currentCoord, currentCoordOriginal, angles);
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
   * @param lockCoord
   * @param currentCoordOriginal
   * @param matrix
   */
  _tryFlipAngle(lockCoord: IPoint, currentCoordOriginal: IPoint, matrix: number[][]): boolean {
    // 判断是否已经计算过原始矩阵
    if (!this._originalTransformMatrix.length) {
      // 计算原始矩阵
      this._originalTransformMatrix = MathUtils.calcTransformMatrix(lockCoord, currentCoordOriginal, currentCoordOriginal, this.angles);
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
  _doFlipAngle(matrix: number[][], originalMatrix: number[][]): boolean {
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
  getBorderTransformLockCoord(index: number): IPoint {
    // 不动边的点1索引
    const lockIndex = CommonUtils.getPrevIndexOfArray(this._borderTransformers.length, index, 2);
    // 不动边的点2索引
    const lockNextIndex = CommonUtils.getNextIndexOfArray(this._borderTransformers.length, index, 3);
    // 不动点
    return MathUtils.calcCenter([this._originalTransformerCoords[lockIndex], this._originalTransformerCoords[lockNextIndex]]);
  }

  /**
   * 调整边框矩阵
   *
   * @param matrix
   * @param index
   * @param wouldBeRatioLock
   * @returns
   */
  private _transBorderMatrix(matrix: number[][], index: number, wouldBeRatioLock?: boolean): number[][] {
    if (typeof wouldBeRatioLock === "undefined") {
      wouldBeRatioLock = true;
    }
    const rationLock = wouldBeRatioLock && this.shouldRatioLockResize;
    if (index === 0 || index === 2) {
      // 调整高度，0上边/2下边
      matrix[0][0] = rationLock ? MathUtils.resignValue(matrix[0][0], matrix[1][1]) : 1;
    } else if (index === 1 || index === 3) {
      // 调整宽度，1左边/3右边
      matrix[1][1] = rationLock ? MathUtils.resignValue(matrix[1][1], matrix[0][0]) : 1;
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
  doBorderTransform(offset: IPoint): void {
    const index = this._borderTransformers.findIndex(item => item.isActive);
    if (index !== -1) {
      // 不动点
      const lockCoord = this.getBorderTransformLockCoord(index);
      // 当前拖动的点的原始位置
      const currentCoordOriginal = this._originalTransformerCoords[index];
      // 当前拖动的点的原始位置
      this._originalTransformMoveCoord = currentCoordOriginal;
      // 当前拖动的点当前的位置
      const currentCoord = {
        x: currentCoordOriginal.x + offset.x,
        y: currentCoordOriginal.y + offset.y,
      };
      // 判断当前拖动点，在坐标系垂直轴的左边还是右边
      const matrix = MathUtils.calcTransformMatrix(lockCoord, currentCoord, currentCoordOriginal, this.angles);
      // 调整矩阵
      this._transBorderMatrix(matrix, index);
      // 设置变换矩阵
      this._transformMatrix = matrix;
      // 设置变换不动点
      this._transformLockCoord = lockCoord;
      // 设置变换不动点索引
      this._transformLockIndex = index;
      // 设置变换坐标
      this.model.coords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateCoords, matrix, lockCoord, this._originalCenterCoord), 1);
      // 设置变换盒模型坐标
      this.model.boxCoords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateBoxCoords, matrix, lockCoord, this._originalCenterCoord), 1);
      // 尝试翻转角度
      this._tryFlipAngle(lockCoord, currentCoordOriginal, matrix);
    }
  }

  /**
   * 获取设置尺寸变换的变换点（设置宽度的时候使用）
   *
   * @returns
   */
  getTransformPointForSizeChange(): IPoint {
    return this._originalTransformerCoords[2];
  }

  /**
   * 位移
   *
   * @param offset
   */
  translateBy(offset: IPoint): void {
    this.model.x += offset.x;
    this.model.y += offset.y;
    this.model.coords = MathUtils.batchTranslate(this._originalCoords, offset);
    this.model.boxCoords = MathUtils.batchTranslate(this._originalBoxCoords, offset);
    this._rotateCoords = MathUtils.batchTranslate(this._originalRotateCoords, offset);
    this._rotateBoxCoords = MathUtils.batchTranslate(this._originalRotateBoxCoords, offset);
    this._unLeanCoords = MathUtils.batchTranslate(this._originalUnLeanCoords, offset);
    this._unLeanBoxCoords = MathUtils.batchTranslate(this._originalUnLeanBoxCoords, offset);
    this._unLeanStrokeCoords = this._originalUnLeanStrokeCoords.map(coords => MathUtils.batchTranslate(coords, offset));
    this._strokeCoords = this._originalStrokeCoords.map(coords => MathUtils.batchTranslate(coords, offset));
    this._maxBoxCoords = MathUtils.batchTranslate(this._originalMaxBoxCoords, offset);
    this._maxOutlineBoxCoords = MathUtils.batchTranslate(this._originalMaxOutlineBoxCoords, offset);
    this._rotateOutlineCoords = this._originalRotateOutlineCoords.map(coords => MathUtils.batchTranslate(coords, offset));
    this.refreshCorners();
    this.refreshRotation();
    this.refreshTransformers();
  }

  /**
   * 刷新组件必要数据
   *
   * 注意：
   * 1. 不要调整刷新顺序
   * @param options
   * @param subOptions
   */
  refresh(options?: RefreshOptions, subOptions?: { angles?: RefreshAnglesOptions }): void {
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
    // 刷新圆角
    if (options?.corners) this.refreshCorners();
    // 刷新边框
    if (options?.strokes) this.refreshStrokePoints();
    // 刷新外轮廓
    if (options?.outline) this.refreshOutlinePoints();
    // 刷新原始属性
    if (options?.originals) this.refreshOriginalProps();
  }

  /**
   * 刷新与边框设置相关的坐标
   */
  refreshOutlinePoints(): void {
    // 计算旋转后的边框路径坐标
    this._rotateOutlineCoords = this.calcRotateOutlineCoords();
    // 计算最大边框盒模型点
    this._maxOutlineBoxCoords = this.calcMaxOutlineBoxCoords();
  }

  /**
   * 设置组件宽度
   *
   * @param value
   */
  setWidth(value: number): number[][] {
    const matrix = MathUtils.calcScaleMatrix(value / this._originalSize.width, 1);
    // 调整矩阵
    matrix[1][1] = this.shouldRatioLockResize ? MathUtils.resignValue(matrix[1][1], matrix[0][0]) : 1;
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
    const matrix = MathUtils.calcScaleMatrix(1, value / this._originalSize.height);
    // 调整矩阵
    matrix[0][0] = this.shouldRatioLockResize ? MathUtils.resignValue(matrix[0][0], matrix[1][1]) : 1;
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
  scaleBy(center: IPoint, scaleX: number, scaleY: number, group?: Partial<AngleModel>): void {
    const matrix = MathUtils.calcScaleMatrix(scaleX, scaleY);
    if (group) {
      this._doTransformBy(matrix, center, group);
    } else {
      this.model.coords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateCoords, matrix, center, this._originalCenterCoord), 1);
      this.model.boxCoords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateBoxCoords, matrix, center, this._originalCenterCoord), 1);
    }
    this.refresh({
      points: true,
      size: true,
      position: true,
      rotation: true,
      originals: true,
      outline: true,
      strokes: true,
      corners: true,
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
    this._transformLockCoord = this._originalCenterCoord;
    // 设置变换坐标
    this.model.coords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateCoords, matrix, this._originalCenterCoord, this._originalCenterCoord), 1);
    // 设置变换盒模型坐标
    this.model.boxCoords = MathUtils.batchPrecisePoint(this.batchCalcTransformPointsByCenter(this._originalRotateBoxCoords, matrix, this._originalCenterCoord, this._originalCenterCoord), 1);
    // 刷新组件
    this.refresh({
      points: true,
      size: true,
      position: true,
      rotation: true,
      originals: true,
      outline: true,
      strokes: true,
      corners: true,
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
    this.model.coords = MathUtils.batchPrecisePoint(MathUtils.batchTranslate(this.model.coords, offset), 1);
    // 设置变换盒模型坐标
    this.model.boxCoords = MathUtils.batchPrecisePoint(MathUtils.batchTranslate(this.model.boxCoords, offset), 1);
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
    const centerCoord = this.centerCoord;
    // 重新计算倾斜坐标
    this.model.coords = MathUtils.batchPrecisePoint(MathUtils.batchLeanYWithCenter(coords, value, centerCoord), 1);
    // 计算非倾斜盒模型坐标
    const boxCoords = this.calcUnLeanBoxCoords();
    // 重新计算倾斜盒模型坐标
    this.model.boxCoords = MathUtils.batchPrecisePoint(MathUtils.batchLeanYWithCenter(boxCoords, value, centerCoord), 1);
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
  leanYBy(value: number, prevValue: number, groupAngle: number, center: IPoint): void {
    // 计算旋转偏移前的坐标
    let points = MathUtils.batchTransWithCenter(this._rotateCoords, { angle: groupAngle, leanYAngle: prevValue }, center, true);
    // 计算旋转偏移前的盒模型坐标
    let boxPoints = MathUtils.batchTransWithCenter(this._rotateBoxCoords, { angle: groupAngle, leanYAngle: prevValue }, center, true);
    // 计算偏移后的坐标
    points = MathUtils.batchTransWithCenter(points, { angle: groupAngle, leanYAngle: value }, center);
    // 计算偏移后的盒模型坐标
    boxPoints = MathUtils.batchTransWithCenter(boxPoints, { angle: groupAngle, leanYAngle: value }, center);
    this._doTransformByPoints(points, boxPoints, center);
  }

  /**
   * 刷新圆角
   */
  refreshCorners(): void {}

  /**
   * 刷新边框
   */
  refreshStrokePoints(): void {
    // 计算边框坐标
    this._strokeCoords = this.calcStrokeCoords();
    // 计算非倾斜边框坐标
    this._unLeanStrokeCoords = this.calcUnLeanStrokeCoords();
    // 计算内边框线段点索引
    this._innermostStrokeCoordIndex = this.calcInnermostStrokeCoordIndex();
  }

  /**
   * 设置圆角
   *
   * @param value
   * @param index
   */
  setCorners(value: number, index?: number): void {
    let values = cloneDeep(this.model.corners);
    if (isNumber(index)) values[index] = value;
    else values.fill(value);
    values = ElementUtils.fixCornersBasedOnMinSize(values, this._minParallelogramVerticalSize);
    this.model.corners = values;
    this.refresh({ corners: true, strokes: true });
  }

  /**
   * 设置边框样式
   *
   * @param value
   * @param index
   */
  setStrokeType(value: StrokeTypes, index: number): void {
    this.model.styles.strokes[index].type = value;
    this.refresh({ outline: true, strokes: true });
    this.refreshOriginalStrokes();
  }

  /**
   * 设置边框颜色
   *
   * @param value
   * @param index
   */
  setStrokeColor(value: string, index: number): void {
    this.model.styles.strokes[index].color = value;
  }

  /**
   * 设置边框透明度
   *
   * @param value
   * @param index
   */
  setStrokeColorOpacity(value: number, index: number): void {
    this.model.styles.strokes[index].colorOpacity = value;
  }

  /**
   * 设置边框宽度
   *
   * @param value
   * @param index
   */
  setStrokeWidth(value: number, index: number): void {
    this.model.styles.strokes[index].width = value;
    this.refresh({ outline: true, strokes: true });
    this.refreshOriginalStrokes();
  }

  /**
   * 添加边框
   *
   * @param prevIndex
   */
  addStroke(prevIndex: number): void {
    const strokes = cloneDeep(this.model.styles.strokes);
    strokes.splice(prevIndex + 1, 0, { ...DefaultStrokeStyle });
    this.model.styles.strokes = strokes;
    this.refresh({ outline: true, strokes: true });
    this.refreshOriginalStrokes();
  }

  /**
   * 删除边框
   *
   * @param index
   */
  removeStroke(index: number): void {
    const strokes = cloneDeep(this.model.styles.strokes);
    strokes.splice(index, 1);
    this.model.styles.strokes = strokes;
    this.refresh({ outline: true, strokes: true });
    this.refreshOriginalStrokes();
  }

  /**
   * 设置填充颜色
   * @param value
   * @param index
   */
  setFillColor(value: string, index: number): void {
    this.model.styles.fills[index].color = value;
  }

  /**
   * 设置填充颜色透明度
   * @param value
   * @param index
   */
  setFillColorOpacity(value: number, index: number): void {
    this.model.styles.fills[index].colorOpacity = value;
  }

  /**
   * 添加填充
   *
   * @param prevIndex
   */
  addFill(prevIndex: number): void {
    const fills = cloneDeep(this.model.styles.fills);
    fills.splice(prevIndex + 1, 0, { ...DefaultFillStyle });
    this.model.styles.fills = fills;
  }

  /**
   * 删除填充
   *
   * @param index
   */
  removeFill(index: number): void {
    const fills = cloneDeep(this.model.styles.fills);
    fills.splice(index, 1);
    this.model.styles.fills = fills;
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
    const newCenterCoord = MathUtils.rotateWithCenter(this._originalCenterCoord, deltaAngle, lockCenterCoord);
    // 计算偏移量
    const offset = {
      x: newCenterCoord.x - this._originalCenterCoord.x,
      y: newCenterCoord.y - this._originalCenterCoord.y,
    };
    // 计算变换后的坐标
    const coords = this._originalCoords.map(coord => MathUtils.translate(coord, offset));
    // 计算变换后的盒模型坐标
    const boxCoords = this._originalBoxCoords.map(coord => MathUtils.translate(coord, offset));
    // 设置变换坐标
    this.model.coords = MathUtils.batchPrecisePoint(coords, 1);
    // 设置变换盒模型坐标
    this.model.boxCoords = MathUtils.batchPrecisePoint(boxCoords, 1);
    // 设置变换角度
    this.model.angle = MathUtils.mirrorAngle(MathUtils.normalizeAngle(this._originalAngle) + (MathUtils.normalizeAngle(deltaAngle) % 360));
    // 刷新
    this.refresh({
      points: true,
      rotation: true,
      position: true,
      angles: true,
      outline: true,
      strokes: true,
      corners: true,
    });
  }

  /**
   * 获取激活的控制器
   */
  getActiveController(): IController {
    return this.controllers.find(c => c.isActive);
  }

  /**
   * 切换控制器激活状态
   *
   * @param controllers 控制器
   * @param isActive 激活状态
   */
  setControllersActive(controllers: IController[], isActive: boolean): void {
    controllers.forEach(c => (c.isActive = isActive));
  }

  /**
   * 根据点获取控制器
   *
   * @param coord 点
   * @returns 控制器
   */
  getControllerByCoord(coord: IPoint): IController {
    return this.controllers.find(c => c.isCoordHitting(coord));
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
  async toJson(): Promise<ElementObject> {
    return JSON.parse(JSON.stringify({ ...this.model, ...this.flip })) as ElementObject;
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
