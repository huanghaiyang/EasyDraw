import { ElementObject, IElementArbitrary } from "@/types/IElement";
import Element from "@/modules/elements/Element";
import IStageShield from "@/types/IStageShield";
import { TransformerTypes } from "@/types/IElementTransformer";
import { ElementStatus, IPoint } from "@/types";
import MathUtils from "@/utils/MathUtils";
import { flatten, some } from "lodash";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { LineClosestMinWidth } from "@/types/Constants";

export default class ElementArbitrary extends Element implements IElementArbitrary {
  tailCoordIndex: number;

  private _outerPaths: IPoint[][] = [];
  private _outerWorldPaths: IPoint[][] = [];

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
  get activeCoordIndex(): number {
    if (this.status !== ElementStatus.finished) {
      if (this.model.coords.length > this.tailCoordIndex + 1) {
        return this.tailCoordIndex + 1;
      }
      return this.tailCoordIndex;
    }
    return -1;
  }

  get outerPaths(): IPoint[][] {
    return this._outerPaths;
  }

  get outerWorldPaths(): IPoint[][] {
    return this._outerWorldPaths;
  }

  get tfRefreshAfterEdChanged(): boolean {
    return true;
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
    return ElementUtils.calcArbitraryBorderRegions(this.strokePathPoints, this.model.styles, this.model.isFold);
  }

  /**
   * 刷新由边框线段计算出世界坐标的边框区域
   * 
   * @returns 
   */
  calcOuterWorldPaths(): IPoint[][] {
    return ElementUtils.calcArbitraryBorderRegions(this.strokePathCoords, this.model.styles, this.model.isFold);
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
    this.refreshOuters();
    super._refreshOutlinePoints();
  }

  /**
   * 判断点是否在边框内
   * 
   * @param point 
   * @returns 
   */
  isContainsPoint(point: IPoint): boolean {
    let outerPaths;
    if (this.visualStrokeWidth < LineClosestMinWidth) {
      outerPaths = ElementUtils.calcArbitraryBorderRegions(this.strokePathPoints, { strokeWidth: LineClosestMinWidth / this.shield.stageScale }, this.model.isFold);
    } else {
      outerPaths = this.outerPaths;
    }
    return some(outerPaths, (paths) => {
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

  /**
   * 判断当前组件是否与世界区块相交
   * 
   * @param coords 
   * @returns 
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return some(this.outerWorldPaths, (paths) => {
      return MathUtils.isPolygonsOverlap(paths, coords);
    })
  }

  /**
   * 计算外轮廓舞台坐标
   * 
   * @returns 
   */
  calcRotateOutlinePathPoints(): IPoint[] {
    return flatten(this._outerPaths);
  }

  /**
   * 计算外轮廓坐标
   * 
   * @returns 
   */
  calcRotateOutlinePathCoords(): IPoint[] {
    return flatten(this._outerWorldPaths);
  }

}