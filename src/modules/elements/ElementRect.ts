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
    const { type, width: sWidth } = strokeStyle;
    let coords = this.calcUnleanBoxCoords();
    const { width: oWidth, height: oHeight } =
      CommonUtils.calcRectangleSize(coords);
    let sx: number = 1,
      sy: number = 1;

    switch (type) {
      case StrokeTypes.outside: {
        sx = (oWidth + sWidth) / oWidth;
        sy = (oHeight + sWidth) / oHeight;
        break;
      }
      case StrokeTypes.inside: {
        sx = (oWidth - sWidth) / oWidth;
        sy = (oHeight - sWidth) / oHeight;
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
    const { type, width: sWidth } = strokeStyle;
    const { width, height } = CommonUtils.calcRectangleSize(coords);
    const minSize = Math.min(width, height);

    radius = radius.map(value => {
      if (value === 0) return value;
      switch (type) {
        case StrokeTypes.inside: {
          return clamp(value - sWidth / 2, 0, minSize / 2);
        }
        case StrokeTypes.outside: {
          return clamp(value + sWidth / 2, 0, minSize / 2);
        }
        default: {
          return value;
        }
      }
    });
    return radius;
  }

  /**
   * 计算出绘制边框需要的圆角点
   *
   * @param strokeStyle
   * @returns
   */
  private _getArcVerticalPoints(strokeStyle: StrokeStyle): ArcPoints[] {
    let boxCoords = this.calcUnleanBoxCoords();
    boxCoords = this._getArcBoxCoords(strokeStyle);
    const radius = this._getArcRadius(boxCoords, strokeStyle);
    const rotateBoxCoords = MathUtils.batchTransWithCenter(
      boxCoords,
      this.angles,
      this.centerCoord,
    );
    const result: ArcPoints[] = [];
    range(4).forEach(index => {
      const coord = boxCoords[index];
      const value = radius[index];
      const rCoord = MathUtils.transWithCenter(
        this.calcRadiusCoordBy(coord, index, value),
        this.angles,
        this.centerCoord,
      );
      let controller: IPoint = rotateBoxCoords[index];
      let start: IPoint, end: IPoint;
      if (!value) {
        start = rotateBoxCoords[index];
        end = rotateBoxCoords[index];
      } else {
        const crossPoints = MathUtils.calcVerticalIntersectionPoints(
          rCoord,
          rotateBoxCoords,
        );
        const indexes: number[][] = [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
        ];
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
        let radius = proportion * (this.minPrimitiveSize / 2);
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
        this.minPrimitiveSize / 2,
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
