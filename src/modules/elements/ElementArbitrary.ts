import { ElementObject, IElementArbitrary } from "@/types/IElement";
import Element from "@/modules/elements/Element";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/IElementTransformer";
import { ElementStatus, IPoint } from "@/types";
import PolygonUtils from "@/utils/PolygonUtils";
import MathUtils from "@/utils/MathUtils";
import { some } from "lodash";

export default class ElementArbitrary extends Element implements IElementArbitrary {
  tailCoordIndex: number;

  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
  }

  get verticesTransformEnable(): boolean {
    return this.status !== ElementStatus.finished;
  }

  get boxVerticesTransformEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  /**
   * 线条绘制过程中已经绘制的点索引
   */
  get activePointIndex(): number {
    if (this.status !== ElementStatus.finished) {
      if (this.model.coords.length > this.tailCoordIndex + 1) {
        return this.tailCoordIndex + 1;
      }
      return this.tailCoordIndex;
    }
    return -1;
  }

  private _outerPaths: IPoint[][] = [];

  private _outerWorldPaths: IPoint[][] = [];

  get outerPaths(): IPoint[][] {
    return this._outerPaths;
  }

  get outerWorldPaths(): IPoint[][] {
    return this._outerWorldPaths;
  }

  constructor(model: ElementObject, shield: IStageShield) {
    super(model, shield);
    this.tailCoordIndex = -1;
  }

  /**
   * 设置组件状态
   * 
   * @param status 
   */
  protected __setStatus(status: ElementStatus): void {
    super.__setStatus(status);
    if (status === ElementStatus.finished) {
      this.tailCoordIndex = -1;
    }
  }

  /**
   * 刷新由边框线段计算出边框区域
   * 
   * @returns 
   */
  calcOuterPaths(): IPoint[][] {
    const { strokeWidth } = this.model.styles;
    const result: IPoint[][] = [];
    const strokePathPoints = this.strokePathPoints;
    strokePathPoints.forEach((current, index) => {
      if (index < strokePathPoints.length - 1) {
        const next = strokePathPoints[index + 1];
        result.push(PolygonUtils.calcBentLineOuterVertices([current, next], strokeWidth));
        if (index !== 0) {
          const prev = strokePathPoints[index - 1];
          const angle = MathUtils.calcTriangleAngle(prev, current, next);
          // 角度小于150需要计算线段连接处的斜接区域坐标
          if (angle <= 150) {
            const aAngle = (180 - angle) / 2;
            const pcAngle = MathUtils.calcAngle(prev, current);
            const side3Length = MathUtils.calcTriangleSide3By2(aAngle, strokeWidth / 2);
            const point = MathUtils.calcTargetPoint(current, side3Length, pcAngle - aAngle);
            const region: IPoint[] = [];
            region.push(current);
            region.push(MathUtils.calcTargetPoint(current, strokeWidth / 2, pcAngle - 90));
            region.push(point);
            region.push(MathUtils.calcTargetPoint(current, strokeWidth / 2, MathUtils.calcAngle(next, current) + 90));
            result.push(region);
          }
        }
      }
    })
    return result;
  }

  /**
   * 刷新由边框线段计算出世界坐标的边框区域
   * 
   * @returns 
   */
  calcOuterWorldPaths(): IPoint[][] {
    const result: IPoint[][] = [];
    return result;
  }

  /**
   * 刷新边框区域,包含舞台坐标与世界坐标区域
   */
  private refreshOuters(): void {
    this._outerPaths = this.calcOuterPaths();
    this._outerWorldPaths = this.calcOuterWorldPaths();
  }

  /**
   * 刷新组件的点坐标数据
   */
  refreshElementPoints(): void {
    super.refreshElementPoints();
    this.refreshOuters();
  }

  /**
   * 刷新边框线段点坐标数据
   */
  protected _refreshOutlinePoints(): void {
    super._refreshOutlinePoints();
    this.refreshOuters();
  }

  /**
   * 判断点是否在边框内
   * 
   * @param point 
   * @returns 
   */
  isContainsPoint(point: IPoint): boolean {
    return some(this.outerPaths, (paths) => {
      return MathUtils.isPointInPolygonByRayCasting(point, paths);
    })
  }

  /**
   * 判断给定区域是否与边框有交集
   * 
   * @param points 
   * @returns 
   */
  isPolygonOverlap(points: IPoint[]): boolean {
    return some(this.outerPaths, (paths) => {
      return MathUtils.isPolygonsOverlap(paths, points);
    })
  }
}