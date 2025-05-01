import { CreatorTypes } from "@/types/Creator";
import IElement, { ElementObject } from "@/types/IElement";
import { IElementGroup } from "@/types/IElementGroup";
import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import LodashUtils from "@/utils/LodashUtils";
import { pick } from "lodash";
import { CommonJsonKeys } from "@/modules/elements/utils/ElementUtils";

export default class ElementGroup extends Element implements IElementGroup {
  /**
   * 获取子组件
   */
  get subs(): IElement[] {
    return this.getSubs();
  }

  /**
   * 获取深度子组件
   */
  get deepSubs(): IElement[] {
    return this.getDeepSubs();
  }

  get subIds(): string[] {
    return this.model.subIds;
  }

  get deepSubIds(): string[] {
    return this.getDeepSubIds();
  }

  get firstSub(): IElement {
    return this.shield.store.getElementById(this.subIds[0]);
  }

  get firstDeeoSub(): IElement {
    let result = this.firstSub;
    while (result.isGroup) {
      result = (result as IElementGroup).firstSub;
    }
    return result;
  }

  /**
   * 是否可以描边
   */
  get strokeEnable(): boolean {
    return false;
  }

  get strokeInputEnable(): boolean {
    return false;
  }

  /**
   * 是否可以填充
   */
  get fillEnable(): boolean {
    return false;
  }

  get fillInputEnable(): boolean {
    return false;
  }

  /**
   * 是否可以编辑
   */
  get editingEnable(): boolean {
    return false;
  }

  /**
   * 对齐外框坐标
   */
  get alignOutlineCoords(): IPoint[][] {
    return [CommonUtils.getBoxByPoints(this.subs.map(sub => sub.alignOutlineCoords.flat()).flat())];
  }

  /**
   * 添加子组件
   *
   * @param sub
   */
  addSub(sub: IElement): void {
    this.model.subIds.push(sub.id);
  }

  /**
   * 移除子组件
   *
   * @param sub
   */
  removeSub(sub: IElement): void {
    const index = this.model.subIds.indexOf(sub.id);
    if (index === -1) return;
    this.model.subIds.splice(index, 1);
  }

  /**
   * 移除子组件
   *
   * @param id
   */
  removeSubById(id: string): void {
    const index = this.model.subIds.indexOf(id);
    if (index === -1) return;
    this.model.subIds.splice(index, 1);
  }

  /**
   * 判断是否包含子组件
   *
   * @param sub
   */
  hasSub(sub: IElement): boolean {
    return this.model.subIds?.includes(sub.id);
  }

  /**
   * 判断是否包含子组件
   *
   * @param id
   */
  hasSubById(id: string): boolean {
    return this.model.subIds?.includes(id);
  }

  /**
   * 获取子组件
   */
  getSubs(): IElement[] {
    return this.shield.store.getOrderedElementsByIds(this.model.subIds);
  }

  /**
   * 获取深度子组件
   */
  getDeepSubs(): IElement[] {
    const deepSubIds = this.getDeepSubIds();
    return this.shield.store.getOrderedElementsByIds(deepSubIds);
  }

  /**
   * 获取深度子组件ID集合
   *
   * @returns
   */
  getDeepSubIds(): string[] {
    const result: string[] = [];
    this._getDeepSubIds(result, this.getSubs());
    return result;
  }

  /**
   * 获取深度子组件ID集合
   *
   * @param result
   * @param subs
   * @returns
   */
  private _getDeepSubIds(result: string[], subs: IElement[]): string[] {
    subs.forEach(sub => {
      if (sub.isGroup) {
        this._getDeepSubIds(result, (sub as ElementGroup).subs);
      }
      result.push(sub.id);
    });
    return result;
  }

  /**
   * 根据类型获取子组件
   *
   * @param type
   */
  getSubElementsByType(type: CreatorTypes): IElement[] {
    return this.getSubs().filter(sub => {
      return sub.isElement && sub.model.type === type;
    });
  }

  /**
   * 获取所有子组件
   */
  getAllSubElements(): IElement[] {
    return this.getSubs().filter(sub => sub.isElement);
  }

  /**
   * 获取所有子组合
   */
  getAllSubElementGroups(): IElementGroup[] {
    return this.getSubs().filter(sub => sub.isGroup) as IElementGroup[];
  }

  /**
   * 清除子组件
   */
  clearSubs(): void {
    this.model.subIds = [];
  }

  /**
   * 是否包含点
   *
   * @param point
   */
  isContainsCoord(coord: IPoint): boolean {
    return this.deepSubs.some(sub => sub.isContainsCoord(coord));
  }

  /**
   * 是否多边形重叠
   *
   * @param coords
   */
  isPolygonOverlap(coords: IPoint[]): boolean {
    return this.deepSubs.some(sub => sub.isPolygonOverlap(coords));
  }

  /**
   * 是否模型多边形重叠
   *
   * @param coords
   */
  isModelPolygonOverlap(coords: IPoint[]): boolean {
    return this.deepSubs.some(sub => sub.isModelPolygonOverlap(coords));
  }

  /**
   * 设置选中状态,子组件也会同步设置
   *
   * @param value
   */
  _setIsSelected(value: boolean): void {
    super._setIsSelected(value);
    this.deepSubs.forEach(sub => {
      sub.isSelected = value;
    });
  }

  /**
   * 计算旋转外框坐标
   */
  calcRotateOutlineCoords(): IPoint[][] {
    return [this._rotateCoords];
  }

