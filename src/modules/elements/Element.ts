import {
  ElementStatus,
  IPoint,
  DrawerMaskModelTypes,
  BoxDirections
} from "@/types";
import { ILinkedNodeValue } from '@/modules/struct/LinkedNode';
import ElementUtils from "@/modules/elements/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { cloneDeep, every } from "lodash";
import { action, makeObservable, observable, computed } from "mobx";
import ElementTransformer from "@/modules/elements/transformer/ElementTransformer";
import { multiply } from 'mathjs';
import IElement, { ElementObject } from "@/types/IElement";
import { IRotationModel } from "@/types/IModel";
import IElementTransformer from "@/types/IElementTransformer";
import { StrokeTypes } from "@/types/ElementStyles";
import { DefaultSelectionRotateSize, DefaultSizeTransformerValue } from "@/types/MaskStyles";

export default class Element implements IElement, ILinkedNodeValue {
  id: string;
  model: ElementObject;
  _originalTransformerPoints: IPoint[];
  _originalModelCoords: IPoint[];
  _originalMatrix: number[][] = [];

  rotationModel: IRotationModel = {
    point: null,
    type: DrawerMaskModelTypes.rotate,
    width: DefaultSelectionRotateSize,
    height: DefaultSelectionRotateSize,
    angle: -90,
    vertices: []
  };

  @observable _status: ElementStatus = ElementStatus.initialed;
  @observable _isSelected: boolean = false;
  @observable _isVisible: boolean = true;
  @observable _isEditing: boolean = false;
  @observable _isLocked: boolean = false;
  @observable _isMoving: boolean = false;
  @observable _isTransforming: boolean = false;
  @observable _isRotating: boolean = false;
  @observable _isRotatingTarget: boolean = false;
  @observable _isDragging: boolean = false;
  @observable _isProvisional: boolean = false;
  @observable _isTarget: boolean = false;
  @observable _isInRange: boolean = false;
  @observable _isOnStage: boolean = false;

  get originalModelCoords() {
    return this._originalModelCoords;
  }

  @computed
  get width(): number {
    return this.model.width;
  }

  @computed
  get height(): number {
    return this.model.height;
  }

  @computed
  get angle(): number {
    return this.model.angle;
  }

