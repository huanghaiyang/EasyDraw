import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import {
  DefaultRadiusRefreshOptions,
  IElementRect,
  RadiusRefreshOptions,
  RefreshAnglesOptions,
  RefreshOptions,
} from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import { computed } from "mobx";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import RadiusController from "@/modules/handler/controller/RadiusController";
import IController, { IRadiusController } from "@/types/IController";
import { clamp, clone, uniq } from "lodash";
import { BazierCurvePoints } from "@/types/IRender";

export default class ElementRect extends Element implements IElementRect {
  // 左上角圆角控制器
  private _radiusTLController: IRadiusController;
  // 右上角圆角控制器
  private _radiusTRController: IRadiusController;
  // 右下角圆角控制器
  private _radiusBRController: IRadiusController;
  // 左下角圆角控制器
  private _radiusBLController: IRadiusController;
  // 左上角圆角点
  private _radiusTLPoint: IPoint;
  // 右上角圆角点
  private _radiusTRPoint: IPoint;
  // 右下角圆角点
  private _radiusBRPoint: IPoint;
  // 左下角圆角点
  private _radiusBLPoint: IPoint;

  // 原始圆角值
  private _originalRadiusTL: number;
  private _originalRadiusTR: number;
  private _originalRadiusBR: number;
  private _originalRadiusBL: number;
  // 原始圆角点
  private _originalRadiusTLPoint: IPoint;
  private _originalRadiusTRPoint: IPoint;
  private _originalRadiusBRPoint: IPoint;
  private _originalRadiusBLPoint: IPoint;

  get radiusControllers(): IRadiusController[] {
    return [
      this._radiusTLController,
      this._radiusTRController,
      this._radiusBRController,
      this._radiusBLController,
    ];
  }

  get radius(): number[] {
    return [
      this.model.radiusTL,
      this.model.radiusTR,
      this.model.radiusBR,
      this.model.radiusBL,
    ];
  }

  get radiusPoints(): IPoint[] {
    return [
      this._radiusTLPoint,
      this._radiusTRPoint,
      this._radiusBRPoint,
      this._radiusBLPoint,
    ];
  }

  get radiusNames(): string[] {
    return ["radiusTL", "radiusTR", "radiusBR", "radiusBL"];
  }

  @computed
  get radiusTL(): number {
    return this.model.radiusTL;
  }

  @computed
  get radiusTR(): number {
    return this.model.radiusTR;
  }

  @computed
  get radiusBR(): number {
    return this.model.radiusBR;
  }

  @computed
  get radiusBL(): number {
    return this.model.radiusBL;
  }

  get visualRadiusTL(): number {
    return this._getRadius(this.model.radiusTL);
  }

  get visualRadiusTR(): number {
    return this._getRadius(this.model.radiusTR);
  }

  get visualRadiusBR(): number {
    return this._getRadius(this.model.radiusBR);
  }

  get visualRadiusBL(): number {
    return this._getRadius(this.model.radiusBL);
  }

  get editingEnable(): boolean {
    return false;
  }

  get radiusTLPoint(): IPoint {
    return this._radiusTLPoint;
  }

  get radiusTRPoint(): IPoint {
    return this._radiusTRPoint;
  }

  get radiusBRPoint(): IPoint {
    return this._radiusBRPoint;
  }

  get radiusBLPoint(): IPoint {
    return this._radiusBLPoint;
  }

  get controllers(): IController[] {
    return [...super.controllers, ...this.radiusControllers];
  }

  get isAllRadiusEqual(): boolean {
    return (
      uniq([
        this.model.radiusTL,
        this.model.radiusTR,
        this.model.radiusBR,
        this.model.radiusBL,
      ]).length === 1
    );
  }

