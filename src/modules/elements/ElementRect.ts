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
import { clamp, cloneDeep, range, uniq } from "lodash";
import { ArcPoints } from "@/types/IRender";
import { computed } from "mobx";
import { StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";
import CommonUtils from "@/utils/CommonUtils";

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

  get arcPoints(): ArcPoints[][] {
    return this.model.styles.strokes.map(strokeStyle => {
      return this._getArcVerticalPoints(strokeStyle);
    });
  }

  get arcFillPoints(): ArcPoints[] {
    const index = this.innerestStrokePathPointsIndex;
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
    return this._getArcVerticalPoints(strokeStyle);
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
    let coords = this.calcUnleanBoxCoords();
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
  private _getArcRadius(coords: IPoint[], strokeStyle: StrokeStyle): number[] {
    let { radius } = this.model;
    const { type, width: strokeWidth } = strokeStyle;
    const { width, height } = MathUtils.calcVerticalSize(coords);
    const minSize = Math.min(width, height);

    radius = radius.map(value => {
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
    return radius;
  }

  /**
   * 计算控制点与矩形的垂直交点
   *
   * @param rCoord
   * @param rotateBoxCoords
   * @returns
   */
  private _getVerticalIntersection(
    rCoord: IPoint,
    rotateBoxCoords: IPoint[],
  ): { coords: IPoint[]; indexes: number[][] } {
    // 计算控制点与矩形的垂直交点
    const coords = MathUtils.calcVerticalIntersectionPoints(
      rCoord,
      rotateBoxCoords,
      true,
    );
    const indexes: number[][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
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
  private _getArcVerticalPoints(strokeStyle: StrokeStyle): ArcPoints[] {
    // 计算原始矩形的坐标
    let boxCoords = this.calcUnleanBoxCoords();
    // 计算描边矩形坐标
    boxCoords = this._getArcBoxCoords(strokeStyle);
    // 计算圆角半径
    const radius = this._getArcRadius(boxCoords, strokeStyle);
    // 结果集
    const result: ArcPoints[] = [];
    range(4).forEach(index => {
      // 当前顶点坐标
      const coord = boxCoords[index];
      // 当前圆角半径
      const value = radius[index];
      // 计算圆角控制点并转换为旋转过的坐标
      const rCoord = this.calcRadiusCoordBy(coord, index, value);
      // 当前顶点（旋转过的坐标）
      let controller: IPoint = boxCoords[index];
      let start: IPoint, end: IPoint;
      // 圆角半径为0，直接返回顶点坐标
      if (!value) {
        start = boxCoords[index];
        end = boxCoords[index];
      } else {
        const { coords: crossPoints, indexes } = this._getVerticalIntersection(
          rCoord,
          boxCoords,
        );
        start = crossPoints[indexes[index][0]];
        end = crossPoints[indexes[index][1]];
      }
      start = ElementUtils.calcStageRelativePoint(
        start,
        this.shield.stageCalcParams,
      );
      end = ElementUtils.calcStageRelativePoint(
        end,
        this.shield.stageCalcParams,
      );
      controller = ElementUtils.calcStageRelativePoint(
        controller,
        this.shield.stageCalcParams,
      );
      result.push({
        start,
        controller,
        end,
        value,
        radius: ElementUtils.calcStageRelativePoint(
          rCoord,
          this.shield.stageCalcParams,
        ),
      });
    });
    return result;
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
    const coord = MathUtils.leanWithCenter(
      this.model.boxCoords[index],
      this.model.leanXAngle,
      -this.model.leanYAngle,
      this.centerCoord,
    );
    return this.calcRadiusCoordBy(coord, index, value);
  }

  /**
   * 计算圆角点的世界坐标
   *
   * @param boxCoords
   * @param index
   * @param value
   * @returns
   */
  calcRadiusCoordBy(point: IPoint, index: number, value: number): IPoint {
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
    const coord = MathUtils.translate(point, {
      dx,
      dy,
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
    if (value === 0) return (this.minVerticalSize / 2) * 0.2;
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
        let radius = proportion * (this.minVerticalSize / 2);
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
   * 修正圆角
   */
  private _reviseRadius(): void {
    range(4).forEach(index => {
      this.model.radius[index] = clamp(
        this.model.radius[index],
        0,
        this.minVerticalSize / 2,
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
