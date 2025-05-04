import IElement, { ElementObject } from "@/types/IElement";
import { CreatorTypes } from "@/types/Creator";
import { IPoint } from "@/types/index";

export interface IElementGroup extends IElement {
  // 子组件
  get subs(): IElement[];
  // 深度子组件(注意返回的组件不是按照链表前后顺序返回的)
  get deepSubs(): IElement[];
  // 子组件id集合
  get subIds(): string[];
  // 深度子组件id集合
  get deepSubIds(): string[];
  // 第一个子组件
  get firstSub(): IElement;
  // 第一个子孙组件
  get firstDeeoSub(): IElement;
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
  // 获取深度子组件id集合
  getDeepSubIds(): string[];
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
  // 通过子组件刷新组件属性，例如子组件旋转、形变、等情况下，父组件需要同时进行更新，否则会溢出
  refreshBySubs(): void;
  // 通过子组件刷新组件属性，例如子组件旋转、形变、等情况下，父组件需要同时进行更新，否则会溢出(不包含指定子组件)
  refreshBySubsWithout(subIds: string[]): void;
  // 生成子组件删除数据模型
  toSubUpdatedJson(): Promise<ElementObject>;
}

// 按组合组合的子组件集合
export type GroupedElements = (IElement | IElement[])[];
