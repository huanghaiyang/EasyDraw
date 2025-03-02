import { CreatorTypes } from "@/types/Creator";
import IElement from "@/types/IElement";
import { IElementGroup } from "@/types/IElementGroup";
import Element from "@/modules/elements/Element";
import { IPoint } from "@/types";
import CommonUtils from "@/utils/CommonUtils";

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

  /**
   * 是否可以描边
   */
  get strokeEnable(): boolean {
    return false;
  }

  /**
   * 是否可以填充
   */
  get fillEnabled(): boolean {
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
    return [CommonUtils.getBoxPoints(this.subs.map(sub => sub.alignOutlineCoords.flat()).flat())];
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
    return this.shield.store.getElementsByIds(this.model.subIds);
  }

  /**
   * 获取深度子组件
   */
  getDeepSubs(): IElement[] {
    const result: IElement[] = [];
    this._getDeepSubs(result, this.getSubs());
    return result;
  }

  /**
   * 获取深度子组件
   *
   * @param result
   * @param subs
   */
  private _getDeepSubs(result: IElement[], subs: IElement[]): IElement[] {
    subs.forEach(sub => {
      result.push(sub);
      if (sub.isGroup) {
        this._getDeepSubs(result, (sub as ElementGroup).subs);
      }
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
}
