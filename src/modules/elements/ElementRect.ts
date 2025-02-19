import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import {
  IElementRect,
  RefreshAnglesOptions,
  RefreshOptions,
} from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import RadiusController from "@/modules/handler/controller/RadiusController";
import IController, { IRadiusController } from "@/types/IController";
import { clamp, cloneDeep, isNull, range, uniq } from "lodash";
import { BazierCurvePoints } from "@/types/IRender";
import CanvasUtils from "@/utils/CanvasUtils";
import { computed } from "mobx";

export default class ElementRect extends Element implements IElementRect {
  _radiusControllers: IRadiusController[] = [];
  _radiusPoints: IPoint[] = [];
  _originalRadius: number[] = [];
  _originalRadiusPoints: IPoint[] = [];

  get radiusControllers(): IRadiusController[] {
    return this._radiusControllers;
  }

  @computed
  get radius(): number[] {
    return this.model.radius;
  }

  get radiusPoints(): IPoint[] {
    return this._radiusPoints;
  }

  get visualRadius(): number[] {
    return this.model.radius.map(value => this._getRadius(value));
  }

  get editingEnable(): boolean {
    return false;
  }

  get controllers(): IController[] {
    return [...super.controllers, ...this.radiusControllers];
  }

  get isAllRadiusEqual(): boolean {
    return uniq(this.model.radius).length === 1;
  }

  get curvePathPoints(): BazierCurvePoints[][] {
    return this.model.styles.strokes.map(strokeStyle => {
      const baziers = this._getBazierCurvePoints();
      if (!baziers) return [];
      return CanvasUtils.convertBazierPointsByStroke(
        baziers,
        strokeStyle,
        points => {
          return this.convertPointsByStrokeType(points, strokeStyle);
        },
      );
    });
  }

