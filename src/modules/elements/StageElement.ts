import { ElementStatus, ElementObject, IPoint, IStageElement, IStageDrawerRotationModel, StageDrawerMaskModelTypes } from "@/types";
import { ILinkedNodeValue } from '@/modules/struct/LinkedNode';
import ElementUtils from "@/modules/elements/ElementUtils";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import { every } from "lodash";
import { action, makeObservable, observable, computed } from "mobx";
import { DefaultSelectionRotateSize } from "@/types/constants";

export default class StageElement implements IStageElement, ILinkedNodeValue {
  id: string;
  model: ElementObject;

  rotationModel: IStageDrawerRotationModel = {
    point: null,
    type: StageDrawerMaskModelTypes.rotate,
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
  @observable _isResizing: boolean = false;
  @observable _isRotating: boolean = false;
  @observable _isRotatingTarget: boolean = false;
  @observable _isDragging: boolean = false;
  @observable _isProvisional: boolean = false;
  @observable _isTarget: boolean = false;
  @observable _isInRange: boolean = false;
  @observable _isOnStage: boolean = false;

  get centroid(): IPoint {
    return MathUtils.calcPolygonCentroid(this.pathPoints);
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
  get isResizing(): boolean {
    return this._isResizing;
  }

  set isResizing(value: boolean) {
    this._setIsResizing(value);
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
  private _setIsResizing(value: boolean): void {
    this._isResizing = value;
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

  protected _points: IPoint[];
  protected _pathPoints: IPoint[];
  protected _boxPoints: IPoint[];
  protected _rotatePoints: IPoint[];
  protected _rotatePathPoints: IPoint[];

  get points(): IPoint[] {
    return this._points;
  }

  get pathPoints(): IPoint[] {
    return this._pathPoints;
  }

  get boxPoints(): IPoint[] {
    return this._boxPoints;
  }

  get rotatePoints(): IPoint[] {
    return this._rotatePoints;
  }

  get rotatePathPoints(): IPoint[] {
    return this._rotatePathPoints;
  }

  constructor(model: ElementObject) {
    this.model = model;
    this.id = CommonUtils.getRandomDateId();
    makeObservable(this);
  }

  /**
   * 刷新坐标
   */
  refreshStagePoints(stageRect: DOMRect, stageWorldCoord: IPoint): void {
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
    this._points = ElementUtils.calcStageRelativePoints(this.model.coords, stageRect, stageWorldCoord);
    this._pathPoints = this._points;
    this._rotatePoints = this._points.map(point => MathUtils.rotateRelativeCentroid(point, this.model.angle, MathUtils.calcPolygonCentroid(this._points)))
    this._rotatePathPoints = this._pathPoints.map(point => MathUtils.rotateRelativeCentroid(point, this.model.angle, this.centroid))
    this._boxPoints = CommonUtils.getBoxPoints(this._rotatePathPoints)
  }

  /**
   * 刷新旋转句柄在舞台的坐标
   */
  refreshRotationModelPoints() {
    this.rotationModel.point = ElementUtils.calcElementRotatePoint(this);
    this.rotationModel.vertices = CommonUtils.getBoxVertices(this.rotationModel.point, {
      width: this.rotationModel.width,
      height: this.rotationModel.height
    }).map(point => MathUtils.rotate(point, this.model.angle))
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
    return MathUtils.isPointInPolygon(point, this.rotatePathPoints);
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
}