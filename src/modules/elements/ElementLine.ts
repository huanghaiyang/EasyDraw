import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import { LineClosestMargin } from "@/types/constants";
import { IElementLine } from "@/types/IElement";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import PolygonUtils from "@/utils/PolygonUtils";
import { TransformerTypes } from "@/types/ITransformer";
import { some } from "lodash";

export default class ElementLine extends Element implements IElementLine {
  get editingEnable(): boolean {
    return false;
  }

  get flipXEnable(): boolean {
    return false;
  }

  get flipYEnable(): boolean {
    return false;
  }

  get verticesTransformEnable(): boolean {
    return true;
  }

  get boxVerticesTransformEnable(): boolean {
    return false;
  }

  get heightModifyEnable(): boolean {
    return false;
  }

  get rotationEnable(): boolean {
    return false;
  }

  get borderTransformEnable(): boolean {
    return false;
  }

  get fillEnabled(): boolean {
    return false;
  }

  get ratioLockedEnable(): boolean {
    return false;
  }

  get viewAngleCalcEnable(): boolean {
    return false;
  }

  get leanYAngleCalcEnable(): boolean {
    return false;
  }

  get leanYAngleModifyEnable(): boolean {
    return false;
  }

  get startRotatePathPoint(): IPoint {
    return this.rotatePathPoints[0];
  }

  get endRotatePathPoint(): IPoint {
    return this.rotatePathPoints[1];
  }

  get startCoord(): IPoint {
    return this.model.coords[0];
  }

  get endCoord(): IPoint {
    return this.model.coords[1];
  }

  private _outerPathPoints: IPoint[][] = [];
  private _outerPathCoords: IPoint[][] = [];

  get outerPathPoints(): IPoint[][] {
    return this._outerPathPoints;
  }

  get outerPathCoords(): IPoint[][] {
    return this._outerPathCoords;
  }

  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
  }

  get alignOutlineCoords(): IPoint[][] {
    return this._outerPathCoords;
  }

  /**
   * 刷新 bent 外轮廓
   */
  private refreshBentOutline() {
    this._outerPathPoints = this.calcOuterPathPoints();
    this._outerPathCoords = this.calcOuterPathCoords();
    this._maxOutlineBoxPoints = CommonUtils.getBoxPoints(
      this._outerPathPoints.flat(),
    );
  }

  /**
   * 刷新舞台坐标
   */
  refreshPoints(): void {
    super.refreshPoints();
    this.refreshBentOutline();
  }

  /**
   * 计算外轮廓
   *
   * @returns
   */
  calcOuterPathPoints(): IPoint[][] {
    return this.model.styles.strokes.map(stroke => {
      return PolygonUtils.calcBentLineOuterVertices(
        this.rotatePathPoints,
        stroke.width / 2,
      );
    });
  }

  /**
   * 计算外轮廓坐标
   *
   * @returns
   */
  calcOuterPathCoords(): IPoint[][] {
    return this.model.styles.strokes.map(stroke => {
      return PolygonUtils.calcBentLineOuterVertices(
        this.rotatePathCoords,
        stroke.width / 2,
      );
    });
  }

  /**
   * 刷新轮廓坐标
   */
  protected _refreshOutlinePoints(): void {
    super._refreshOutlinePoints();
    this.refreshBentOutline();
  }

  /**
   * 获取显示角度
   *
   * @returns
   */
  protected getAngle(): number {
    return ElementUtils.fixAngle(
      MathUtils.calcAngle(this.startCoord, this.endCoord) + 90,
    );
  }

  /**
   * 判断点是否靠近组件
   *
   * @param point
   * @returns
   */
  isContainsPoint(point: IPoint): boolean {
    return some(this.model.styles.strokes, stroke => {
      return MathUtils.isPointClosestSegment(
        point,
        this.startRotatePathPoint,
        this.endRotatePathPoint,
        LineClosestMargin + stroke.width / 2 / this.shield.stageScale,
      );
    });
  }

  /**
   * 是否与多边形相交
   *
   * @param points
   */
  isPolygonOverlap(points: IPoint[]): boolean {
    return some(this._outerPathPoints, pathPoints => {
      return MathUtils.isPolygonsOverlap(pathPoints, points);
    });
  }

  /**
   * 判断直线外轮廓是否与给定的多边形相交
   *
   * @param coords
   * @returns
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return some(this._outerPathPoints, pathCoords => {
      return MathUtils.isPolygonsOverlap(pathCoords, coords);
    });
  }

  /**
   * 按顶点变换
   *
   * @param offset
   */
  protected doVerticesTransform(offset: IPoint): void {
    const index = this._transformers.findIndex(
      transformer => transformer.isActive,
    );
    if (index !== -1) {
      const lockPoint =
        this._originalTransformerPoints[
          CommonUtils.getNextIndexOfArray(2, index, 1)
        ];
      // 当前拖动的点的原始位置
      const currentPointOriginal = this._originalTransformerPoints[index];
      // 根据不动点进行形变
      this.transformByLockPoint(lockPoint, currentPointOriginal, offset, index);
    }
  }

  /**
   * 获取设置尺寸变换的变换点（设置宽度的时候使用）
   *
   * @returns
   */
  protected getTransformPointForSizeChange(): IPoint {
    return this._originalTransformerPoints[1];
  }

  /**
   * 设置宽度
   *
   * @param value
   */
  setWidth(value: number): number[][] {
    const newCoord = MathUtils.calcTargetPoint(
      this.startCoord,
      value,
      this.angle - 90,
    );
    this.model.coords[1] = newCoord;
    this.model.width = value;
    this.refresh();
    return [[]];
  }

  /**
   * 设置角度，注意直线的角度始终为0，属性菜单显示的角度是通过开始坐标和结束坐标计算出来的
   *
   * @param value
   */
  setAngle(value: number): void {
    const center = MathUtils.calcCenter(this.model.coords);
    const startCoord = MathUtils.calcTargetPoint(
      center,
      this.width / 2,
      value + 90,
    );
    const endCoord = MathUtils.calcTargetPoint(
      center,
      this.width / 2,
      value - 90,
    );
    this.model.coords = [startCoord, endCoord];
    this.refresh();
  }
}
