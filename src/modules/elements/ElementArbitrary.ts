import { ElementObject, IElementArbitrary } from "@/types/IElement";
import Element from "@/modules/elements/Element";
import IStageShield from "@/types/IStageShield";
import { ElementStatus, IPoint } from "@/types";
import MathUtils from "@/utils/MathUtils";
import { cloneDeep, some } from "lodash";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { LineClosestMinWidth } from "@/types/constants";
import { TransformerTypes } from "@/types/ITransformer";
import CommonUtils from "@/utils/CommonUtils";
import IController from "@/types/IController";
import VerticesTransformer from "@/modules/handler/transformer/VerticesTransformer";

export default class ElementArbitrary
  extends Element
  implements IElementArbitrary
{
  // 线条绘制过程中已经绘制的点索引
  tailCoordIndex: number;
  // 编辑坐标索引
  editingCoordIndex: number;

  // 外轮廓区域
  private _outerPaths: IPoint[][][] = [];
  // 外轮廓区域（世界坐标）
  private _outerWorldPaths: IPoint[][][] = [];

  // 变换器类型
  get transformerType(): TransformerTypes {
    return TransformerTypes.circle;
  }

  // 是否启用顶点变换
  get verticesTransformEnable(): boolean {
    return this.status !== ElementStatus.finished;
  }

  // 是否启用盒模型顶点变换
  get boxVerticesTransformEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  // 是否启用边框变换
  get borderTransformEnable(): boolean {
    return this.status === ElementStatus.finished;
  }

  /**
   * 线条绘制过程中已经绘制的点索引
   */
  get activeCoordIndex(): number {
    // 如果组件处于创建状态，则返回下一个点索引
    if (
      [
        ElementStatus.startCreating,
        ElementStatus.creating,
        ElementStatus.initialed,
      ].includes(this.status)
    ) {
      // 如果坐标点索引小于坐标点数量，则返回下一个点索引
      if (this.model.coords.length > this.tailCoordIndex + 1) {
        return this.tailCoordIndex + 1;
      }
      return this.tailCoordIndex;
    }
    // 如果组件处于其他状态，则返回-1
    return -1;
  }

  // 外轮廓区域
  get outerPaths(): IPoint[][][] {
    return this._outerPaths;
  }

  // 外轮廓区域（世界坐标）
  get outerWorldPaths(): IPoint[][][] {
    return this._outerWorldPaths;
  }

  // 是否在编辑坐标时刷新变换器
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
  calcOuterPaths(): IPoint[][][] {
    return this.strokePathPoints.map((points: IPoint[], index: number) => {
      return ElementUtils.calcArbitraryBorderRegions(
        points,
        this.model.styles.strokes[index],
        this.model.isFold,
      );
    });
  }

  /**
   * 刷新由边框线段计算出世界坐标的边框区域
   *
   * @returns
   */
  calcOuterWorldPaths(): IPoint[][][] {
    return this.strokePathCoords.map((points: IPoint[], index: number) => {
      return ElementUtils.calcArbitraryBorderRegions(
        points,
        this.model.styles.strokes[index],
        this.model.isFold,
      );
    });
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
  refreshPoints(): void {
    super.refreshPoints();
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
    let outerPaths: IPoint[][][];
    if (this.visualStrokeWidth < LineClosestMinWidth) {
      outerPaths = this.strokePathPoints.map((points: IPoint[]) => {
        return ElementUtils.calcArbitraryBorderRegions(
          points,
          { width: LineClosestMinWidth / this.shield.stageScale },
          this.model.isFold,
        );
      });
    } else {
      outerPaths = this.outerPaths;
    }
    return some(outerPaths, groupPaths => {
      return some(groupPaths, paths => {
        return MathUtils.isPointInPolygonByRayCasting(point, paths);
      });
    });
  }

  /**
   * 判断给定区域是否与边框有交集
   *
   * @param points
   * @returns
   */
  isPolygonOverlap(points: IPoint[]): boolean {
    return some(this.outerPaths, groupPaths => {
      return some(groupPaths, paths => {
        return MathUtils.isPolygonsOverlap(paths, points);
      });
    });
  }

  /**
   * 判断当前组件是否与世界区块相交
   *
   * @param coords
   * @returns
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return some(this.outerWorldPaths, groupPaths => {
      return some(groupPaths, paths => {
        return MathUtils.isPolygonsOverlap(paths, coords);
      });
    });
  }

  /**
   * 计算外轮廓舞台坐标
   *
   * @returns
   */
  calcRotateOutlinePathPoints(): IPoint[][] {
    return this._outerPaths.flat();
  }

  /**
   * 计算外轮廓坐标
   *
   * @returns
   */
  calcRotateOutlinePathCoords(): IPoint[][] {
    return this._outerWorldPaths.flat();
  }

  /**
   * 激活编辑坐标
   *
   * @param index
   */
  activeEditingCoord(index: number): void {
    this.editingCoordIndex = index;
  }

  /**
   * 取消激活编辑坐标
   */
  deActiveEditingCoord(): void {
    this.editingCoordIndex = -1;
  }

  /**
   * 切换控制器激活状态
   *
   * @param controllers 控制器
   * @param isActive 激活状态
   */
  setControllersActive(controllers: IController[], isActive: boolean): void {
    super.setControllersActive(controllers, isActive);
    controllers.forEach(controller => {
      if (controller instanceof VerticesTransformer) {
        const index = this._transformers.findIndex(
          item => item.id === controller.id,
        );
        if (index === -1) return;
        if (isActive) {
          this.activeEditingCoord(index);
        } else {
          this.deActiveEditingCoord();
        }
      }
    });
  }

  /**
   * 按顶点变换
   *
   * @param offset
   * @returns
   */
  doVerticesTransform(offset: IPoint): void {
    if (this.status === ElementStatus.editing) {
      this.doEditingTransform(offset);
    } else {
      super.doVerticesTransform(offset);
    }
  }

  /**
   * 编辑模式下的变换
   *
   * @param offset
   */
  private doEditingTransform(offset: IPoint): void {
    if (this.editingCoordIndex !== -1) {
      const points = cloneDeep(this._originalRotatePathPoints);
      points[this.editingCoordIndex] = {
        x: points[this.editingCoordIndex].x + offset.x,
        y: points[this.editingCoordIndex].y + offset.y,
      };
      const lockPoint = this._originalRotateBoxPoints[0];
      this.model.coords = MathUtils.batchPrecisePoint(
        ElementUtils.calcCoordsByTransPathPoints(
          points,
          this.angles,
          lockPoint,
          this.shield.stageCalcParams,
        ),
        1,
      );
      this.model.boxCoords = MathUtils.batchPrecisePoint(
        MathUtils.batchLeanWithCenter(
          CommonUtils.getBoxPoints(
            MathUtils.calcUnLeanByPoints(
              this.model.coords,
              0,
              this.model.leanYAngle,
            ),
          ),
          0,
          this.model.leanYAngle,
          this.calcCenterCoord(),
        ),
        1,
      );
    }
  }
}
