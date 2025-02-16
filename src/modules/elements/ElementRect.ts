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
import { IRadiusController, IVerticesTransformer } from "@/types/ITransformer";
import RadiusController from "@/modules/handler/controller/RadiusController";

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

  get radiusControllers(): IRadiusController[] {
    return [
      this._radiusTLController,
      this._radiusTRController,
      this._radiusBRController,
      this._radiusBLController,
    ];
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

  get controllers(): IVerticesTransformer[] {
    return [...this.radiusControllers];
  }

  /**
   * 计算左上角圆角点的世界坐标
   *
   * @returns 左上角圆角点
   */
  calcRadiusTLCoord(): IPoint {
    const radius = this.visualRadiusTL;
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
  calcRadiusTRCoord(): IPoint {
    const radius = this.visualRadiusTR;
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
  calcRadiusBRCoord(): IPoint {
    const radius = this.visualRadiusBR;
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
  calcRadiusBLCoord(): IPoint {
    const radius = this.visualRadiusBL;
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
  calcRadiusTLPoint(): IPoint {
    const point = ElementUtils.calcStageRelativePoint(
      this.calcRadiusTLCoord(),
      this.shield.stageCalcParams,
    );
    return MathUtils.transWithCenter(point, this.angles, this.center);
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
    return MathUtils.transWithCenter(point, this.angles, this.center);
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
    return MathUtils.transWithCenter(point, this.angles, this.center);
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
      this._radiusTLController = new RadiusController(this, x, y, points);
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
      this._radiusTRController = new RadiusController(this, x, y, points);
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
      this._radiusBRController = new RadiusController(this, x, y, points);
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
      this._radiusBLController = new RadiusController(this, x, y, points);
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
   * 刷新
   * @param options
   * @param subOptions
   */
  refresh(
    options?: RefreshOptions,
    subOptions?: { angles?: RefreshAnglesOptions },
  ): void {
    super.refresh(options, subOptions);
    this.refreshRadiusPoints();
    this.refreshRadiusControllers();
  }

  /**
   * 激活圆角控制器
   *
   * @param controller 圆角控制器
   */
  activeRadiusController(controller: IRadiusController): void {
    this.radiusControllers.forEach(
      rc => (rc.isActive = rc.id === controller.id),
    );
  }

  /**
   * 取消所有圆角控制器激活
   */
  deActiveAllRadiusController(): void {
    this.radiusControllers.forEach(rc => (rc.isActive = false));
  }

  /**
   * 获取激活的圆角控制器
   */
  getActiveRadiusController(): IRadiusController {
    return this.radiusControllers.find(rc => rc.isActive);
  }

  /**
   * 获取圆角值
   * @param value 圆角值
   */
  private _getRadius(value: number): number {
    if (value === 0) return this.minSize * 0.05;
    return value;
  }
}
