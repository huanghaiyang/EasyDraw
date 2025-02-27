import Element from "@/modules/elements/Element";
import { ElementStatus, IPoint } from "@/types";
import { IElementRect } from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import CornerController from "@/modules/handler/controller/CornerController";
import IController, { ICornerController } from "@/types/IController";
import { clamp, cloneDeep, every, range, uniq } from "lodash";
import { ArcPoints } from "@/types/IRender";
import { StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementRect extends Element implements IElementRect {
  _cornerControllers: ICornerController[] = [];
  _cornerCoords: IPoint[] = [];
  _originalCornerCoords: IPoint[] = [];
  _originalAllCornerEqual: boolean = false;
  _arcCoords: ArcPoints[][] = [];
  _arcFillCoords: ArcPoints[] = [];
  _originalArcCoords: ArcPoints[][] = [];
  _originalArcFillCoords: ArcPoints[] = [];

  get cornersModifyEnable(): boolean {
    return true;
  }

  get cornerControllers(): ICornerController[] {
    return this._cornerControllers;
  }

  get normalizeCorners(): number[] {
    return this._normalizeCorners();
  }

  get cornerCoords(): IPoint[] {
    return this._cornerCoords;
  }

  get visualCorners(): number[] {
    return this.normalizeCorners.map(value => this._getCorner(value));
  }

  get editingEnable(): boolean {
    return false;
  }

  get controllers(): IController[] {
    return [...super.controllers, ...this.cornerControllers];
  }

  get isAllCornerEqual(): boolean {
    return uniq(this.model.corners).length === 1;
  }

  get arcCoords(): ArcPoints[][] {
    return this._arcCoords;
  }

  get arcFillCoords(): ArcPoints[] {
    return this._arcFillCoords;
  }

  calcArcCoords(): ArcPoints[][] {
    return this.model.styles.strokes.map(strokeStyle => {
      return this._getArcVerticalCoords(strokeStyle);
    });
  }

  calcArcFillCoords(): ArcPoints[] {
    const index = this.innermostStrokeCoordIndex;
    let strokeStyle = this.model.styles.strokes[index];
    let { width, type } = strokeStyle;
    switch (type) {
      case StrokeTypes.inside: {
        width = width * 2;
        break;
      }
      case StrokeTypes.middle: {
        width = width;
        break;
      }
      case StrokeTypes.outside: {
        width = 0;
        break;
      }
    }
    strokeStyle = { ...strokeStyle, type: StrokeTypes.inside, width };
    return this._getArcVerticalCoords(strokeStyle);
  }

  /**
   * 计算出绘制边框需要的盒模型坐标
   *
   * @param strokeStyle
   * @returns
   */
  private _getArcBoxCoords(strokeStyle: StrokeStyle): IPoint[] {
    const { type, width: strokeWidth } = strokeStyle;
    // 计算原始矩形的坐标
    let coords = this.calcUnLeanBoxCoords();
    // 计算原始矩形的宽和高
    const { width, height } = CommonUtils.calcRectangleSize(coords);
    let sx: number = 1,
      sy: number = 1;
    switch (type) {
      case StrokeTypes.outside: {
        sx = (width + strokeWidth) / width;
        sy = (height + strokeWidth) / height;
        break;
      }
      case StrokeTypes.inside: {
        sx = (width - strokeWidth) / width;
        sy = (height - strokeWidth) / height;
        break;
      }
    }
    if ([StrokeTypes.inside, StrokeTypes.outside].includes(type)) {
      coords = MathUtils.batchScaleWithCenter(
        coords,
        {
          sx,
          sy,
        },
        this.centerCoord,
      );
    }
    return coords;
  }

  /**
   * 计算出绘制边框需要的圆角半径
   *
   * @param coords
   * @param strokeStyle
   * @returns
   */
  private _getArcCorner(coords: IPoint[], strokeStyle: StrokeStyle): number[] {
    let corners = this.normalizeCorners;
    const { type, width: strokeWidth } = strokeStyle;
    const { width, height } = MathUtils.calcParallelogramVerticalSize(coords);
    const minSize = Math.min(width, height);

    corners = corners.map(value => {
      if (value === 0) return value;
      switch (type) {
        case StrokeTypes.inside: {
          return clamp(value - strokeWidth / 2, 0, minSize / 2);
        }
        case StrokeTypes.outside: {
          return clamp(value + strokeWidth / 2, 0, minSize / 2);
        }
        default: {
          return value;
        }
      }
    });
    return corners;
  }

  /**
   * 计算控制点与矩形的垂直交点
   *
   * @param rCoord
   * @param rotateBoxCoords
   * @returns
   */
  private _getVerticalIntersection(rCoord: IPoint, rotateBoxCoords: IPoint[]): { coords: IPoint[]; indexes: number[][] } {
    // 计算控制点与矩形的垂直交点
    const coords = MathUtils.calcParallelogramVerticalIntersectionPoints(rCoord, rotateBoxCoords, true);
    const indexes: number[][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ];
    return { coords, indexes };
  }

  /**
   * 计算平行线交点
   *
   * @param rCoord
   * @param rotateBoxCoords
   * @returns
   */
  private _getCrossPointsOfParallelLines(rCoord: IPoint, rotateBoxCoords: IPoint[]): { coords: IPoint[]; indexes: number[][] } {
    const coords = MathUtils.calcCrossPointsOfParallelLines(rCoord, rotateBoxCoords);
    const indexes: number[][] = [
      [3, 0],
      [0, 1],
      [1, 2],
      [2, 3],
    ];
    return { coords, indexes };
  }

  /**
   * 计算出绘制边框需要的圆角点
   *
   * 注意此处需要使用未旋转偏移的原始坐标进行计算
   *
   * @param strokeStyle
   * @returns
   */
  private _getArcVerticalCoords(strokeStyle: StrokeStyle): ArcPoints[] {
    // 计算原始矩形的坐标
    let boxCoords = this.calcUnLeanBoxCoords();
    // 计算描边矩形坐标
    boxCoords = this._getArcBoxCoords(strokeStyle);
    // 计算圆角半径
    const corner = this._getArcCorner(boxCoords, strokeStyle);
    // 结果集
    const result: ArcPoints[] = [];
    range(4).forEach(index => {
      // 当前顶点坐标
      const coord = boxCoords[index];
      // 当前圆角半径
      const value = corner[index];
      // 计算圆角控制点并转换为旋转过的坐标
      const rCoord = this.calcUnLeanCornerCoordBy(coord, index, value);
      // 当前顶点（旋转过的坐标）
      let controller: IPoint = boxCoords[index];
      let start: IPoint, end: IPoint;
      // 圆角半径为0，直接返回顶点坐标
      if (!value) {
        start = boxCoords[index];
        end = boxCoords[index];
      } else {
        const { coords: crossPoints, indexes } = this._getVerticalIntersection(rCoord, boxCoords);
        start = crossPoints[indexes[index][0]];
        end = crossPoints[indexes[index][1]];
        // 平行线无交点
        if (!start) {
          start = boxCoords[index];
        }
        if (!end) {
          end = boxCoords[index];
        }
      }
      result.push({
        start,
        controller,
        end,
        value,
        corner: rCoord,
      });
    });
    return result;
  }

  /**
   * 计算圆角点的世界坐标(非旋转倾斜过的坐标)
   *
   * @param index
   * @param real
   * @returns
   */
  calcUnLeanCornerCoord(index: number, real?: boolean): IPoint {
    const value = real ? this.normalizeCorners[index] : this.visualCorners[index];
    const coord = MathUtils.leanWithCenter(this.model.boxCoords[index], this.model.leanXAngle, -this.model.leanYAngle, this.centerCoord);
    return this.calcUnLeanCornerCoordBy(coord, index, value);
  }

  /**
   * 计算圆角点的世界坐标（非旋转倾斜过的坐标）
   *
   * @param boxCoords
   * @param index
   * @param value
   * @returns
   */
  calcUnLeanCornerCoordBy(point: IPoint, index: number, value: number): IPoint {
    if (value === 0) return point;
    let x: number, y: number;
    if ([0, 3].includes(index)) {
      x = this.flipX ? -value : value;
    } else {
      x = this.flipX ? value : -value;
    }
    if ([0, 1].includes(index)) {
      y = value;
    } else {
      y = -value;
    }
    const coord = MathUtils.translate(point, {
      x,
      y,
    });
    return coord;
  }

  /**
   * 计算圆角点的舞台坐标
   *
   * @param index
   * @param real
   * @returns
   */
  calcCornerCoord(index: number, real?: boolean): IPoint {
    const controller = this._rotateBoxCoords[index];
    const value = this.visualCorners[index];
    let coord = this.calcUnLeanCornerCoord(index, real);
    coord = MathUtils.transWithCenter(coord, this.angles, this.centerCoord);
    const { coords: crossPoints, indexes } = this._getCrossPointsOfParallelLines(coord, this._rotateBoxCoords);
    let start = crossPoints[indexes[index][0]];
    let end = crossPoints[indexes[index][1]];
    if (!start || !end) {
      return controller;
    }
    let tAngle = MathUtils.calcTriangleAngleWithClockwise(start, controller, end);
    const flipX = this.flipX;
    if (flipX) {
      tAngle = 180 - tAngle;
    }
    const targetAngle = MathUtils.calcAngle(controller, end) + (flipX ? -tAngle / 2 : tAngle / 2);
    const targetCenter = this._getCornerTargetCoord(index, this._rotateBoxCoords);
    const ctLen = MathUtils.calcDistance(controller, targetCenter) * 2;
    const ratio = value / this.minParallelogramVerticalSize;
    const len = ctLen * ratio;
    return MathUtils.calcTargetPoint(controller, len, targetAngle);
  }

  /**
   * 刷新圆角控制器
   *
   * @param index
   */
  refreshCornersController(index: number): void {
    if (this._cornerCoords.length === 0) return;
    const { x, y } = this._cornerCoords[index];
    const points = this.getController4BoxCoords(this._cornerCoords[index]);
    if (!this._cornerControllers[index]) {
      this._cornerControllers[index] = new CornerController(this, {
        x,
        y,
        points,
      });
    } else {
      this._cornerControllers[index].x = x;
      this._cornerControllers[index].y = y;
      this._cornerControllers[index].points = points;
    }
  }

  /**
   * 刷新圆角点
   *
   * @param index
   */
  refreshCornerCoords(index: number): void {
    if (!this._rotateBoxCoords || !this._rotateBoxCoords.length) return;
    this._cornerCoords[index] = this.calcCornerCoord(index);
  }

  /**
   * 刷新圆角
   *
   * @param options 刷新圆角选项
   */
  refreshCornersCoords(indexes?: number[]): void {
    indexes = indexes || [0, 1, 2, 3];
    indexes.forEach(index => {
      this.refreshCornerCoords(index);
    });
  }

  /**
   * 刷新圆角控制器
   *
   * @param options 刷新圆角控制器选项
   */
  refreshCornersControllers(indexes?: number[]): void {
    indexes = indexes || [0, 1, 2, 3];
    indexes.forEach(index => {
      this.refreshCornersController(index);
    });
  }

  /**
   * 刷新圆角
   */
  _refreshCorners(): void {
    if (this.status !== ElementStatus.finished) return;
    this.refreshCornersCoords();
    this.refreshCornersControllers();
  }

  /**
   * 刷新圆角
   */
  refreshCorners(): void {
    super.refreshCorners();
    if (!this.isInMultiSelected) {
      this._refreshCorners();
    }
  }

  /**
   * 刷新边框
   */
  refreshStrokePoints(): void {
    super.refreshStrokePoints();
    this._arcCoords = this.calcArcCoords();
    this._arcFillCoords = this.calcArcFillCoords();
  }

  /**
   * 获取圆角值
   * @param value 圆角值
   */
  private _getCorner(value: number): number {
    if (this._isCornerMoving) return value;
    if (value === 0) return (this.minParallelogramVerticalSize / 2) * 0.2;
    return value;
  }

  /**
   * 刷新原始组件属性
   */
  refreshOriginalElementProps(): void {
    super.refreshOriginalElementProps();
    this._originalCornerCoords = cloneDeep(this._cornerCoords);
    this._originalAllCornerEqual = this.isAllCornerEqual;
  }

  /**
   * 重新维护原始描边
   */
  refreshOriginalStrokes(): void {
    super.refreshOriginalStrokes();
    this._originalArcCoords = cloneDeep(this._arcCoords);
    this._originalArcFillCoords = cloneDeep(this._arcFillCoords);
  }

  /**
   * 获取圆角目标点
   * @param index 圆角索引
   * @param boxCoords 原始点
   */
  private _getCornerTargetCoord(index: number, boxCoords: IPoint[]): IPoint {
    let point: IPoint;
    let [c1, c2] = MathUtils.calculateAngleBisectorIntersection(boxCoords);
    const { width, height } = MathUtils.calcParallelogramVerticalSize(boxCoords);
    if (width <= height) {
      if ([0, 1].includes(index)) {
        point = c1;
      } else {
        point = c2;
      }
    } else {
      if ([0, 3].includes(index)) {
        point = c1;
      } else {
        point = c2;
      }
    }
    return point;
  }

  /**
   * 通过偏移量更新圆角
   * @param offset 偏移量
   */
  updateCornerByOffset(offset: IPoint): void {
    const controller = this.getActiveController();
    if (controller instanceof CornerController) {
      const index = this.cornerControllers.indexOf(controller);
      if (index !== -1) {
        const segmentStart = this._getCornerTargetCoord(index, this._rotateBoxCoords);
        const originalPoint = this._originalCornerCoords[index];
        const currentPoint = {
          x: offset.x + originalPoint.x,
          y: offset.y + originalPoint.y,
        };
        const segmentEnd = this._rotateBoxCoords[index];
        const crossPoint = MathUtils.calcProjectionOnSegment(currentPoint, segmentStart, segmentEnd);
        let proportion = MathUtils.calcSegmentProportion(crossPoint, segmentStart, segmentEnd);
        proportion = clamp(proportion, 0, 1);
        proportion = 1 - proportion;
        let corner = proportion * (this.minParallelogramVerticalSize / 2);
        if (this._originalAllCornerEqual) {
          this.setCorners(corner);
        } else {
          this.setCorners(corner, index);
        }
      }
    }
  }

  /**
   * 修正圆角
   */
  private _normalizeCorners(): number[] {
    const values = [...this.model.corners];
    if (every(values, value => value === 0)) return values;
    return ElementUtils.fixCornersBasedOnMinSize(values, this.minParallelogramVerticalSize);
  }

  /**
   * 位移元素
   * @param offset 位移量
   */
  translateBy(offset: IPoint): void {
    this._arcCoords = MathUtils.batchTranslateArcPoints(this._originalArcCoords, offset);
    this._arcFillCoords = MathUtils.translateArcPoints(this._originalArcFillCoords, offset);
    super.translateBy(offset);
  }

  /**
   * 设置选中状态
   * @param value 选中状态
   */
  __setIsSelected(value: boolean): void {
    super.__setIsSelected(value);
    if (value) {
      this._refreshCorners();
    }
  }
}
