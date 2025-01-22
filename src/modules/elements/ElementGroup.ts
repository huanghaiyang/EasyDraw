import { CreatorTypes } from "@/types/Creator";
import IElement from "@/types/IElement";
import { ElementGroupObject, ElementGroupSubject, IElementGroup } from "@/types/IElementGroup";
import IStageShield from "@/types/IStageShield";
import CommonUtils from "@/utils/CommonUtils";

export default class ElementGroup implements IElementGroup {
  id: string;
  model: ElementGroupObject;
  shield: IStageShield;

  constructor(elements: (IElement | IElementGroup)[], shield: IStageShield) {
    this.id = CommonUtils.getRandomDateId();
    this.model = {
      id: this.id,
      subIds: new Set(elements.map(element => element.id)),
    };
    this.shield = shield;
  }

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
}