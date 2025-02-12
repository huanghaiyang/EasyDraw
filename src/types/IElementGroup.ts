import IElement from "@/types/IElement";
import { CreatorTypes } from "@/types/Creator";

export interface IElementGroup extends IElement {
  // 子组件
  get subs(): IElement[];
  // 深度子组件
  get deepSubs(): IElement[];
  // 添加子组件
  addSub(sub: IElement): void;
  // 移除子组件
  removeSub(sub: IElement): void;
  // 移除子组件
  removeSubById(id: string): void;
  // 判断是否包含子组件
  hasSub(sub: IElement): boolean;
  // 判断是否包含子组件
  hasSubById(id: string): boolean;
  // 获取子组件
  getSubs(): IElement[];
  // 获取深度子组件
  getDeepSubs(): IElement[];
  // 获取子组件
  getSubElementsByType(type: CreatorTypes): IElement[];
  // 获取所有子组件
  getAllSubElements(): IElement[];
  // 获取所有子组合
  getAllSubElementGroups(): IElementGroup[];
}
