import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import {
  DefaultRadiusRefreshOptions,
  IElementRect,
  RadiusRefreshOptions,
  RefreshOptions,
} from "@/types/IElement";
import MathUtils from "@/utils/MathUtils";
import { computed } from "mobx";
import ElementUtils from "./utils/ElementUtils";

export default class ElementRect extends Element implements IElementRect {
  // 左上角圆角点
  private _radiusTLPoint: IPoint;
  // 右上角圆角点
  private _radiusTRPoint: IPoint;
  // 右下角圆角点
  private _radiusBRPoint: IPoint;
  // 左下角圆角点
  private _radiusBLPoint: IPoint;

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

  get controllerPoints(): IPoint[] {
    return [
      this.radiusTLPoint,
      this.radiusTRPoint,
      this.radiusBRPoint,
      this.radiusBLPoint,
    ];
  }

  /**
   * 计算左上角圆角点的世界坐标
   *
   * @returns 左上角圆角点
   */
  calcRadiusTLCoord(): IPoint {
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[0],
        0,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? -this.model.radiusTL : this.model.radiusTL,
        dy: this.model.radiusTL,
      },
    );
    return coord;
  }

  /**
   * 计算右上角圆角点的世界坐标
   *
   * @returns 右上角圆角点
   */
  calcRadiusTRCoord(): IPoint {
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[1],
        0,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? this.model.radiusTR : -this.model.radiusTR,
        dy: this.model.radiusTR,
      },
    );
    return coord;
  }

  /**
   * 计算右下角圆角点的世界坐标
   *
   * @returns 右下角圆角点
   */
  calcRadiusBRCoord(): IPoint {
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[2],
        0,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? this.model.radiusBR : -this.model.radiusBR,
        dy: -this.model.radiusBR,
      },
    );
    return coord;
  }

  /**
   * 计算左下角圆角点的世界坐标
   *
   * @returns 左下角圆角点
   */
  calcRadiusBLCoord(): IPoint {
    const coord = MathUtils.translate(
      MathUtils.leanWithCenter(
        this.model.boxCoords[3],
        0,
        -this.model.leanYAngle,
        this.centerCoord,
      ),
      {
        dx: this.flipX ? -this.model.radiusBL : this.model.radiusBL,
        dy: -this.model.radiusBL,
      },
    );
    return coord;
  }

  /**
   * 计算左上角圆角点的舞台坐标
   *
   * @returns 左上角圆角点
   */
  calcRadiusTLPoint(): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusTLCoord(),
      this.shield.stageCalcParams,
    );
    return MathUtils.rotateWithCenter(point, this.model.angle, this.center);
  }

  /**
   * 计算右上角圆角点的舞台坐标
   *
   * @returns 右上角圆角点
   */
  calcRadiusTRPoint(): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusTRCoord(),
      this.shield.stageCalcParams,
    );
    return MathUtils.rotateWithCenter(point, this.model.angle, this.center);
  }

  /**
   * 计算右下角圆角点的舞台坐标
   *
   * @returns 右下角圆角点
   */
  calcRadiusBRPoint(): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusBRCoord(),
      this.shield.stageCalcParams,
    );
    return MathUtils.rotateWithCenter(point, this.model.angle, this.center);
  }

  /**
   * 计算左下角圆角点的舞台坐标
   *
   * @returns 左下角圆角点
   */
  calcRadiusBLPoint(): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusBLCoord(),
      this.shield.stageCalcParams,
    );
    return MathUtils.rotateWithCenter(point, this.model.angle, this.center);
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
   * 刷新
   * @param options
   */
  refresh(options?: RefreshOptions): void {
    super.refresh(options);
    this.refreshRadiusPoints();
  }
}
