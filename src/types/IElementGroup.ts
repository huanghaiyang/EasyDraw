import IElement from "@/types/IElement";
import { CreatorTypes } from "@/types/Creator";

export interface IElementGroup extends IElement {
  // 子元素
  get subs(): IElement[];
  // 添加子元素
  addSub(sub: IElement): void;
  // 移除子元素
  removeSub(sub: IElement): void;
  // 移除子元素
  removeSubById(id: string): void;
  // 判断是否包含子元素
  hasSub(sub: IElement): boolean;
  // 判断是否包含子元素
  hasSubById(id: string): boolean;
  // 获取子元素
  getSubById(id: string): IElement;
  // 获取子元素
  getSubs(): IElement[];
  // 获取子元素
  getSubsByIds(ids: string[]): IElement[];
  // 获取子元素
  getSubElementsByType(type: CreatorTypes): IElement[];
  // 获取所有子元素
  getAllSubElements(): IElement[];
  // 获取所有子组合
  getAllSubElementGroups(): IElementGroup[];
}