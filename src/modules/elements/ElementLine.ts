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
import LodashUtils from "@/utils/LodashUtils";

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

  get coordTransformEnable(): boolean {
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

  get startRotateCoord(): IPoint {
    return this._rotateCoords[0];
  }

  get endRotateCoord(): IPoint {
    return this._rotateCoords[1];
  }

  private _outerCoords: IPoint[][] = [];
  private _originalOuterCoords: IPoint[][] = [];

  get outerCoords(): IPoint[][] {
    return this._outerCoords;
  }

  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
  }

  get alignOutlineCoords(): IPoint[][] {
    return this._outerCoords;
  }

  /**
   * 刷新 bent 外轮廓
   */
  private refreshBentOutline() {
    this._outerCoords = this.calcOuterCoords();
    this._maxOutlineBoxCoords = CommonUtils.getBoxByPoints(this._outerCoords.flat());
  }

  /**
   * 刷新舞台坐标
   */
  refreshPoints(): void {
    super.refreshPoints();
    this.refreshBentOutline();
  }

  /**
   * 计算外轮廓坐标
   *
   * @returns
   */
  calcOuterCoords(): IPoint[][] {
    return this.model.styles.strokes.map(stroke => {
      return PolygonUtils.calcBentLineOuterVertices(this._rotateCoords, stroke.width / 2);
    });
  }

  /**
   * 刷新轮廓坐标
   */
  refreshOutlinePoints(): void {
    super.refreshOutlinePoints();
    this.refreshBentOutline();
  }

  /**
   * 获取显示角度
   *
   * @returns
   */
  getAngle(): number {
    if (this.startRotateCoord && this.endRotateCoord) {
      return ElementUtils.fixAngle(MathUtils.calcAngle(this.startRotateCoord, this.endRotateCoord) + 90);
    }
    return 0;
  }

  /**
   * 判断点是否靠近组件
   *
   * @param point
   * @returns
   */
  isContainsCoord(coord: IPoint): boolean {
    return some(this.model.styles.strokes, stroke => {
      return MathUtils.isPointClosestSegment(coord, this.startRotateCoord, this.endRotateCoord, LineClosestMargin + stroke.width / 2 / this.shield.stageScale);
    });
  }

  /**
   * 是否与多边形相交
   *
   * @param coords
   */
  isPolygonOverlap(coords: IPoint[]): boolean {
    return some(this._outerCoords, ps => {
      return MathUtils.isPolygonsOverlap(ps, coords);
    });
  }

  /**
   * 判断直线外轮廓是否与给定的多边形相交
   *
   * @param coords
   * @returns
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return some(this._outerCoords, ps => {
      return MathUtils.isPolygonsOverlap(ps, coords);
    });
  }

  /**
   * 按顶点变换
   *
   * @param offset
   */
  doVerticesTransform(offset: IPoint): void {
    const index = this._transformers.findIndex(transformer => transformer.isActive);
    if (index !== -1) {
      const lockCoord = this._originalTransformerCoords[CommonUtils.getNextIndexOfArray(2, index, 1)];
      // 当前拖动的点的原始位置
      const currentCoordOriginal = this._originalTransformerCoords[index];
      // 根据不动点进行形变
      this.transformByLockPoint(lockCoord, currentCoordOriginal, offset, index);
    }
  }

  /**
   * 设置宽度
   *
   * @param value
   */
  setWidth(value: number): number[][] {
    const endRotateCoord = MathUtils.calcTargetPoint(this.startRotateCoord, value, this.angle - 90);
    this.model.coords = [this.startRotateCoord, endRotateCoord];
    this.model.boxCoords = CommonUtils.getBoxByPoints(this.model.coords);
    this.model.width = value;
    this.model.angle = 0;
    return [[]];
  }

  /**
   * 设置角度，注意直线的角度始终为0，属性菜单显示的角度是通过开始坐标和结束坐标计算出来的
   *
   * @param value
   */
  setAngle(value: number): void {
    const endRotateCoord = MathUtils.calcTargetPoint(this.startRotateCoord, this.model.width, value - 90);
    this.model.coords = [this.startRotateCoord, endRotateCoord];
    this.model.boxCoords = CommonUtils.getBoxByPoints(this.model.coords);
    this.model.angle = 0;
  }

  /**
   * 按比例缩放
   *
   * @param scale
   * @param center
   */
  translateBy(offset: IPoint): void {
    this._outerCoords = this._originalOuterCoords.map(coords => MathUtils.batchTranslate(coords, offset));
    super.translateBy(offset);
  }

  /**
   * 刷新原始外轮廓坐标
   */
  refreshOriginalStrokes(): void {
    super.refreshOriginalStrokes();
    this._originalOuterCoords = LodashUtils.jsonClone(this._outerCoords);
  }
}