  get centroid(): IPoint {
    return this.calcCentroid();
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

  @action
  private _setStatus(status: ElementStatus): void {
    this._status = status;
  }

  @action
  private _setIsSelected(value: boolean): void {
    this._isSelected = value;
  }

  @action
  private _setIsVisible(value: boolean): void {
    this._isVisible = value;
  }

  @action
  private _setIsEditing(value: boolean): void {
    this._isEditing = value;
  }

  @action
  private _setIsLocked(value: boolean): void {
    this._isLocked = value;
  }

  @action
  private _setIsMoving(value: boolean): void {
    this._isMoving = value;
  }

  @action
  private _setIsTransforming(value: boolean): void {
    this._isTransforming = value;
  }

  @action
  private _setIsRotating(value: boolean): void {
    this._isRotating = value;
  }

  @action
  private _setIsRotatingTarget(value: boolean): void {
    this._isRotatingTarget = value;
  }

  @action
  private _setIsDragging(value: boolean): void {
    this._isDragging = value;
  }

  @action
  private _setIsRendered(value: boolean): void {
    this._isProvisional = value;
  }

  @action
  private _setIsTarget(value: boolean): void {
    this._isTarget = value;
  }

  @action
  private _setIsOnStage(value: boolean): void {
    this._isOnStage = value;
  }

  @action
  private _setIsInRange(value: boolean): void {
    this._isInRange = value;
  }

  protected _points: IPoint[] = [];
  protected _pathPoints: IPoint[] = [];
  protected _maxBoxPoints: IPoint[] = [];
  protected _rotatePoints: IPoint[] = [];
  protected _rotatePathPoints: IPoint[] = [];
  protected _transformers: IElementTransformer[] = [];
  protected _stageRect: DOMRect;
  protected _stageWorldCoord: IPoint;
  protected _originalCentroidCoord: IPoint;
  protected _originalRotatePoints: IPoint[] = [];
  protected _originalAngle: number = 0;

  get points(): IPoint[] {
    return this._points;
  }

  get pathPoints(): IPoint[] {
    return this._pathPoints;
  }

  get maxBoxPoints(): IPoint[] {
    return this._maxBoxPoints;
  }

  get rotatePoints(): IPoint[] {
    return this._rotatePoints;
  }

  get rotatePathPoints(): IPoint[] {
    return this._rotatePathPoints;
  }

  get transformers(): IElementTransformer[] {
    return this._transformers;
  }

  constructor(model: ElementObject) {
    this.model = observable(model);
    this.id = CommonUtils.getRandomDateId();
    this.calcOriginalProps();
    makeObservable(this);
  }

  /**
   * 计算舞台坐标
   * 
   * @param stageRect 
   * @param stageWorldCoord 
   * @returns 
   */
  calcPoints(stageRect: DOMRect, stageWorldCoord: IPoint): IPoint[] {
    return ElementUtils.calcStageRelativePoints(this.model.coords, stageRect, stageWorldCoord);
  }

  /**
   * 计算路径坐标
   * 
   * @returns 
   */
  calcPathPoints(): IPoint[] {
    return cloneDeep(this._points)
  }

  /**
   * 计算旋转坐标
   * 
   * @returns 
   */
  calcRotatePoints(): IPoint[] {
    return this._points.map(point => MathUtils.rotateRelativeCentroid(point, this.model.angle, MathUtils.calcPolygonCentroid(this._points)))
  }

  /**
   * 计算旋转路径坐标
   * 
   * @returns 
   */
  calcRotatePathPoints(): IPoint[] {
    return this._pathPoints.map(point => MathUtils.rotateRelativeCentroid(point, this.model.angle, this.centroid));
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
   * 计算中心点
   * 
   * @returns 
   */
  calcCentroid(): IPoint {
    return MathUtils.calcPolygonCentroid(this.pathPoints);
  }

  /**
   * 计算大小变换器坐标
   * 
   * @returns 
   */
  calcTransformers(): IElementTransformer[] {
    const result = this._rotatePathPoints.map((point, index) => {
      const { x, y } = point;
      const points = CommonUtils.get4BoxPoints(point, {
        width: DefaultSizeTransformerValue,
        height: DefaultSizeTransformerValue
      }, {
        angle: this.model.angle
      });
      let transformer = this._transformers[index];
      if (transformer) {
        transformer.points = points;
        transformer.x = x;
        transformer.y = y;
      } else {
        transformer = new ElementTransformer(x, y, points, BoxDirections[index]);
      }
      return transformer;
    })
    return result;
  }

  /**
   * 刷新坐标
   */
  refreshStagePoints(stageRect: DOMRect, stageWorldCoord: IPoint): void {
    this._stageRect = stageRect;
    this._stageWorldCoord = stageWorldCoord;
    this.refreshElementPoints(stageRect, stageWorldCoord);
    this.refreshRotationModelPoints();
  }

  /**
   * 刷新舞台坐标
   * 
   * @param stageRect 
   * @param stageWorldCoord 
   */
  refreshElementPoints(stageRect: DOMRect, stageWorldCoord: IPoint) {
    this._points = this.calcPoints(stageRect, stageWorldCoord);
    this._pathPoints = this.calcPathPoints();
    this._rotatePoints = this.calcRotatePoints();
    this._rotatePathPoints = this.calcRotatePathPoints();
    this._transformers = this.calcTransformers();
    this._maxBoxPoints = this.calcMaxBoxPoints();
  }

  /**
   * 刷新旋转句柄在舞台的坐标
   */
  refreshRotationModelPoints() {
    this.rotationModel.angle = this.model.angle - 90;
    this.rotationModel.point = ElementUtils.calcElementRotatePoint(this);
    this.rotationModel.vertices = CommonUtils.getBoxVertices(this.rotationModel.point, {
      width: this.rotationModel.width,
      height: this.rotationModel.height
    }).map(point => MathUtils.rotateRelativeCentroid(point, this.model.angle, this.rotationModel.point))
  }

  /**
   * 判断是否在矩形内
   * 
   * @param rect 
   */
  isInPolygon(points: IPoint[]): boolean {
    return every(this.rotatePathPoints.map(point => MathUtils.isPointInPolygonByRayCasting(point, points)))
  }

  /**
   * 判断是否包含点
   * 
   * @param point 
   */
  isContainsPoint(point: IPoint): boolean {
    return MathUtils.isPointInPolygonByRayCasting(point, this.rotatePathPoints);
  }

  /**
   * 旋转区域是否包含点
   * 
   * @param point 
   * @returns 
   */
  isRotationContainsPoint(point: IPoint): boolean {
    const { rotationModel: { vertices } } = this;
    return MathUtils.isPointInPolygonByRayCasting(point, vertices);
  }

  /**
   * 判断是否于多边形相交
   * 
   * @param points 
   * @returns 
   */
  isPolygonOverlap(points: IPoint[]): boolean {
    return MathUtils.polygonsOverlap(this.rotatePathPoints, points);
  }
  /**
   * 判断世界模型是否与多边形相交、
   * 
   * @param points 
   * @returns 
   */
  isModelPolygonOverlap(points: IPoint[]): boolean {
    const modelRotatePathPoints = this.model.coords.map(point => MathUtils.rotate(point, this.model.angle))
    return MathUtils.polygonsOverlap(modelRotatePathPoints, points);
  }

  /**
   * 
   * @param point 
   * @returns 
   */
  getTransformerByPoint(point: IPoint): IElementTransformer {
    return this.transformers.find(item => item.isContainsPoint(point));
  }

  /**
   * 重新维护原始变形器坐标
   */
  calcOriginalElementProps() {
    this._originalTransformerPoints = this.transformers.map(transformer => {
      const { x, y } = transformer;
      return {
        x,
        y
      }
    })
    this._originalRotatePoints = cloneDeep(this._rotatePoints);
    this._originalAngle = this.angle;
  }

  /**
   * 重新维护原始坐标
   */
  calcOriginalModelCoords() {
    this._originalModelCoords = this.model.coords.map(point => {
      const { x, y } = point;
      return {
        x,
        y
      }
    })
    this._originalCentroidCoord = MathUtils.calcPolygonCentroid(this._originalModelCoords);
  }

  /**
   * 重新维护原始属性，用于组件的移动、旋转、大小变换
   */
  calcOriginalProps(): void {
    this.calcOriginalModelCoords();
    this.calcOriginalElementProps();
  }

  /**
   * 激活变形器
   * 
   * @param transformer 
   */
  activeTransformer(transformer: ElementTransformer): void {
    this._transformers.forEach(item => {
      item.isActive = item.direction === transformer.direction;
    });
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
   * 角度修正
   */
  private _fixAngle(): void {
    if (this.model.angle > 0) {
      this.model.angle = this.model.angle - 180;
    } else {
      this.model.angle = this.model.angle + 180;
    }
  }

  /**
   * 形变
   * 
   * @param offset 
   */
  transform(offset: IPoint): void {
    const index = this._transformers.findIndex(item => item.isActive);
    if (index !== -1) {
      // 不动点坐标索引
      const lockIndex = CommonUtils.getPrevIndexOfArray(this._transformers.length, index, 2);
      // 不动点
      const lockPoint = this._originalTransformerPoints[lockIndex];
      // 当前拖动的点的原始位置
      const currentPointOriginal = this._originalTransformerPoints[index];
      // 当前拖动的点当前的位置
      const currentPoint = { x: currentPointOriginal.x + offset.x, y: currentPointOriginal.y + offset.y };
      // 判断是否已经计算过原始矩阵
      if (!this._originalMatrix.length) {
        // 计算原始矩阵
        this._originalMatrix = MathUtils.calcTransformMatrixOfCentroid(lockPoint, currentPointOriginal, currentPointOriginal, this.model.angle);
      }
      // 原始的纵轴缩放系数
      const yScaleOriginal = this._originalMatrix[1][1];
      // 判断当前拖动点，在坐标系垂直轴的左边还是右边
      const matrix = MathUtils.calcTransformMatrixOfCentroid(lockPoint, currentPoint, currentPointOriginal, this.model.angle);
      // 纵轴缩放系数
      const yScale = matrix[1][1];
      const newPoints = this._originalRotatePoints.map(point => {
        // 先旋转回角度0
        point = MathUtils.rotateRelativeCentroid(point, -this.model.angle, lockPoint)
        // 以不动点为圆心，计算形变
        const [x, y] = multiply(matrix, [point.x - lockPoint.x, point.y - lockPoint.y, 1])
        // 重新计算坐标
        point = { x: x + lockPoint.x, y: y + lockPoint.y }
        // 坐标重新按照角度偏转
        point = MathUtils.rotateRelativeCentroid(point, this.model.angle, lockPoint)
        return point;
      });
      const newCentroidPoint = MathUtils.calcPolygonCentroid(newPoints);
      const coords = newPoints.map(point => {
        point = MathUtils.rotateRelativeCentroid(point, -this.model.angle, newCentroidPoint);
        point = ElementUtils.calcWorldPoint(point, this._stageRect, this._stageWorldCoord);
        return point;
      })
      this.model.coords = coords;
      // 判断横轴缩放系数是否与原始的相同，如果不同，则旋转角度
      if (!MathUtils.isSameSign(yScale, yScaleOriginal)) {
        this._fixAngle();
        this._originalMatrix = matrix;
      }
    }
  }
}