  /**
   * 计算圆角点的世界坐标
   *
   * @param index
   * @param real
   * @returns
   */
  calcRadiusCoord(index: number, real?: boolean): IPoint {
    const value = real ? this.model.radius[index] : this.visualRadius[index];
    let dx: number, dy: number;
    if ([0, 3].includes(index)) {
      dx = this.flipX ? -value : value;
    } else {
      dx = this.flipX ? value : -value;
    }
    if ([0, 1].includes(index)) {
      dy = value;
    } else {
      dy = -value;
    }
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[index],
        this.model.leanXAngle,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx,
        dy,
      },
    );
    return coord;
  }

  /**
   * 计算圆角点的舞台坐标
   *
   * @param index
   * @param real
   * @returns
   */
  calcRadiusPoint(index: number, real?: boolean): IPoint {
    const coord = this.calcRadiusCoord(index, real);
    const point = ElementUtils.calcStageRelativePoint(
      coord,
      this.shield.stageCalcParams,
    );
    return MathUtils.transWithCenter(point, this.angles, this.center);
  }

  /**
   * 刷新圆角控制器
   *
   * @param index
   */
  refreshRadiusController(index: number): void {
    const { x, y } = this._radiusPoints[index];
    const points = this.getControllerPoints(this._radiusPoints[index]);
    if (!this._radiusControllers[index]) {
      this._radiusControllers[index] = new RadiusController(this, {
        x,
        y,
        points,
      });
    } else {
      this._radiusControllers[index].x = x;
      this._radiusControllers[index].y = y;
      this._radiusControllers[index].points = points;
    }
  }

  /**
   * 刷新圆角点
   *
   * @param index
   */
  refreshRadiusPoint(index: number): void {
    this._radiusPoints[index] = this.calcRadiusPoint(index);
  }

  /**
   * 刷新圆角
   *
   * @param options 刷新圆角选项
   */
  refreshRadiusPoints(indexes?: number[]): void {
    indexes = indexes || [0, 1, 2, 3];
    indexes.forEach(index => {
      this.refreshRadiusPoint(index);
    });
  }

  /**
   * 刷新圆角控制器
   *
   * @param options 刷新圆角控制器选项
   */
  refreshRadiusControllers(indexes?: number[]): void {
    indexes = indexes || [0, 1, 2, 3];
    indexes.forEach(index => {
      this.refreshRadiusController(index);
    });
  }

  /**
   * 刷新圆角
   */
  refreshRadius(): void {
    this.refreshRadiusPoints();
    this.refreshRadiusControllers();
  }

  /**
   * 刷新
   * @param options
   * @param subOptions
   */
  refresh(
    options?: RefreshOptions,
    subOptions?: { angles?: RefreshAnglesOptions },
  ): void {
    super.refresh(options, subOptions);
    this.refreshRadius();
  }

  /**
   * 获取圆角值
   * @param value 圆角值
   */
  private _getRadius(value: number): number {
    if (this._isRadiusing) return value;
    if (value === 0) return (this.minPrimitiveSize / 2) * 0.2;
    return value;
  }

  /**
   * 刷新原始圆角属性
   */
  refreshOriginalRadiusProps(): void {
    this._originalRadius = cloneDeep(this.model.radius);
    this._originalRadiusPoints = cloneDeep(this._radiusPoints);
  }

  /**
   * 刷新原始组件属性
   */
  refreshOriginalElementProps(): void {
    super.refreshOriginalElementProps();
    this.refreshOriginalRadiusProps();
  }

  /**
   * 通过偏移量更新圆角
   * @param offset 偏移量
   */
  updateRadiusByOffset(offset: IPoint): void {
    const controller = this.getActiveController();
    if (controller instanceof RadiusController) {
      const index = this.radiusControllers.indexOf(controller);
      if (index !== -1) {
        let segmentStart: IPoint;
        const center = this.center;
        const boxPoints = MathUtils.batchTransWithCenter(
          this.rotateBoxPoints,
          this.angles,
          center,
          true,
        );
        let [c1, c2] = MathUtils.calculateAngleBisectorIntersection(boxPoints);
        c1 = MathUtils.transWithCenter(c1, this.angles, center);
        c2 = MathUtils.transWithCenter(c2, this.angles, center);
        if (this.width <= this.height) {
          if ([0, 1].includes(index)) {
            segmentStart = c1;
          } else {
            segmentStart = c2;
          }
        } else {
          if ([0, 3].includes(index)) {
            segmentStart = c1;
          } else {
            segmentStart = c2;
          }
        }
        const originalPoint = this._originalRadiusPoints[index];
        const currentPoint = {
          x: offset.x + originalPoint.x,
          y: offset.y + originalPoint.y,
        };
        const segmentEnd = this.rotateBoxPoints[index];
        const crossPoint = MathUtils.calcProjectionOnSegment(
          currentPoint,
          segmentStart,
          segmentEnd,
        );
        let proportion = MathUtils.calcSegmentProportion(
          crossPoint,
          segmentStart,
          segmentEnd,
        );
        proportion = clamp(proportion, 0, 1);
        proportion = 1 - proportion;
        let radius = Math.floor(proportion * (this.minPrimitiveSize / 2));
        if (this.isAllRadiusEqual) {
          [0, 1, 2, 3].forEach(key => {
            this.model.radius[key] = radius;
          });
        } else {
          this.model.radius[index] = radius;
        }
        this.refreshRadius();
      }
    }
  }

  /**
   * 根据圆角的顶点计算曲线点
   *
   * @param index 圆角索引
   * @returns
   */
  private _getRadiusBazierCurvePoints(index: number): BazierCurvePoints {
    let start: IPoint, end: IPoint;
    const value = this.radius[index];
    const controller: IPoint = this.rotateBoxPoints[index];
    if (!value) {
      start = this.rotateBoxPoints[index];
      end = this.rotateBoxPoints[index];
    } else {
      const point = this.calcRadiusPoint(index, true);
      const points = MathUtils.calcCrossPointsOfParallelLines(
        point,
        this.rotateBoxPoints,
      );
      const indexes: number[][] = [
        [3, 0],
        [0, 1],
        [1, 2],
        [2, 3],
      ];
      start = points[indexes[index][0]];
      end = points[indexes[index][1]];
      start = MathUtils.precisePoint(start, 1);
      end = MathUtils.precisePoint(end, 1);
    }
    if (isNull(start) || isNull(end)) return null;
    return {
      start,
      controller,
      end,
      value,
    };
  }

  /**
   * 获取圆角组件的曲线点
   *
   * @param index 圆角索引
   * @returns 原始圆角值
   */
  private _getBazierCurvePoints(): BazierCurvePoints[] {
    const result: BazierCurvePoints[] = [];
    let hasNull = false;
    range(4).forEach(index => {
      const curve = this._getRadiusBazierCurvePoints(index);
      if (curve) result.push(curve);
      else hasNull = true;
    });
    return hasNull ? null : result;
  }

  /**
   * 修正圆角
   */
  private _reviseRadius(): void {
    range(4).forEach(index => {
      this.model.radius[index] = Math.floor(
        clamp(this.model.radius[index], 0, this.minPrimitiveSize / 2),
      );
    });
  }

  /**
   * 刷新尺寸
   */
  refreshSize(): void {
    super.refreshSize();
    this._reviseRadius();
  }
}