  get curvePathPoints(): BazierCurvePoints[][] {
    return this.model.styles.strokes.map(stroke => {
      const baziers = this._getBazierCurvePoints();
      let points: IPoint[] = [];
      baziers.forEach(curve => {
        const { start, controller, end } = curve;
        points.push(start, controller, end);
      });
      points = this.convertPointsByStrokeType(points, stroke);

      const result: BazierCurvePoints[] = [];
      for (let i = 0; i < points.length; i += 3) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];
        result.push({
          start: p1,
          controller: p2,
          end: p3,
        } as BazierCurvePoints);
      }
      return result;
    });
  }

  /**
   * 计算左上角圆角点的世界坐标
   *
   * @returns 左上角圆角点
   */
  calcRadiusTLCoord(real?: boolean): IPoint {
    const radius = real ? this.model.radiusTL : this.visualRadiusTL;
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[0],
        this.model.leanXAngle,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? -radius : radius,
        dy: radius,
      },
    );
    return coord;
  }

  /**
   * 计算右上角圆角点的世界坐标
   *
   * @returns 右上角圆角点
   */
  calcRadiusTRCoord(real?: boolean): IPoint {
    const radius = real ? this.model.radiusTR : this.visualRadiusTR;
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[1],
        this.model.leanXAngle,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? radius : -radius,
        dy: radius,
      },
    );
    return coord;
  }

  /**
   * 计算右下角圆角点的世界坐标
   *
   * @returns 右下角圆角点
   */
  calcRadiusBRCoord(real?: boolean): IPoint {
    const radius = real ? this.model.radiusBR : this.visualRadiusBR;
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[2],
        this.model.leanXAngle,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? radius : -radius,
        dy: -radius,
      },
    );
    return coord;
  }

  /**
   * 计算左下角圆角点的世界坐标
   *
   * @returns 左下角圆角点
   */
  calcRadiusBLCoord(real?: boolean): IPoint {
    const radius = real ? this.model.radiusBL : this.visualRadiusBL;
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[3],
        this.model.leanXAngle,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? -radius : radius,
        dy: -radius,
      },
    );
    return coord;
  }

  /**
   * 计算左上角圆角点的舞台坐标
   *
   * @returns 左上角圆角点
   */
  calcRadiusTLPoint(real?: boolean): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusTLCoord(real),
      this.shield.stageCalcParams,
    );
    return MathUtils.transWithCenter(point, this.angles, this.center);
  }

  /**
   * 计算右上角圆角点的舞台坐标
   *
   * @returns 右上角圆角点
   */
  calcRadiusTRPoint(real?: boolean): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusTRCoord(real),
      this.shield.stageCalcParams,
    );
    return MathUtils.transWithCenter(point, this.angles, this.center);
  }

  /**
   * 计算右下角圆角点的舞台坐标
   *
   * @returns 右下角圆角点
   */
  calcRadiusBRPoint(real?: boolean): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusBRCoord(real),
      this.shield.stageCalcParams,
    );
    return MathUtils.transWithCenter(point, this.angles, this.center);
  }

  /**
   * 计算左下角圆角点的舞台坐标
   *
   * @returns 左下角圆角点
   */
  calcRadiusBLPoint(real?: boolean): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusBLCoord(real),
      this.shield.stageCalcParams,
    );
    return MathUtils.transWithCenter(point, this.angles, this.center);
  }

  /**
   * 刷新左上角圆角点
   */
  refreshRadiusTLPoint(): void {
    this._radiusTLPoint = this.calcRadiusTLPoint();
  }

  /**
   * 刷新左上角圆角点
   */
  refreshRadiusTRPoint(): void {
    this._radiusTRPoint = this.calcRadiusTRPoint();
  }

  /**
   * 刷新右上角圆角点
   */
  refreshRadiusBRPoint(): void {
    this._radiusBRPoint = this.calcRadiusBRPoint();
  }

  /**
   * 刷新右下角圆角点
   */
  refreshRadiusBLPoint(): void {
    this._radiusBLPoint = this.calcRadiusBLPoint();
  }

  /**
   * 刷新左上角圆角控制器
   */
  refreshRadiusTLController(): void {
    const { x, y } = this._radiusTLPoint;
    const points = this.getControllerPoints(this._radiusTLPoint);
    if (!this._radiusTLController) {
      this._radiusTLController = new RadiusController(this, { x, y, points });
    } else {
      this._radiusTLController.x = x;
      this._radiusTLController.y = y;
      this._radiusTLController.points = points;
    }
  }

  /**
   * 刷新右上角圆角控制器
   */
  refreshRadiusTRController(): void {
    const { x, y } = this._radiusTRPoint;
    const points = this.getControllerPoints(this._radiusTRPoint);
    if (!this._radiusTRController) {
      this._radiusTRController = new RadiusController(this, { x, y, points });
    } else {
      this._radiusTRController.x = x;
      this._radiusTRController.y = y;
      this._radiusTRController.points = points;
    }
  }

  /**
   * 刷新右下角圆角控制器
   */
  refreshRadiusBRController(): void {
    const { x, y } = this._radiusBRPoint;
    const points = this.getControllerPoints(this._radiusBRPoint);
    if (!this._radiusBRController) {
      this._radiusBRController = new RadiusController(this, { x, y, points });
    } else {
      this._radiusBRController.x = x;
      this._radiusBRController.y = y;
      this._radiusBRController.points = points;
    }
  }

  /**
   * 刷新左下角圆角控制器
   */
  refreshRadiusBLController(): void {
    const { x, y } = this._radiusBLPoint;
    const points = this.getControllerPoints(this._radiusBLPoint);
    if (!this._radiusBLController) {
      this._radiusBLController = new RadiusController(this, { x, y, points });
    } else {
      this._radiusBLController.x = x;
      this._radiusBLController.y = y;
      this._radiusBLController.points = points;
    }
  }

  /**
   * 刷新圆角
   *
   * @param options 刷新圆角选项
   */
  refreshRadiusPoints(options?: RadiusRefreshOptions): void {
    options = options || DefaultRadiusRefreshOptions;
    // 判断是否需要刷新左上角圆角点
    if (options.tl) this.refreshRadiusTLPoint();
    // 判断是否需要刷新右上角圆角点
    if (options.tr) this.refreshRadiusTRPoint();
    // 判断是否需要刷新右下角圆角点
    if (options.br) this.refreshRadiusBRPoint();
    // 判断是否需要刷新左下角圆角点
    if (options.bl) this.refreshRadiusBLPoint();
  }

  /**
   * 刷新圆角控制器
   *
   * @param options 刷新圆角控制器选项
   */
  refreshRadiusControllers(options?: RadiusRefreshOptions): void {
    options = options || DefaultRadiusRefreshOptions;
    if (options.tl) this.refreshRadiusTLController();
    if (options.tr) this.refreshRadiusTRController();
    if (options.br) this.refreshRadiusBRController();
    if (options.bl) this.refreshRadiusBLController();
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
    this._originalRadiusTL = this.model.radiusTL;
    this._originalRadiusTR = this.model.radiusTR;
    this._originalRadiusBR = this.model.radiusBR;
    this._originalRadiusBL = this.model.radiusBL;

    this._originalRadiusTLPoint = clone(this._radiusTLPoint);
    this._originalRadiusTRPoint = clone(this._radiusTRPoint);
    this._originalRadiusBRPoint = clone(this._radiusBRPoint);
    this._originalRadiusBLPoint = clone(this._radiusBLPoint);
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
        let { point: originalPoint } = this._getOriginalRadius(index);
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
          this.radiusNames.forEach(key => {
            this.model[key] = radius;
          });
        } else {
          this.model[this.radiusNames[index]] = radius;
        }
        this.refreshRadius();
      }
    }
  }

  /**
   * 计算圆角点
   * @param index 圆角索引
   * @param real 是否实际坐标
   */
  private _calcRadiusPoint(index: number, real?: boolean): IPoint {
    let point: IPoint;
    switch (index) {
      case 0: {
        point = this.calcRadiusTLPoint(true);
        break;
      }
      case 1: {
        point = this.calcRadiusTRPoint(true);
        break;
      }
      case 2: {
        point = this.calcRadiusBRPoint(true);
        break;
      }
      case 3: {
        point = this.calcRadiusBLPoint(true);
        break;
      }
    }
    return point;
  }

  /**
   * 根据圆角的顶点计算曲线点
   *
   * @param index 圆角索引
   * @returns
   */
  private _getRadiusBazierCurvePoints(index: number): BazierCurvePoints {
    let start: IPoint, end: IPoint;
    const controller: IPoint = this.rotateBoxPoints[index];
    const point = this._calcRadiusPoint(index);
    const points = MathUtils.calcCrossPointsOfParallelLines(
      point,
      this.rotateBoxPoints,
    );
    switch (index) {
      case 0: {
        start = points[3];
        end = points[0];
        break;
      }
      case 1: {
        start = points[0];
        end = points[1];
        break;
      }
      case 2: {
        start = points[1];
        end = points[2];
        break;
      }
      case 3: {
        start = points[2];
        end = points[3];
        break;
      }
    }
    return {
      start,
      controller,
      end,
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
    this.radiusNames.forEach((key, index) => {
      result.push(this._getRadiusBazierCurvePoints(index));
    });
    return result;
  }

  /**
   * 获取原始圆角值
   * @param index 圆角索引
   * @returns 原始圆角值
   */
  private _getOriginalRadius(index: number): {
    radius: number;
    point: IPoint;
  } {
    switch (index) {
      case 0:
        return {
          radius: this._originalRadiusTL,
          point: this._originalRadiusTLPoint,
        };
      case 1:
        return {
          radius: this._originalRadiusTR,
          point: this._originalRadiusTRPoint,
        };
      case 2:
        return {
          radius: this._originalRadiusBR,
          point: this._originalRadiusBRPoint,
        };
      case 3:
        return {
          radius: this._originalRadiusBL,
          point: this._originalRadiusBLPoint,
        };
    }
  }

  /**
   * 修正圆角
   */
  private _reviseRadius(): void {
    this.radiusNames.forEach(key => {
      this.model[key] = clamp(this.model[key], 0, this.minPrimitiveSize / 2);
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