  /**
   * 命中子组件,返回的结果倒序的集合
   *
   * @param point
   */
  hitSubs(point: IPoint, result?: IElement[]): IElement[] {
    const subs = this.getSubs();
    for (let i = subs.length - 1; i >= 0; i--) {
      const sub = subs[i];
      if (sub.isContainsCoord(point)) {
        result.push(sub);
        if (sub.isGroup) {
          (sub as ElementGroup).hitSubs(point, result);
        }
      }
    }
    return result;
  }

  /**
   * 命中子组件,返回的结果倒序的集合的第一个组件
   *
   * @param point
   */
  hitTopASub(point: IPoint): IElement {
    return this.hitSubs(point, []).shift();
  }

  /**
   * 通过子组件刷新组件属性，例如子组件旋转、形变、等情况下，父组件需要同时进行更新，否则会溢出
   *
   * @param subs
   */
  private _doRefreshBySubs(subs: IElement[]): void {
    // 所有子组件的点坐标集合
    const subsCoords = subs.map(sub => sub.rotateBoxCoords).flat();
    // 当前的中心点
    const centerCoord = this._originalCenterCoord;
    // 通过中心点平行于y轴的直线（已考虑角度与y轴倾斜）
    const ySlopLine = {
      start: centerCoord,
      end: {
        x: (this._originalRotateBoxCoords[0].x + this._originalRotateBoxCoords[1].x) / 2,
        y: (this._originalRotateBoxCoords[0].y + this._originalRotateBoxCoords[1].y) / 2,
      },
    };
    // 通过中心点平行于x轴的直线（已考虑角度与x轴倾斜）
    const xSlopeLine = {
      start: centerCoord,
      end: {
        x: (this._originalRotateBoxCoords[1].x + this._originalRotateBoxCoords[2].x) / 2,
        y: (this._originalRotateBoxCoords[1].y + this._originalRotateBoxCoords[2].y) / 2,
      },
    };
    // 计算包含所有子组件的最小平行四边形
    const minParallelogramPoints = MathUtils.calcMinParallelogramByPointsByCenter(subsCoords, xSlopeLine.end, ySlopLine.end, centerCoord);
    // 计算子组件的中心点
    const subsCenterCoord = MathUtils.calcPolygonCentroid(minParallelogramPoints);
    // 计算过subsCenterCoord与ySlopLine平行的直线
    const yParrelSlopeLine = MathUtils.calcParrelLine(ySlopLine, subsCenterCoord);
    // 计算过subsCenterCoord与xSlopeLine平行的直线
    const xParrelSlopeLine = MathUtils.calcParrelLine(xSlopeLine, subsCenterCoord);
    // 计算最小平行四边形的左上角
    const topLeft = minParallelogramPoints.find(
      point => !MathUtils.isPointClockwiseOfLine(point, yParrelSlopeLine.start, yParrelSlopeLine.end) && !MathUtils.isPointClockwiseOfLine(point, xParrelSlopeLine.start, xParrelSlopeLine.end),
    );
    // 计算最小平行四边形的右上角
    const topRight = minParallelogramPoints.find(
      point => MathUtils.isPointClockwiseOfLine(point, yParrelSlopeLine.start, yParrelSlopeLine.end) && !MathUtils.isPointClockwiseOfLine(point, xParrelSlopeLine.start, xParrelSlopeLine.end),
    );
    // 计算最小平行四边形的右下角
    const bottomRight = minParallelogramPoints.find(
      point => MathUtils.isPointClockwiseOfLine(point, yParrelSlopeLine.start, yParrelSlopeLine.end) && MathUtils.isPointClockwiseOfLine(point, xParrelSlopeLine.start, xParrelSlopeLine.end),
    );
    // 计算最小平行四边形的左下角
    const bottomLeft = minParallelogramPoints.find(
      point => !MathUtils.isPointClockwiseOfLine(point, yParrelSlopeLine.start, yParrelSlopeLine.end) && MathUtils.isPointClockwiseOfLine(point, xParrelSlopeLine.start, xParrelSlopeLine.end),
    );
    // 旋转倾斜后的盒模型坐标
    const rotateBoxCoords = [topLeft, topRight, bottomRight, bottomLeft];
    // 计算不旋转的盒模型坐标
    this.model.boxCoords = MathUtils.batchPrecisePoints(MathUtils.batchRotateWithCenter(rotateBoxCoords, -this.model.angle, subsCenterCoord));
    // 计算不倾斜的坐标
    this.model.coords = LodashUtils.jsonClone(this.model.boxCoords);
    // 更新中心点x值
    this.model.x = subsCenterCoord.x;
    // 更新中心点y值
    this.model.y = subsCenterCoord.y;
    // 刷新组件属性
    this.refresh(LodashUtils.toBooleanObject(["points", "rotation", "size"]));
  }

  /**
   * 通过子组件刷新组件属性，例如子组件旋转、形变、等情况下，父组件需要同时进行更新，否则会溢出
   */
  refreshBySubs(): void {
    this._doRefreshBySubs(this.deepSubs);
  }

  /**
   * 通过子组件刷新组件属性，例如子组件旋转、形变、等情况下，父组件需要同时进行更新，否则会溢出(不包含指定子组件)
   *
   * @param subIds
   */
  refreshBySubsWithout(subIds: string[]): void {
    this._doRefreshBySubs(this.deepSubs.filter(sub => !subIds.includes(sub.id)));
  }

  /**
   * 生成子组件删除数据模型
   */
  async toSubUpdatedJson(): Promise<ElementObject> {
    return JSON.parse(JSON.stringify(pick(this.model, [...CommonJsonKeys, "width", "height", "subIds"]))) as ElementObject;
  }
}
