import IElement from "@/types/IElement";
import IStageShield from "@/types/IStageShield";
import { CreatorTypes } from "@/types/Creator";
import { IPoint } from "@/types/index";

export type ElementGroupSubject = IElement | IElementGroup;

export type ElementGroupObject = {
  // 组合id 
  id: string;
  // 父组合id
  groupId?: string;
  // 子元素id集合
  subIds: Set<string>;
  // 宽度
  width: number;
  // 高度
  height: number;
  // 旋转角度
  angle: number;
  // 坐标
  coords: IPoint[];
}

export interface IElementGroup {
  // 组合id
  id: string;
  // 组合模型
  model: ElementGroupObject;
  // 舞台
  shield: IStageShield;
  // 是否选中
  isSelected: boolean;

  // 子元素
  get subs(): ElementGroupSubject[];
  // 中心坐标-世界坐标系
  get centerCoord(): IPoint;
  // 中心点-舞台坐标
  get centerPoint(): IPoint;

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
  // 计算坐标
  calcCoords(): IPoint[];
  // 刷新坐标
  refreshCoords(): void;
  // 计算尺寸
  calcSize(): Partial<DOMRect>;
  // 刷新尺寸
  refreshSize(): void;
  // 计算中心坐标
  calcCenterCoord(): IPoint;
  // 刷新中心坐标
  refreshCenterCoord(): void;
  // 计算中心点
  calcCenterPoint(): IPoint;
  // 刷新中心点
  refreshCenterPoint(): void;
  // 刷新
  refresh(): void;
}