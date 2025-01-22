import IElement from "@/types/IElement";
import IStageShield from "@/types/IStageShield";
import { CreatorTypes } from "@/types/Creator";

export type ElementGroupSubject = IElement | IElementGroup;

export type ElementGroupObject = {
  // 组合id 
  id: string;
  // 父组合id
  groupId?: string;
  // 子元素id集合
  subIds: Set<string>;
}

export interface IElementGroup {
  // 组合id
  id: string;
  // 组合模型
  model: ElementGroupObject;
  // 舞台
  shield: IStageShield;

  // 子元素
  get subs(): ElementGroupSubject[];

  // 添加子元素
  addSub(sub: ElementGroupSubject): void;
  // 移除子元素
  removeSub(sub: ElementGroupSubject): void;
  // 移除子元素
  removeSubById(id: string): void;
  // 判断是否包含子元素
  hasSub(sub: ElementGroupSubject): boolean;
  // 判断是否包含子元素
  hasSubById(id: string): boolean;
  // 获取子元素
  getSubById(id: string): ElementGroupSubject;
  // 获取子元素
  getSubs(): ElementGroupSubject[];
  // 获取子元素
  getSubsByIds(ids: string[]): ElementGroupSubject[];
  // 获取子元素
  getSubElementsByType(type: CreatorTypes): ElementGroupSubject[];
  // 获取所有子元素
  getAllSubElements(): IElement[];
  // 获取所有子组合
  getAllSubElementGroups(): IElementGroup[];
}