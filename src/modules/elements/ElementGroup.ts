import { CreatorTypes } from "@/types/Creator";
import IElement from "@/types/IElement";
import { IElementGroup } from "@/types/IElementGroup";
import Element from "@/modules/elements/Element";

export default class ElementGroup extends Element implements IElementGroup {
  /**
   * 获取子元素
   */
  get subs(): IElement[] {
    return this.shield.store.getElementsByIds(Array.from(this.model.subIds));
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
   * 添加子元素
   * 
   * @param sub 
   */
  addSub(sub: IElement): void {
    this.model.subIds.add(sub.id);
  }

  /**
   * 移除子元素
   * 
   * @param sub 
   */
  removeSub(sub: IElement): void {
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
  hasSub(sub: IElement): boolean {
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
  getSubById(id: string): IElement {
    return this.shield.store.getElementById(id);
  }

  /**
   * 获取子元素
   * 
   * @param ids 
   */
  getSubsByIds(ids: string[]): IElement[] {
    return this.shield.store.getGroupElementSubjectsByIds(ids);
  }

  /**
   * 获取子元素
   */
  getSubs(): IElement[] {
    return this.shield.store.getGroupElementSubjectsByIds(Array.from(this.model.subIds));
  }

  /**
   * 根据类型获取子元素
   * 
   * @param type 
   */
  getSubElementsByType(type: CreatorTypes): IElement[] {
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