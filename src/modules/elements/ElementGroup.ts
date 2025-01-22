import { IPoint } from "@/types";
import { CreatorTypes } from "@/types/Creator";
import IElement from "@/types/IElement";
import { ElementGroupObject, ElementGroupSubject, IElementGroup } from "@/types/IElementGroup";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import { flatten } from "lodash";

export default class ElementGroup implements IElementGroup {
  // 组合id
  id: string;
  // 组合模型
  model: ElementGroupObject;
  // 舞台
  shield: IStageShield;
  // 是否选中
  isSelected: boolean;

  // 中心坐标-世界坐标系
  private _centerCoord: IPoint;
  // 中心点-舞台坐标
  private _centerPoint: IPoint;

  // 中心坐标-世界坐标系  
  get centerCoord(): IPoint {
    return this._centerCoord;
  }

  // 中心点-舞台坐标
  get centerPoint(): IPoint {
    return this._centerPoint;
  }

  constructor(model: ElementGroupObject, shield: IStageShield) {
    this.id = CommonUtils.getRandomDateId();
    this.shield = shield;
    this.isSelected = false;
    this.model = model;
  }

  /**
   * 获取子元素
   */
  get subs(): ElementGroupSubject[] {
    return this.shield.store.getElementsByIds(Array.from(this.model.subIds));
  }

  /**
   * 添加子元素
   * 
   * @param sub 
   */
  addSub(sub: ElementGroupSubject): void {
    this.model.subIds.add(sub.id);
  }

  /**
   * 移除子元素
   * 
   * @param sub 
   */
  removeSub(sub: ElementGroupSubject): void {
    this.model.subIds.delete(sub.id);
  }

  /**
   * 移除子元素
   * 
   * @param id 
   */
  removeSubById(id: string): void {
    this.model.subIds.delete(id);
  }

  /**
   * 判断是否包含子元素
   * 
   * @param sub 
   */
  hasSub(sub: ElementGroupSubject): boolean {
    return this.model.subIds.has(sub.id);
  }

  /**
   * 判断是否包含子元素
   * 
   * @param id 
   */
  hasSubById(id: string): boolean {
    return this.model.subIds.has(id);
  }

  /**
   * 获取子元素
   * 
   * @param id 
   */
  getSubById(id: string): ElementGroupSubject {
    return this.shield.store.getElementById(id);
  }

  /**
   * 获取子元素
   * 
   * @param ids 
   */
  getSubsByIds(ids: string[]): ElementGroupSubject[] {
    return this.shield.store.getGroupElementSubjectsByIds(ids);
  }

  /**
   * 获取子元素
   */
  getSubs(): ElementGroupSubject[] {
    return this.shield.store.getGroupElementSubjectsByIds(Array.from(this.model.subIds));
  }

  /**
   * 根据类型获取子元素
   * 
   * @param type 
   */
  getSubElementsByType(type: CreatorTypes): ElementGroupSubject[] {
    return this.shield.store.getGroupElementSubjectsByIds(Array.from(this.model.subIds)).filter(sub => {
      return sub instanceof Element && (sub as IElement).model.type === type;
    });
  }

  /**
   * 获取所有子元素
   */
  getAllSubElements(): IElement[] {
    return this.shield.store.getElementsByIds(Array.from(this.model.subIds));
  }

  /**
   * 获取所有子组合
   */
  getAllSubElementGroups(): IElementGroup[] {
    return this.shield.store.getElementGroupByIds(Array.from(this.model.subIds));
  }

  /**
   * 计算中心坐标
   */
  calcCenterCoord(): IPoint {
    const elements = this.getAllSubElements();
    const coords = elements.map(element => element.position);
    return MathUtils.calcCenter(coords);
  }

  /**
   * 刷新中心坐标
   */
  refreshCenterCoord(): void {
    this._centerCoord = this.calcCenterCoord();
  }

  /**
   * 计算中心点
   */
  calcCenterPoint(): IPoint {
    return ElementUtils.calcStageRelativePoint(this._centerCoord, this.shield.stageRect, this.shield.stageWorldCoord, this.shield.stageScale);
  }

  /**
   * 刷新中心点
   */
  refreshCenterPoint(): void {
    this._centerPoint = this.calcCenterPoint();
  }

  /**
   * 计算坐标
   */
  calcCoords(): IPoint[] {
    const elements = this.getAllSubElements();
    const coords = CommonUtils.getBoxPoints(flatten(elements.map(element => element.rotateBoxCoords)));
    return coords;
  }

  /**
   * 刷新坐标
   */
  refreshCoords(): void {
    this.model.coords = this.calcCoords();
  }

  /**
   * 计算尺寸
   */
  calcSize(): Partial<DOMRect> {
    const coords = this.calcCoords();
    const { width, height } = CommonUtils.getRect(coords);
    return { width, height };
  }

  /**
   * 刷新尺寸
   */
  refreshSize(): void {
    const size = this.calcSize();
    this.model.width = size.width;
    this.model.height = size.height;
  }

  /**
   * 刷新
   */
  refresh(): void {
    this.refreshCenterCoord();
    this.refreshCenterPoint();
    this.refreshCoords();
    this.refreshSize();
  }
}