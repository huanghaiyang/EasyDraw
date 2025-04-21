import IElement from "@/types/IElement";
import { CreatorTypes } from "@/types/Creator";
import { IPoint } from "@/types/index";

export interface IElementGroup extends IElement {
  // 子组件
  get subs(): IElement[];
  // 深度子组件(注意返回的组件不是按照链表前后顺序返回的)
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
  // 清除子组件
  clearSubs(): void;
  // 命中子组件
  hitSubs(point: IPoint, result?: IElement[]): IElement[];
  // 命中最顶层子组件
  hitTopASub(point: IPoint): IElement;
}
