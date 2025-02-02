import IElement, { ElementObject } from "@/types/IElement";
import { IPoint } from "@/types/index";
import { CreatorTypes } from "@/types/Creator";
import IStageSetter from "@/types/IStageSetter";
import { IElementGroup } from "@/types/IElementGroup";

// 用于维护舞台数据关系
export default interface IStageStore extends IStageSetter {
  // 可见元素 
  get visibleElements(): IElement[];
  // 正在绘制的元素
  get creatingElements(): IElement[];
  // 临时元素
  get provisionalElements(): IElement[];
  // 选中的元素
  get selectedElements(): IElement[];
  // 高亮目标元素
  get targetElements(): IElement[];
  // 舞台元素
  get stageElements(): IElement[];
  // 非舞台元素
  get noneStageElements(): IElement[];
  // 范围元素
  get rangeElements(): IElement[];
  // 唯一选中的元素
  get uniqSelectedElement(): IElement;
  // 旋转目标元素
  get rotatingTargetElements(): IElement[];
  // 编辑元素
  get editingElements(): IElement[];
  // 是否选中元素为空
  get isSelectedEmpty(): boolean;
  // 是否高亮目标元素为空
  get isTargetEmpty(): boolean;
  // 是否范围元素为空
  get isRangeEmpty(): boolean;
  // 是否编辑元素为空
  get isEditingEmpty(): boolean;
  // 是否舞台元素为空
  get isStageEmpty(): boolean;
  // 是否非舞台元素为空
  get isNoneStageEmpty(): boolean;
  // 是否为空
  get isEmpty(): boolean;
  // 是否可见元素为空
  get isVisibleEmpty(): boolean;
  // 选中的组合
  get selectedElementGroups(): IElementGroup[];
  // 选中的根组合
  get selectedAncestorElementGroups(): IElementGroup[];
  // 选中的根元素
  get selectedAncestorElement(): IElement;

  // 创建元素数据模型
  createElementModel(type: CreatorTypes, coords: IPoint[], data?: any): ElementObject;
  // 添加元素
  addElement(element: IElement): IElement;
  // 移除元素
  removeElement(id: string): IElement;
  // 更新元素
  updateElementById(id: string, props: Partial<IElement>): IElement;
  // 批量更新元素
  updateElements(elements: IElement[], props: Partial<IElement>): IElement[];
  // 更新元素数据模型
  updateElementModel(id: string, data: Partial<ElementObject>): IElement;
  // 批量更新元素数据模型
  updateElementsModel(elements: IElement[], props: Partial<ElementObject>): void;
  // 判断元素是否存在
  hasElement(id: string): boolean;
  // 查找元素
  findElements(predicate: (node: IElement) => boolean): IElement[];
  // 获取元素
  getElementById(id: string): IElement;
  // 获取元素
  getElementsByIds(ids: string[]): IElement[];
  // 获取元素索引
  getIndexById(id: string): number;
  // 创建元素
  creatingElement(points: IPoint[]): IElement;
  // 创建任意元素
  creatingArbitraryElement(coord: IPoint, tailAppend: boolean): IElement;
  // 完成创建元素
  finishCreatingElement(): IElement;
  // 更新选中元素位置
  updateSelectedElementsMovement(offset: IPoint): void;
  // 更新选中元素旋转
  updateSelectedElementsRotation(point: IPoint): void;
  // 更新选中元素形变
  updateSelectedElementsTransform(point: IPoint): void;
  // 计算旋转元素中心
  calcRotatingStates(point: IPoint): void;
  // 清除旋转元素中心
  clearRotatingStates(): void;
  // 恢复元素原始属性
  refreshElementsOriginals(elements: IElement[], options?: { subs?: boolean, deepSubs?: boolean }): void;
  // 刷新元素位置
  refreshElementsPosition(elements: IElement[]): void;
  // 遍历元素
  forEach(callback: (element: IElement, index: number) => void): void;
  // 刷新舞台元素
  refreshStageElements(): void;
  // 刷新元素
  refreshElements(elements: IElement[]): void;
  // 创建图片元素
  createImageElement(image: HTMLImageElement | ImageData, options: Partial<ImageData>): Promise<IElement>;
  // 插入图片元素
  insertImageElement(image: HTMLImageElement | ImageData): Promise<IElement>;
  // 删除选中元素
  deleteSelects(): void;
  // 判断元素是否选中
  isElementSelected(element: IElement): boolean;
  // 检查选区是否包含目标
  isSelectedContainsTarget(): boolean;
  // 全选
  selectAll(): void;
  // 取消全选
  deSelectAll(): void;
  // 选中元素
  selectElement(element: IElement): void;
  // 取消选中元素
  deSelectElement(element: IElement): void;
  // 批量选中元素
  selectElements(elements: IElement[]): void;
  // 批量取消选中元素
  deSelectElements(elements: IElement[]): void;
  // 切换选中状态
  toggleSelectElement(element: IElement): void;
  // 批量切换选中状态
  toggleSelectElements(elements: IElement[]): void;
  // 取消高亮目标元素
  cancelTargetElements(): void;
  // 开始编辑元素
  beginEditingElements(elements: IElement[]): void;
  // 结束编辑元素
  endEditingElements(elements: IElement[]): void;
  // 获取已完成的选中元素
  getFinishedSelectedElements(isExcludeGroupSubs: boolean): IElement[];
  // 判断选中的元素是否等于正在绘制的元素
  isSelectedEqCreating(): boolean;

  // 是否存在组合
  hasElementGroup(id: string): boolean;
  // 创建组合
  createElementGroup(elements: (IElement | IElementGroup)[]): IElementGroup;
  // 删除组合
  removeElementGroup(group: IElementGroup): void;
  // 将选中的元素转换为组合
  selectToGroup(): IElementGroup;
  // 取消组合
  cancelSelectedGroups(): IElementGroup[];
  // 获取选中的根组合
  getSelectedAncestorElementGroups(): IElementGroup[];
  // 获取选中的组合
  getSelectedElementGroups(): IElementGroup[];
  // 选中组合
  selectGroup(group: IElementGroup): void;
  // 取消选中组合
  deSelectGroup(group: IElementGroup): void;
  // 取消选中组合
  deSelectGroups(groups: IElementGroup[]): void;
  // 判定给定的元素是否属于同一个组合
  isSameAncestorGroup(elements: IElement[]): boolean;
  // 获取选中的根元素
  getAncestorGroup(elements: IElement[]): IElement;
  // 获取非组合元素
  getNoParentElements(elements: IElement[]): IElement[];
}