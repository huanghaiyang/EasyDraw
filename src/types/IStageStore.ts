import IElement, { ElementModelData, ElementObject, ElementTreeNode, RefreshSubOptions } from "@/types/IElement";
import { IPoint, ShieldDispatcherNames } from "@/types/index";
import { CreatorTypes } from "@/types/Creator";
import IStageSetter from "@/types/IStageSetter";
import { IElementGroup } from "@/types/IElementGroup";
import { FontStyle } from "@/styles/ElementStyles";

// 用于维护舞台数据关系
export default interface IStageStore extends IStageSetter {
  // 可见组件
  get visibleElements(): IElement[];
  // 正在绘制的组件
  get creatingElements(): IElement[];
  // 临时组件
  get provisionalElements(): IElement[];
  // 选中的组件
  get selectedElements(): IElement[];
  // 分离选中的组件
  get detachedSelectedElements(): IElement[];
  // 高亮目标组件
  get targetElements(): IElement[];
  // 舞台组件
  get stageElements(): IElement[];
  // 范围组件
  get rangeElements(): IElement[];
  // 唯一选中的组件
  get primarySelectedElement(): IElement;
  // 旋转目标组件
  get rotatingTargetElements(): IElement[];
  // 编辑组件
  get editingElements(): IElement[];
  // 组件树节点
  get treeNodes(): ElementTreeNode[];
  // 是否选中组件为空
  get isSelectedEmpty(): boolean;
  // 是否高亮目标组件为空
  get isTargetEmpty(): boolean;
  // 是否范围组件为空
  get isRangeEmpty(): boolean;
  // 是否编辑组件为空
  get isEditingEmpty(): boolean;
  // 是否舞台组件为空
  get isStageEmpty(): boolean;
  // 是否临时组件为空
  get isProvisionalEmpty(): boolean;
  // 是否为空
  get isEmpty(): boolean;
  // 是否可见组件为空
  get isVisibleEmpty(): boolean;
  // 是否不存在正在编辑的文本组件
  get isEditingTextEmpty(): boolean;
  // 选中的根组件
  get selectedAncestorElement(): IElement;
  // 不属于任何组合的组件
  get noParentElements(): IElement[];
  // 是否多选
  get isMultiSelected(): boolean;
  // 选中的组件ID
  get selectedElementIds(): Set<string>;

  // 创建组件数据模型
  createElementModel(type: CreatorTypes, coords: IPoint[], data?: ElementModelData): Partial<ElementObject>;
  // 添加组件
  addElement(element: IElement, targetElement?: IElement, isPrepend?: boolean): IElement;
  // 根据组件数据模型添加组件
  afterAddElementByModel(model: ElementObject, targetElement?: IElement, isPrepend?: boolean): IElement;
  // 在某组件之前添加组件
  beforeAddElement(element: IElement, targetElement, isAppend?: boolean): IElement;
  // 根据组件数据模型在某组件之前添加组件
  beforeAddElementByModel(model: ElementObject, targetElement?: IElement, isPrepend?: boolean): IElement;
  // 移除组件
  removeElement(id: string): IElement;
  // 更新组件
  updateElementById(id: string, props: Partial<IElement>): IElement;
  // 批量更新组件
  updateElements(elements: IElement[], props: Partial<IElement>): IElement[];
  // 更新组件数据模型
  updateElementModel(id: string, data: Partial<ElementObject>): IElement;
  // 批量更新组件数据模型
  updateElementsModel(elements: IElement[], props: Partial<ElementObject>): void;
  // 判断组件是否存在
  hasElement(id: string): boolean;
  // 查找组件
  findElements(predicate: (node: IElement) => boolean): IElement[];
  // 获取组件
  getElementById(id: string): IElement;
  // 获取组件
  getElementsByIds(ids: string[]): IElement[];
  // 获取组件索引
  getIndexById(id: string): number;
  // 创建组件
  creatingElement(points: IPoint[]): IElement;
  // 创建任意组件
  creatingArbitraryElement(coord: IPoint, tailAppend: boolean): IElement;
  // 完成创建组件
  finishCreatingElement(): IElement;
  // 更新组件旋转
  updateElementsRotation(elements: IElement[], point: IPoint): void;
  // 更新组件形变
  updateElementsTransform(elements: IElement[], offset: IPoint): void;
  // 更新组件圆角半径
  updateElementsCorner(elements: IElement[], offset: IPoint): void;
  // 更新组件移动
  updateElementsTranslate(elements: IElement[], offset: IPoint): void;
  // 计算旋转组件中心
  refreshRotatingStates(point: IPoint): void;
  // 计算给定组件旋转状态
  refreshElementsRotationStates(elements: IElement[], point: IPoint): void;
  // 清除旋转组件中心
  clearRotatingStates(): void;
  // 恢复组件原始属性
  refreshElementsOriginals(elements: IElement[], options?: RefreshSubOptions): void;
  // 刷新组件角度
  refreshElementsOriginalAngles(elements: IElement[], options?: RefreshSubOptions): void;
  // 遍历组件
  forEach(callback: (element: IElement, index: number) => void): void;
  // 刷新舞台组件
  refreshStageElements(): void;
  // 刷新组件
  refreshElements(elements: IElement[]): void;
  // 创建图片组件的数据模型
  createImageElementModel(image: HTMLImageElement | ImageData, options: Partial<ImageData>): Promise<ElementObject>;
  // 插入图片组件
  insertImageElement(image: HTMLImageElement | ImageData): Promise<IElement>;
  // 插入文本组件
  insertTextElement(text: string, fontStyle: FontStyle, coords?: IPoint[]): IElement;
  // 删除选中组件
  deleteSelects(): void;
  // 检查选区是否包含目标
  isSelectedContainsTarget(): boolean;
  // 全选
  selectAll(): void;
  // 取消全选
  deSelectAll(): void;
  // 选中组件
  selectElement(element: IElement): void;
  // 取消选中组件
  deSelectElement(element: IElement): void;
  // 批量选中组件
  selectElements(elements: IElement[]): void;
  // 批量取消选中组件
  deSelectElements(elements: IElement[]): void;
  // 切换选中状态
  toggleSelectElement(element: IElement): void;
  // 批量切换选中状态
  toggleSelectElements(elements: IElement[]): void;
  // 取消高亮目标组件
  cancelTargetElements(): void;
  // 开始编辑组件
  beginEditingElements(elements: IElement[]): void;
  // 结束编辑组件
  endEditingElements(elements: IElement[]): void;
  // 获取已完成的选中组件
  getFinishedSelectedElements(isExcludeGroupSubs: boolean): IElement[];
  // 获取选中的组件
  getSelectedElements(isExcludeGroupSubs: boolean): IElement[];
  // 判断选中的组件是否等于正在绘制的组件
  isSelectedEqCreating(): boolean;
  // 过滤事件并发送
  filterEmit(name: ShieldDispatcherNames, element: IElement, ...args: any[]): void;
  // 是否存在组合
  hasElementGroup(id: string): boolean;
  // 创建组合
  createElementGroup(elements: (IElement | IElementGroup)[]): IElementGroup;
  // 删除组合
  removeElementGroup(group: IElementGroup): void;
  // 将选中的组件转换为组合
  selectToGroup(): IElementGroup;
  // 取消组合
  cancelGroups(groups: IElementGroup[]): void;
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
  // 复制选中的组件
  copySelectElements(): Promise<Array<ElementObject>>;
  // 粘贴组件
  pasteElements(elementsJson: Array<ElementObject>): Promise<IElement[]>;
  // 将给定组件移动到指定组件之后
  rearrangeElementAfter(element: IElement, targetElement?: IElement, isPrepend?: boolean): void;
  // 将给定组件移动到指定组件之前
  rearrangeElementBefore(element: IElement, targetElement?: IElement, isAppend?: boolean): void;
  // 重新整理下组件的顺序
  resortElementsArray(): void;
  // 发送元素层改变事件
  emitElementsLayerChanged(): void;
}
