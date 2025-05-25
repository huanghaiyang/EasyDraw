import { ElementStatus, IPoint, ISize, ShieldDispatcherNames } from "@/types";
import LinkedNode, { ILinkedNode } from "@/modules/struct/LinkedNode";
import ElementUtils, { ElementListEventNames, ElementReactionPropNames } from "@/modules/elements/utils/ElementUtils";
import { every, isArray, isBoolean, isEqual, isString, pick, throttle } from "lodash";
import ElementList from "@/modules/elements/helpers/ElementList";
import CommonUtils from "@/utils/CommonUtils";
import MathUtils from "@/utils/MathUtils";
import CreatorHelper from "@/types/CreatorHelper";
import IStageStore from "@/types/IStageStore";
import IStageShield from "@/types/IStageShield";
import IElement, {
  DefaultAngleModel,
  ElementObject,
  IElementArbitrary,
  RefreshSubOptions,
  DefaultRefreshSubOptions,
  DefaultCornerModel,
  IElementRect,
  ElementModelData,
  ElementTreeNode,
  TreeNodeDropType,
} from "@/types/IElement";
import { CreatorCategories, CreatorTypes } from "@/types/Creator";
import { FontStyle, FontStyler, getDefaultElementStyle, StrokeTypes, TextCase, TextDecoration, TextVerticalAlign } from "@/styles/ElementStyles";
import LodashUtils from "@/utils/LodashUtils";
import ImageUtils from "@/utils/ImageUtils";
import ElementArbitrary from "@/modules/elements/ElementArbitrary";
import { ArbitraryPointClosestMargin } from "@/types/constants";
import { GroupedElements, IElementGroup } from "@/types/IElementGroup";
import ElementGroup from "@/modules/elements/ElementGroup";
import { observable, reaction } from "mobx";
import TextElementUtils from "@/modules/elements/utils/TextElementUtils";
import { ElementActionTypes, ElementsActionParam, ElementActionCallback } from "@/types/ICommand";
import GlobalConfig from "@/config";
import { TaskQueue } from "@/modules/render/RenderQueue";
import { QueueTask } from "@/modules/render/RenderTask";
import { ImageMargin } from "@/types/Stage";

/**
 * 调整组件层级
 *
 * @param elements 要调整层级的组件集合
 * @param isGroupInternal 组内调整
 */
interface ElementsLayerExecuteFunction {
  (elements: IElement[], isGroupInternal: boolean): void;
}

export default class StageStore implements IStageStore {
  shield: IStageShield;
  // 当前正在创建的组件id
  currentCreatingElementId: string;
  // 画板上绘制的组件列表（形状、文字、图片等）
  private _elementList: ElementList = new ElementList();
  // 组件对象映射关系，加快查询
  private _elementsMap: Map<string, IElement> = new Map<string, IElement>();
  // 当前组件类别下的最大序列号
  private _elementSerialNumberMap: Map<CreatorTypes, number> = new Map<CreatorTypes, number>([
    [CreatorTypes.group, 0],
    [CreatorTypes.arbitrary, 0],
    [CreatorTypes.rectangle, 0],
    [CreatorTypes.text, 0],
    [CreatorTypes.image, 0],
    [CreatorTypes.line, 0],
    [CreatorTypes.polygon, 0],
    [CreatorTypes.ellipse, 0],
    [CreatorTypes.pencil, 0],
  ]);
  // 临时组件
  private _provisionalElements: IElement[] = [];
  // 选中的组件
  private _selectedElements: IElement[] = [];
  // 独立组件的选中组件
  private _detachedSelectedElements: IElement[] = [];
  // 目标组件
  private _targetElements: IElement[] = [];
  // 范围组件
  private _rangeElements: IElement[] = [];
  // 可见组件
  private _visibleElements: IElement[] = [];
  // 舞台组件
  private _stageElements: IElement[] = [];
  // 编辑组件
  private _editingElements: IElement[] = [];
  // 旋转组件目标组件
  private _rotatingTargetElements: IElement[] = [];

  // 组件对象映射关系，加快查询
  private _provisionalElementIds: Set<string> = observable.set(new Set<string>());
  // 选中的组件
  private _selectedElementIds: Set<string> = observable.set(new Set<string>());
  // 独立组件的选中组件
  private _detachedSelectedElementIds: Set<string> = observable.set(new Set<string>());
  // 目标组件
  private _targetElementIds: Set<string> = observable.set(new Set<string>());
  // 可见组件
  private _visibleElementIds: Set<string> = observable.set(new Set<string>());
  // 范围组件
  private _rangeElementIds: Set<string> = observable.set(new Set<string>());
  // 舞台组件
  private _stageElementIds: Set<string> = observable.set(new Set<string>());
  // 编辑组件
  private _editingElementIds: Set<string> = observable.set(new Set<string>());
  // 旋转组件目标组件
  private _rotatingTargetElementIds: Set<string> = observable.set(new Set<string>());
  // 组件树节点
  private _treeNodes: ElementTreeNode[] = [];
  // 组件树节点映射关系，加快查询
  private _treeNodesMap: Map<string, ElementTreeNode> = new Map<string, ElementTreeNode>();
  // 旋转组件中心点
  private _rotatingCenter: IPoint;
  // 旋转组件中心点-世界坐标
  private _rotatingCenterCoord: IPoint;
  // 旋转组件原始角度
  private _rotatingOriginalAngle: number;
  // 是否多选
  private _isMultiSelected: boolean = false;
  // 未定位父组件的选中组件
  private _nonHomologousElements: IElement[] = [];
  // 选中的祖先组件
  private _selectedAncestorElement: IElement;
  // 主选中的组件
  private _primarySelectedElement: IElement;

  constructor(shield: IStageShield) {
    this.shield = shield;
    this._reactionElementAdded();
    this._reactionElementRemoved();
    this._reactionElementsPropsChanged();
    this._reactionElementsSelectionChanged();
    this.throttleRefreshTreeNodes = throttle(this.throttleRefreshTreeNodes.bind(this), 100, { leading: false, trailing: true });
  }

  // 当前最大组序列号
  get groupSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.group);
  }

  get rectSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.rectangle);
  }

  get textSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.text);
  }

  get imageSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.image);
  }

  get lineSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.line);
  }

  get ellipseSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.ellipse);
  }

  get polygonSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.polygon);
  }

  get arbitrarySerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.arbitrary);
  }

  get pencilSerialNumber(): number {
    return this._elementSerialNumberMap.get(CreatorTypes.pencil);
  }

  get selectedElementIds(): Set<string> {
    return this._selectedElementIds;
  }

  // 当前创建并更新中的组件
  get creatingElements(): IElement[] {
    const element = this._elementsMap.get(this.currentCreatingElementId);
    if (element) {
      return [element];
    }
    return [];
  }

  get isProvisionalEmpty(): boolean {
    return this._provisionalElementIds.size === 0;
  }

  // 已经渲染到舞台的组件
  get provisionalElements(): IElement[] {
    return this._provisionalElements;
  }

  // 选中的组件
  get selectedElements(): IElement[] {
    return this._selectedElements;
  }

  // 独立组件的选中组件
  get detachedSelectedElements(): IElement[] {
    return this._detachedSelectedElements;
  }

  // 命中的组件
  get targetElements(): IElement[] {
    return this._targetElements;
  }

  // 舞台上的组件
  get stageElements(): IElement[] {
    return this._stageElements;
  }

  // 选区范围内的组件
  get rangeElements(): IElement[] {
    return this._rangeElements;
  }

  // 可见的组件
  get visibleElements(): IElement[] {
    return this._visibleElements;
  }

  // 选中的根组件
  get selectedAncestorElement(): IElement {
    return this._selectedAncestorElement;
  }

  /**
   * 获取选中的主要组件
   */
  get primarySelectedElement(): IElement {
    return this._primarySelectedElement;
  }

  // 旋转目标组件
  get rotatingTargetElements(): IElement[] {
    return this._rotatingTargetElements;
  }

  // 编辑中的组件
  get editingElements(): IElement[] {
    return this._editingElements;
  }

  // 组件树节点
  get treeNodes(): ElementTreeNode[] {
    return this._treeNodes;
  }

  // 是否选中组件为空
  get isSelectedEmpty(): boolean {
    return this._selectedElementIds.size === 0;
  }

  // 是否可见组件为空
  get isVisibleEmpty(): boolean {
    return this._visibleElementIds.size === 0;
  }

  // 是否组件列表为空
  get isEmpty(): boolean {
    return this._elementList.length === 0;
  }

  // 是否处于编辑状态
  get isEditingEmpty(): boolean {
    return this._editingElementIds.size === 0;
  }

  // 是否命中组件为空
  get isTargetEmpty(): boolean {
    return this._targetElementIds.size === 0;
  }

  // 是否选区范围组件为空
  get isRangeEmpty(): boolean {
    return this._rangeElementIds.size === 0;
  }

  // 是否舞台组件为空
  get isStageEmpty(): boolean {
    return this._stageElementIds.size === 0;
  }

  // 待旋转的组件是否为空
  get isRotatingTargetEmpty(): boolean {
    return this._rotatingTargetElementIds.size === 0;
  }

  // 编辑中的文本是否为空
  get isEditingTextEmpty(): boolean {
    if (this.isEditingEmpty) return true;
    for (let key of this._editingElementIds) {
      const element = this._elementsMap.get(key);
      if (element && element.model.type === CreatorTypes.text) {
        return false;
      }
    }
    return true;
  }

  // 不属于任何组合的组件
  get nonHomologousElements(): IElement[] {
    return this._nonHomologousElements;
  }

  // 是否多选
  get isMultiSelected(): boolean {
    return this._isMultiSelected;
  }

  /**
   * 序号自增
   *
   * @param type 组件类型
   * @returns 自增后的序号
   */
  private _increaseElementSerialNumber(type: CreatorTypes): number {
    let value = this._elementSerialNumberMap.get(type);
    value++;
    this._elementSerialNumberMap.set(type, value);
    return value;
  }

  /**
   * 获取组件名称
   *
   * @param type 组件类型
   * @returns 组件名称
   */
  private _getElementName(type: CreatorTypes): string {
    return `${CreatorHelper.getCreatorByType(type).name} ${this._increaseElementSerialNumber(type)}`;
  }

  /**
   * 组件新增
   */
  private _reactionElementAdded(): void {
    this._elementList.on(ElementListEventNames.added, (node: ILinkedNode<IElement>) => {
      const element = node.value;
      Object.keys(ElementReactionPropNames).forEach(propName => {
        this._reactionElementPropsChanged(ElementReactionPropNames[propName], element, element[propName]);
      });
      this.throttleRefreshTreeNodes();
    });
  }

  /**
   * 组件删除
   */
  private _reactionElementRemoved(): void {
    this._elementList.on(ElementListEventNames.removed, (node: ILinkedNode<IElement>) => {
      const { id } = node.value;
      this._elementsMap.delete(id);
      this._selectedElementIds.delete(id);
      this._detachedSelectedElementIds.delete(id);
      this._targetElementIds.delete(id);
      this._provisionalElementIds.delete(id);
      this._rotatingTargetElementIds.delete(id);
      this._editingElementIds.delete(id);
      this._rangeElementIds.delete(id);
      this._visibleElementIds.delete(id);
      this._stageElementIds.delete(id);
      this.throttleRefreshTreeNodes();
    });
  }

  /**
   * 组件属性变化时，更新组件映射关系
   */
  private _reactionElementsPropsChanged(): void {
    Object.keys(ElementReactionPropNames).forEach(propName => {
      this._elementList.on(propName, (element, value) => {
        this._reactionElementPropsChanged(propName, element, value);
      });
    });
  }

  /**
   * 组件选中状态发生变化时，更新选中状态映射关系
   */
  private _reactionElementsSelectionChanged(): void {
    reaction(
      () => Array.from(this._selectedElementIds),
      () => {
        this._reactionSelectedElementsChanged();
        this.shield.selection.refresh();
      },
    );

    reaction(
      () => Array.from(this._detachedSelectedElementIds),
      () => {
        this._reactionDetachedSelectedElementsChanged();
        this.shield.selection.refresh();
      },
    );

    reaction(
      () => Array.from(this._targetElementIds),
      () => this._reactionTargetElementsChanged(),
    );

    reaction(
      () => Array.from(this._provisionalElementIds),
      () => this._reactionProvisionalElementsChanged(),
    );

    reaction(
      () => Array.from(this._rotatingTargetElementIds),
      () => this._reactionRotatingTargetElementsChanged(),
    );

    reaction(
      () => Array.from(this._editingElementIds),
      () => this._reactionEditingElementsChanged(),
    );

    reaction(
      () => Array.from(this._rangeElementIds),
      () => this._reactRangeElementsChanged(),
    );

    reaction(
      () => Array.from(this._visibleElementIds),
      () => this._reactionVisibleElementsChanged(),
    );

    reaction(
      () => Array.from(this._stageElementIds),
      () => this._reactionStageElementsChanged(),
    );
  }

  /**
   * 舞台选中元素发生变化
   */
  private _reactionSelectedElementsChanged(): void {
    this._selectedElements = this._filterList(this._selectedElementIds);
    this._nonHomologousElements = ElementUtils.getNonHomologousElements(this._selectedElements);
    this._isMultiSelected = this._nonHomologousElements.length > 1;
    this._selectedAncestorElement = ElementUtils.getAncestorGroup(this._selectedElements);
    this._primarySelectedElement = this._selectedAncestorElement;
    this.shield.emit(ShieldDispatcherNames.selectedChanged, this._selectedElements);
    this.shield.emit(ShieldDispatcherNames.multiSelectedChanged, this._isMultiSelected);
    this.shield.emit(ShieldDispatcherNames.primarySelectedChanged, this._primarySelectedElement);
    this.emitElementsLayerChanged();
  }

  /**
   * 判断层级是否可变动
   *
   * @param groupElements
   * @param propKey
   * @param tail
   * @returns
   */
  private _shouldLayerChange(groupElements: GroupedElements, propKey: string, tail: boolean = true): boolean {
    return groupElements.some(partElements => {
      partElements = partElements as IElement[];
      if (partElements.length && ElementList.isConsecutive(partElements.map(element => element.node))) {
        return !partElements[tail ? partElements.length - 1 : 0][propKey];
      }
      return partElements.some(element => !element[propKey]);
    });
  }

  /**
   * 舞台元素层级发生变化时，发送事件
   */
  emitElementsLayerChanged(): void {
    let shifMoveEnable: boolean = false;
    let goDownEnable: boolean = false;
    if (this._selectedElements.length) {
      const groupElements = this._divideElementsByGroup(this.selectedElements, true);
      shifMoveEnable = this._shouldLayerChange(groupElements, "isTopmost", true);
      goDownEnable = this._shouldLayerChange(groupElements, "isBottommost", false);
    }
    this.shield.emit(ShieldDispatcherNames.layerShiftMoveEnableChanged, shifMoveEnable);
    this.shield.emit(ShieldDispatcherNames.layerGoDownEnableChanged, goDownEnable);
  }

  /**
   * 独立组件选中元素发生变化
   */
  private _reactionDetachedSelectedElementsChanged(): void {
    this._detachedSelectedElements = this._filterList(this._detachedSelectedElementIds);
  }

  /**
   * 舞台元素发生变化
   */
  private _reactionTargetElementsChanged(): void {
    this._targetElements = this._filterList(this._targetElementIds);
    this.shield.emit(ShieldDispatcherNames.targetChanged, this._targetElements);
  }

  /**
   * 舞台元素发生变化
   */
  private _reactionStageElementsChanged(): void {
    this._stageElements = this._filterList(this._stageElementIds);
  }

  /**
   * 舞台可见元素发生变化
   */
  private _reactionVisibleElementsChanged(): void {
    this._visibleElements = this._filterList(this._visibleElementIds);
  }

  /**
   * 舞台范围元素发生变化
   */
  private _reactRangeElementsChanged(): void {
    this._rangeElements = this._filterList(this._rangeElementIds);
  }

  /**
   * 舞台编辑元素发生变化
   */
  private _reactionEditingElementsChanged(): void {
    this._editingElements = this._filterList(this._editingElementIds);
  }

  /**
   * 舞台旋转元素发生变化
   */
  private _reactionRotatingTargetElementsChanged(): void {
    this._rotatingTargetElements = this._filterList(this._rotatingTargetElementIds);
  }

  /**
   * 舞台 Provisional 元素发生变化
   */
  private _reactionProvisionalElementsChanged(): void {
    this._provisionalElements = this._filterList(this._provisionalElementIds);
  }

  /**
   * 重新整理组件的顺序
   */
  reactionElements(): void {
    this._reactionStageElementsChanged();
    this._reactionVisibleElementsChanged();
    this._reactionSelectedElementsChanged();
  }

  /**
   * 匹配列表
   *
   * @param set
   *
   * @param set
   * @param list
   * @returns
   */
  private _filterList(set: Set<string>): Array<IElement> {
    return this._elementList.filter(node => set.has(node.value.id)).map(node => node.value);
  }

  /**
   * 添加或删除元素
   *
   * @param set
   * @param id
   * @param value
   */
  private _setAddDelete(set: Set<string>, id: string, value: boolean): void {
    if (value) {
      set.add(id);
    } else {
      set.delete(id);
    }
  }

  /**
   * 组件属性发生变化时，更新组件映射关系
   *
   * @param propName
   * @param element
   * @param value
   */
  private _reactionElementPropsChanged(propName: string, element: IElement, value: boolean | ElementStatus | IPoint): void {
    const { id } = element;
    switch (propName) {
      case ElementReactionPropNames.isSelected: {
        this._setAddDelete(this._selectedElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isDetachedSelected: {
        this._setAddDelete(this._detachedSelectedElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isProvisional: {
        this._setAddDelete(this._provisionalElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isTarget: {
        this._setAddDelete(this._targetElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isRotatingTarget: {
        this._setAddDelete(this._rotatingTargetElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isEditing: {
        this._setAddDelete(this._editingElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isInRange: {
        this._setAddDelete(this._rangeElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isVisible: {
        this._setAddDelete(this._visibleElementIds, id, value as boolean);
        break;
      }
      case ElementReactionPropNames.isOnStage: {
        this._setAddDelete(this._stageElementIds, id, value as boolean);
        break;
      }
    }
    if (
      [
        ElementReactionPropNames.isSelected,
        ElementReactionPropNames.isDetachedSelected,
        ElementReactionPropNames.isVisible,
        ElementReactionPropNames.isOnStage,
        ElementReactionPropNames.isTarget,
        ElementReactionPropNames.isRotatingTarget,
        ElementReactionPropNames.isProvisional,
        ElementReactionPropNames.isEditing,
        ElementReactionPropNames.isInRange,
      ].includes(propName as ElementReactionPropNames)
    ) {
      const treeNode = this._treeNodesMap.get(id);
      if (treeNode) {
        this.shield.emit(ShieldDispatcherNames.treeNodePropsChanged, id, { [propName]: value });
      }
    }
  }

  /**
   * 过滤事件并发送
   *
   * @param name
   * @param element
   * @param args
   */
  filterEmit(name: ShieldDispatcherNames, element: IElement, ...args: any[]): void {
    if (!element) return;
    // 如果组件是创建中的组件或者选中的组件且组件没有组合，则发送事件
    if (element.id === this.primarySelectedElement?.id || element.id === this.currentCreatingElementId) {
      this.shield.emit(name, element, ...args);
    }
  }

  /**
   * 发送树节点变化事件
   */
  throttleRefreshTreeNodes(): void {
    this._treeNodesMap.clear();
    this._treeNodes = this._toTreeNodes();
    this.shield.emit(ShieldDispatcherNames.treeNodesChanged, this._treeNodes);
  }

  /**
   * 获取组件树节点属性
   *
   * @param element
   * @returns
   */
  private _getElementTreeNodeProps(element: IElement): Partial<IElement> {
    return pick(element, ["isSelected", "isDetachedSelected", "isVisible", "isOnStage", "isTarget", "isRotatingTarget", "isProvisional", "isEditing", "isGroup", "isInRange", "isGroupSubject"]);
  }

  /**
   * 将组件列表转换为树结构
   *
   * 注意：树结构中，节点是按照添加顺序倒序排列的
   *
   * @returns
   */
  private _toTreeNodes(): ElementTreeNode[] {
    const tree: ElementTreeNode[] = [];
    this._elementList.forEach(node => {
      const element = node.value;
      const {
        isGroupSubject,
        isGroup,
        model: { id, name, groupId, type },
      } = element;
      if (!isGroupSubject) {
        const treeNode = {
          id,
          groupId,
          type,
          label: name,
          children: [],
          ...this._getElementTreeNodeProps(element),
        };
        tree.unshift(treeNode);
        this._treeNodesMap.set(id, treeNode);
        if (isGroup) {
          const subTreeNodes = this._findGroupSubs(node, []);
          treeNode.children = subTreeNodes;
        }
      }
    });
    return tree;
  }

  /**
   * 向链表前面查找组合组件的子组件,并转换为树节点
   *
   * @param node 组合节点
   * @param result 子组件树节点数组
   * @param findedSubs 已找到的子组件id集合
   * @returns
   */
  private _findSubTreeNodesForward(node: ILinkedNode<IElement>, result: ElementTreeNode[], findedSubs: Set<string>): ElementTreeNode[] {
    const {
      value: {
        isGroup,
        model: { subIds, id },
      },
    } = node;
    if (isGroup) {
      let prevNode = node.prev;
      while (prevNode) {
        const prevElement = prevNode.value;
        const {
          isGroup: prevIsGroup,
          model: { id: prevId, groupId: prevGroupId, name, type },
        } = prevElement;
        if (subIds.includes(prevId) && prevGroupId === id) {
          const treeNode = {
            id: prevId,
            groupId: id,
            type,
            label: name,
            children: [],
            ...this._getElementTreeNodeProps(prevElement),
          };
          // 将节点插入到头部
          result.push(treeNode);
          this._treeNodesMap.set(prevId, treeNode);
          if (prevIsGroup) {
            this._findGroupSubs(prevNode, treeNode.children);
          }
          findedSubs.add(prevId);
        }
        if (LodashUtils.isSetEqual(findedSubs, new Set(subIds))) {
          break;
        }
        prevNode = prevNode.prev;
      }
    }
    return result;
  }

  /**
   * 向链表后面查找组合组件的子组件,并转换为树节点
   *
   * @param node 组合节点
   * @param result 子组件树节点数组
   * @param findedSubs 已找到的子组件id集合
   * @returns
   */
  private _findSubTreeNodesBackward(node: ILinkedNode<IElement>, result: ElementTreeNode[], findedSubs: Set<string>): ElementTreeNode[] {
    const {
      value: {
        isGroup,
        model: { subIds, id },
      },
    } = node;
    if (isGroup) {
      let nextNode = node.next;
      while (nextNode) {
        const nextElement = nextNode.value;
        const {
          isGroup: nextIsGroup,
          model: { id: nextId, groupId: nextGroupId, name, type },
        } = nextElement;
        if (subIds.includes(nextId) && nextGroupId === id) {
          const treeNode = {
            id: nextId,
            groupId: id,
            type,
            label: name,
            children: [],
            ...this._getElementTreeNodeProps(nextElement),
          };
          // 将节点插入到头部
          result.push(treeNode);
          this._treeNodesMap.set(nextId, treeNode);
          if (nextIsGroup) {
            this._findGroupSubs(nextNode, treeNode.children);
          }
        }
        findedSubs.add(nextId);
        if (LodashUtils.isSetEqual(findedSubs, new Set(subIds))) {
          break;
        }
        nextNode = nextNode.next;
      }
    }
    return result;
  }

  /**
   * 在链表中查找组合组件的子组件,并转换为树节点
   *
   * @param node
   * @param result
   * @returns
   */
  private _findGroupSubs(node: ILinkedNode<IElement>, result: ElementTreeNode[]): ElementTreeNode[] {
    const {
      value: {
        isGroup,
        model: { subIds, id },
      },
    } = node;
    if (isGroup) {
      const findedSubs: Set<string> = new Set();
      this._findSubTreeNodesForward(node, result, findedSubs);
      if (!LodashUtils.isSetEqual(findedSubs, new Set(subIds))) {
        console.warn(`组件树结构异常,组合子组件可能在组合顺序之后，当前组合id:${id}, 共找到子组件:${findedSubs.values().toArray().join(",")}`);
        this._findSubTreeNodesBackward(node, result, findedSubs);
        console.warn(`组合子组件查找完毕，当前组合id:${id}, 共找到子组件:${findedSubs.values().toArray().join(",")}`);
      }
    }
    return result;
  }

  /**
   * 判断组件是否需要更新
   *
   * @param element
   * @returns
   */
  private _shouldElementUpdate(element: IElement): boolean {
    return !element.isGroupSubject || (element.isGroupSubject && !element.group.isSelected);
  }

  /**
   * 设置组件位置
   *
   * @param elements
   * @param value
   */
  async setElementsPosition(elements: IElement[], value: IPoint): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        const { x: prevLeft, y: prevTop } = element.model;
        const { x, y } = value;
        if (prevLeft === x && prevTop === y) return;
        const offset = { x: x - prevLeft, y: y - prevTop };
        element.setPosition(x, y, offset);
        if (element.isGroup) {
          (element as IElementGroup).deepSubs.forEach(sub => {
            sub.setPosition(sub.model.x + offset.x, sub.model.y + offset.y, offset);
          });
        }
      }
    });
  }

  /**
   * 设置组件宽度
   *
   * @param elements
   * @param value
   */
  async setElementsWidth(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (element.width === value) return;
        const matrix = element.setWidth(value);
        if (element.isGroup) {
          this.scaleSubs(element, matrix);
        }
      }
    });
  }

  /**
   * 设置组件高度
   *
   * @param elements
   * @param value
   */
  async setElementsHeight(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (element.height === value) return;
        const matrix = element.setHeight(value);
        if (element.isGroup) {
          this.scaleSubs(element, matrix);
        }
      }
    });
  }

  /**
   * 缩放子组件
   *
   * @param element
   * @param matrix
   */
  private scaleSubs(element: IElement, matrix: number[][]): void {
    const { centerCoord, angle, leanYAngle } = element;
    const { scaleX, scaleY } = MathUtils.getScaleFromMatrix(matrix);
    (element as IElementGroup).deepSubs.forEach(sub => {
      sub.scaleBy(centerCoord, scaleX, scaleY, {
        angle,
        leanYAngle,
      });
    });
  }

  /**
   * 设置组件角度
   *
   * @param elements
   * @param value
   */
  async setElementsAngle(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (element.angle === value) return;
        this.rotateElements([element], value, element.angle, element.centerCoord);
        element.onRotateAfter();
        if (element.isGroup) {
          (element as IElementGroup).deepSubs.forEach(sub => sub.onRotateAfter());
        }
      }
    });
  }

  /**
   * 旋转组件
   *
   * @param elements
   * @param value
   */
  async setElementsRotate(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (!value) return;
        this.rotateElements([element], element.angle + value, element.angle, element.centerCoord);
        element.onRotateAfter();
        if (element.isGroup) {
          (element as IElementGroup).deepSubs.forEach(sub => sub.onRotateAfter());
        }
      }
    });
  }

  /**
   * 设置组件水平翻转
   */
  async setElementsFlipX(elements: IElement[]): Promise<void> {
    let flipLineStart: IPoint;
    let flipLineEnd: IPoint;
    if (this._isMultiSelected) {
      const boxCoords = CommonUtils.getBoxByPoints(elements.map(element => element.rotateBoxCoords).flat());
      flipLineStart = {
        x: (boxCoords[0].x + boxCoords[1].x) / 2,
        y: boxCoords[0].y,
      };
      flipLineEnd = {
        x: flipLineStart.x,
        y: boxCoords[3].y,
      };
    }
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (this._isMultiSelected) {
          element.flipXBy(flipLineStart, flipLineEnd);
        } else {
          [flipLineStart, flipLineEnd] = element.setFlipX();
        }
        if (element.isGroup) {
          (element as IElementGroup).deepSubs.forEach(sub => {
            sub.flipXBy(flipLineStart, flipLineEnd);
          });
        }
      }
    });
  }

  /**
   * 设置组件垂直翻转
   */
  async setElementsFlipY(elements: IElement[]): Promise<void> {
    let flipLineStart: IPoint;
    let flipLineEnd: IPoint;
    if (this._isMultiSelected) {
      const boxCoords = CommonUtils.getBoxByPoints(elements.map(element => element.rotateBoxCoords).flat());
      flipLineStart = {
        x: boxCoords[0].x,
        y: (boxCoords[0].y + boxCoords[3].y) / 2,
      };
      flipLineEnd = {
        x: boxCoords[1].x,
        y: flipLineStart.y,
      };
    }
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (this._isMultiSelected) {
          element.flipYBy(flipLineStart, flipLineEnd);
        } else {
          [flipLineStart, flipLineEnd] = element.setFlipY();
        }
        if (element.isGroup) {
          (element as IElementGroup).deepSubs.forEach(sub => {
            sub.flipYBy(flipLineStart, flipLineEnd);
          });
        }
      }
    });
  }

  /**
   * 设置组件圆角
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsCorners(elements: IElement[], value: number, index?: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (isEqual(element.corners, [value, value, value, value])) return;
        element.setCorners(value, index);
      }
    });
  }

  /**
   * 设置组件Y倾斜角度
   *
   * @param elements
   * @param value
   */
  async setElementsLeanYAngle(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id) && this._shouldElementUpdate(element)) {
        if (element.leanYAngle === value) return;
        const prevValue = element.leanYAngle;
        value = MathUtils.precise(value, 1);
        element.setLeanYAngle(value);
        if (element.isGroup) {
          const centerCoord = element.centerCoord;
          (element as IElementGroup).deepSubs.forEach(sub => {
            sub.leanYBy(value, prevValue, element.angle, centerCoord);
          });
        }
      }
    });
  }

  /**
   * 设置组件边框类型
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeType(elements: IElement[], value: StrokeTypes, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].type === value) return;
        element.setStrokeType(value, index);
      }
    });
  }

  /**
   * 设置组件边框宽度
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeWidth(elements: IElement[], value: number, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].width === value) return;
        element.setStrokeWidth(value, index);
      }
    });
  }

  /**
   * 设置组件边框颜色
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeColor(elements: IElement[], value: string, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].color === value) return;
        element.setStrokeColor(value, index);
      }
    });
  }

  /**
   * 设置组件边框颜色透明度
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsStrokeColorOpacity(elements: IElement[], value: number, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.strokes[index].colorOpacity === value) return;
        element.setStrokeColorOpacity(value, index);
      }
    });
  }

  /**
   * 添加组件描边
   *
   * @param elements
   * @param prevIndex
   */
  async addElementsStroke(elements: IElement[], prevIndex: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.addStroke(prevIndex);
      }
    });
  }

  /**
   * 删除组件描边
   *
   * @param elements
   * @param index
   */
  async removeElementsStroke(elements: IElement[], index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.removeStroke(index);
      }
    });
  }

  /**
   * 设置组件填充颜色
   *
   * @param elements
   * @param value
   * @param index
   */
  async setElementsFillColor(elements: IElement[], value: string, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.fills[index].color === value) return;
        element.setFillColor(value, index);
      }
    });
  }

  /**
   * 设置组件填充颜色透明度
   *
   * @param elements
   * @param value
   */
  async setElementsFillColorOpacity(elements: IElement[], value: number, index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.model.styles.fills[index].colorOpacity === value) return;
        element.setFillColorOpacity(value, index);
      }
    });
  }

  /**
   * 添加组件填充
   *
   * @param elements
   * @param prevIndex
   */
  async addElementsFill(elements: IElement[], prevIndex: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.addFill(prevIndex);
      }
    });
  }

  /**
   * 删除组件填充
   *
   * @param elements
   * @param index
   */
  async removeElementsFill(elements: IElement[], index: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.removeFill(index);
      }
    });
  }

  /**
   * 设置组件文本对齐方式
   *
   * @param elements
   * @param value
   */
  async setElementsTextAlign(elements: IElement[], value: CanvasTextAlign): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.textAlign === value) return;
        element.setTextAlign(value);
      }
    });
  }

  /**
   * 设置组件文本垂直对齐方式
   *
   * @param elements
   * @param value
   */
  async setElementsTextVerticalAlign(elements: IElement[], value: TextVerticalAlign): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.textVerticalAlign === value) return;
        element.setTextVerticalAlign(value);
      }
    });
  }

  /**
   * 设置组件文本基线
   *
   * @param elements
   * @param value
   */
  async setElementsTextBaseline(elements: IElement[], value: CanvasTextBaseline): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.textBaseline === value) return;
        element.setTextBaseline(value);
      }
    });
  }

  /**
   * 设置组件字体样式
   *
   * @param elements
   * @param value
   */
  async setElementsFontStyler(elements: IElement[], value: FontStyler): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFontStyler(value);
      }
    });
  }

  /**
   * 设置组件字体大小
   *
   * @param elements
   * @param value
   */
  async setElementsFontSize(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFontSize(value);
      }
    });
  }

  /**
   * 设置组件字体
   *
   * @param elements
   * @param value
   */
  async setElementsFontFamily(elements: IElement[], value: string): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFontFamily(value);
      }
    });
  }

  /**
   * 设置组件字体行高
   *
   * @param elements
   * @param value
   */
  async setElementsFontLineHeight(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.fontLineHeight === value) return;
        element.setFontLineHeight(value);
      }
    });
  }

  /**
   * 设置组件字体行高倍数
   *
   * @param elements
   * @param value
   */
  async setElementsFontLineHeightFactor(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.fontLineHeightFactor === value) return;
        element.setFontLineHeightFactor(value);
      }
    });
  }

  /**
   * 设置组件字体行高自动适应
   *
   * @param elements
   * @param value
   */
  async setElementsFontLineHeightAutoFit(elements: IElement[], value: boolean): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.fontLineHeightAutoFit === value) return;
        element.setFontLineHeightAutoFit(value);
      }
    });
  }

  /**
   * 设置组件字体颜色
   *
   * @param elements
   * @param value
   */
  async setElementsFontColor(elements: IElement[], value: string): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFontColor(value);
      }
    });
  }

  /**
   * 设置组件字体颜色透明度
   *
   * @param elements
   * @param value
   */
  async setElementsFontColorOpacity(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFontColorOpacity(value);
      }
    });
  }

  /**
   * 设置组件字间距
   *
   * @param elements
   * @param value
   */
  async setElementsFontLetterSpacing(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setFontLetterSpacing(value);
      }
    });
  }

  /**
   * 设置文本装饰
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecoration(elements: IElement[], value: TextDecoration): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setTextDecoration(value);
      }
    });
  }

  /**
   * 设置文本装饰颜色
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecorationColor(elements: IElement[], value: string): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setTextDecorationColor(value);
      }
    });
  }

  /**
   * 设置文本装饰透明度
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecorationOpacity(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setTextDecorationOpacity(value);
      }
    });
  }

  /**
   * 设置文本装饰粗细
   *
   * @param elements
   * @param value
   */
  async setElementsTextDecorationThickness(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setTextDecorationThickness(value);
      }
    });
  }

  /**
   * 锁定比例
   *
   * @param elements
   * @param value
   */
  async setElementsRatioLocked(elements: IElement[], value: boolean): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        if (element.isRatioLocked === value) return;
        element.setRatioLocked(value);
      }
    });
  }

  /**
   * 判断组件是否存在
   *
   * @param id
   * @returns
   */
  hasElement(id: string): boolean {
    return this._elementsMap.has(id);
  }

  /**
   * 通过id获取组件
   *
   * @param id
   * @returns
   */
  getElementById(id: string): IElement {
    return this._elementsMap.get(id);
  }

  /**
   * 通过id获取组件
   *
   * @param ids
   * @returns
   */
  getElementsByIds(ids: string[]): IElement[] {
    return ids.map(id => this.getElementById(id)).filter(element => element !== undefined);
  }

  /**
   * 获取组件列表（要求返回的顺序要按照链表从前的到后排序）
   *
   * @param ids
   * @returns
   */
  getOrderedElementsByIds(ids: string[]): IElement[] {
    const result: IElement[] = [];
    if (ids.length) {
      this._elementList.forEachBreak(node => {
        if (ids.includes(node.value.id)) {
          result.push(node.value);
        }
        if (result.length === ids.length) {
          return true;
        }
      });
    }
    return result;
  }

  /**
   * 获取组件ID列表（要求返回的顺序要按照链表从前的到后排序）
   *
   * @param ids
   * @returns
   */
  getOrderedElementIds(ids: string[]): string[] {
    const result: string[] = [];
    if (ids.length) {
      this._elementList.forEachBreak(node => {
        if (ids.includes(node.value.id)) {
          result.push(node.value.id);
        }
        if (result.length === ids.length) {
          return true;
        }
      });
    }
    return result;
  }

  /**
   * 获取组件在列表中的索引
   *
   * @param id
   * @returns
   */
  getIndexById(id: string): number {
    if (this.hasElement(id)) {
      this._elementList.forEachBreak(
        (node, index) => {
          if (node.value.id === id) {
            return index;
          }
        },
        node => {
          if (node.value.id === id) {
            return true;
          }
        },
      );
    }
    return -1;
  }

  /**
   * 添加组件
   *
   * @param element
   * @param targetElement
   * @param isPrepend
   */
  addElement(element: IElement, targetElement?: IElement, isPrepend?: boolean): IElement {
    const node = new LinkedNode(element);
    element.node = node;
    if (targetElement) {
      this._elementList.insertAfter(node, targetElement.node);
    } else {
      if (isPrepend) {
        this._elementList.prepend(node);
      } else {
        this._elementList.insert(node);
      }
    }
    this._elementsMap.set(element.id, element);
    return element;
  }

  /**
   * 在某组件之前添加组件
   *
   * @param element
   * @param targetElement
   * @param isAppend
   * @returns
   */
  insertBeforeElement(element: IElement, targetElement?: any, isAppend?: boolean): IElement {
    const node = new LinkedNode(element);
    element.node = node;
    if (targetElement) {
      this._elementList.insertBefore(node, targetElement.node);
    } else {
      if (isAppend) {
        this._elementList.insert(node);
      } else {
        this._elementList.prepend(node);
      }
    }
    this._elementsMap.set(element.id, element);
    return element;
  }

  /**
   * 根据组件数据模型创建组件
   *
   * @param model
   * @returns
   */
  private _createElementByModel(model: ElementObject): IElement {
    const element = ElementUtils.createElement(model, this.shield);
    Object.assign(element, { status: ElementStatus.finished, isOnStage: true, isSelected: true });
    return element;
  }

  /**
   * 根据组件数据模型添加组件
   *
   * @param model
   * @param targetElement
   * @param isPrepend
   * @returns
   */
  insertAfterElementByModel(model: ElementObject, targetElement?: IElement, isPrepend?: boolean): IElement {
    const element = this._createElementByModel(model);
    this.addElement(element, targetElement, isPrepend);
    element.refresh();
    return element;
  }

  /**
   * 根据组件数据模型在某组件之前添加组件
   *
   * @param model
   * @param targetElement
   * @param isPrepend
   * @returns
   */
  insertBeforeElementByModel(model: ElementObject, targetElement?: IElement, isPrepend?: boolean): IElement {
    const element = this._createElementByModel(model);
    this.insertBeforeElement(element, targetElement, isPrepend);
    element.refresh();
    return element;
  }

  /**
   * 删除组件
   *
   * @param id
   */
  removeElementById(id: string): IElement {
    if (this.hasElement(id)) {
      let element = this._elementsMap.get(id);
      this._elementList.removeBy(node => node.value.id === id);
      this._elementsMap.delete(id);
      element = null;
      return element;
    }
  }

  /**
   * 批量删除组件
   *
   * @param ids
   * @returns
   */
  removeElementsByIds(ids: string[]): IElement[] {
    return ids.map(id => this.removeElementById(id)).filter(element => element !== undefined);
  }

  /**
   * 删除组件
   *
   * @param element
   * @returns
   */
  removeElement(element: IElement): IElement {
    return this.removeElementById(element.id);
  }

  /**
   * 批量删除组件
   *
   * @param elements
   * @returns
   */
  removeElements(elements: IElement[]): IElement[] {
    return elements.map(element => this.removeElementById(element.id)).filter(element => element !== undefined);
  }

  /**
   * 更新组件属性
   *
   * @param id
   * @param data
   * @param isRefresh
   * @returns
   */
  updateElementById(id: string, props: Partial<IElement>): IElement {
    if (this.hasElement(id)) {
      const element = this._elementsMap.get(id);
      Object.assign(element, props);
      return element;
    }
  }

  /**
   * 批量更新组件属性
   *
   * @param elements
   * @param props
   * @returns
   */
  updateElements(elements: IElement[], props: Partial<IElement>): IElement[] {
    elements.forEach(element => {
      return this.updateElementById(element.id, props);
    });
    return elements;
  }

  /**
   * 更新组件数据
   *
   * @param id
   * @param data
   */
  updateElementModel(id: string, data: Partial<ElementObject>): IElement {
    if (this.hasElement(id)) {
      const element = this._elementsMap.get(id);
      const modelId = element.model.id;
      LodashUtils.deepPlanObjectAssign(element.model, data, { id: modelId });
      return element;
    }
  }

  /**
   * 更新组件数据
   *
   * @param elements
   * @param props
   */
  updateElementsModel(elements: IElement[], props: Partial<ElementObject>): void {
    elements.forEach(element => {
      this.updateElementModel(element.id, props);
    });
  }

  /**
   * 创建组件的数据对象
   *
   * @param type
   * @param coords
   * @param data
   * @param serialGen
   * @returns
   */
  createElementModel(type: CreatorTypes, coords: IPoint[], data?: ElementModelData, serialGen?: boolean): ElementObject {
    serialGen = isBoolean(serialGen) ? serialGen : true;
    const size: ISize = ElementUtils.calcSize({
      coords,
      boxCoords: CommonUtils.getBoxByPoints(coords),
      type,
    });
    const position: IPoint = ElementUtils.calcPosition({ type, coords });
    const model: Partial<ElementObject> = {
      ...ElementUtils.createEmptyObject(),
      type,
      coords,
      boxCoords: CommonUtils.getBoxByPoints(coords),
      data,
      width: size.width,
      height: size.height,
      name: `${CreatorHelper.getCreatorByType(type).name} ${serialGen ? this._increaseElementSerialNumber(type) : this._elementSerialNumberMap.get(type)}`,
      styles: getDefaultElementStyle(type),
      isRatioLocked: false,
      ...position,
      ...DefaultAngleModel,
      ...DefaultCornerModel,
    };
    return model as ElementObject;
  }

  /**
   * 设置组件状态为创建中
   *
   * @param element
   */
  setElementProvisionalCreatingById(id: string): void {
    this.updateElementById(id, {
      status: ElementStatus.creating,
      isOnStage: false,
      isProvisional: true,
      isSelected: true,
    });
  }

  /**
   * 创建一个临时组件
   *
   * @param model
   */
  private _createProvisionalElement(model: ElementObject): IElement {
    const element = ElementUtils.createElement(model, this.shield);
    this.currentCreatingElementId = element.id;
    this.updateElementById(element.id, {
      status: ElementStatus.startCreating,
    });
    this.addElement(element);
    return element;
  }

  /**
   * 在当前鼠标位置创建临时组件
   *
   * @param coords
   */
  creatingElement(coords: IPoint[]): IElement {
    let element: IElement;
    const { category, type } = this.shield.currentCreator;
    switch (category) {
      case CreatorCategories.shapes: {
        const model = this.createElementModel(type, ElementUtils.calcCreatorPoints(coords, type), null, !isString(this.currentCreatingElementId));
        if (this.currentCreatingElementId) {
          delete model.id;
          element = this.updateElementModel(this.currentCreatingElementId, model);
          element.model.boxCoords = CommonUtils.getBoxByPoints(element.model.coords);
          this.setElementProvisionalCreatingById(element.id);
        } else {
          element = this._createProvisionalElement(model);
        }
      }
      default:
        break;
    }
    this.selectElement(element);
    element.refresh();
    return element;
  }

  /**
   * 创建一个自由折线的组件
   *
   * @param coord
   * @param tailAppend true表示追加节点，false表示更新尾部节点
   * @returns
   */
  creatingArbitraryElement(coord: IPoint, tailAppend: boolean): IElement {
    let element: IElementArbitrary;
    let model: ElementObject;
    // 如果当前创建的组件id存在，则获取该组件
    if (this.currentCreatingElementId) {
      element = this.getElementById(this.currentCreatingElementId) as ElementArbitrary;
      model = element.model;
      // 如果tailAppend为true，则追加节点
      if (tailAppend) {
        // 判断点是否在第一个点附近
        const isClosestFirst = MathUtils.isPointClosest(coord, model.coords[0], ArbitraryPointClosestMargin / GlobalConfig.stageParams.scale);
        if (isClosestFirst) {
          if (element.tailCoordIndex > 0) {
            model.isFold = true;
          } else {
            // 最后一个点与第一个点重合，无法形成闭合图案
          }
        } else {
          model.coords.splice(model.coords.length - 1, 1, coord);
          element.tailCoordIndex = model.coords.length - 1;
        }
      } else {
        // 如果tailAppend为false，则更新尾部节点
        if (model.coords.length - element.tailCoordIndex <= 1) {
          model.coords.push(coord);
        } else {
          model.coords = [...model.coords.slice(0, element.tailCoordIndex + 1), coord];
        }
      }
      element.model.boxCoords = CommonUtils.getBoxByPoints(element.model.coords);
      this.setElementProvisionalCreatingById(element.id);
    } else {
      // 如果当前创建的组件id不存在，则创建一个新的组件
      model = this.createElementModel(CreatorTypes.arbitrary, [coord]);
      model.isFold = false;
      element = this._createProvisionalElement(model) as ElementArbitrary;
      element.tailCoordIndex = 0;
    }
    this.selectElement(element);
    element.refresh(LodashUtils.toBooleanObject(["size", "points", "position"]));
    return element;
  }

  /**
   * 完成创建自由折线组件
   *
   * @param element
   */
  private _finishArbitraryElement(element: ElementArbitrary): void {
    const tailCoordIndex = element.tailCoordIndex;
    element.tailCoordIndex = -1;
    if (element.model.coords.length > 2) {
      element.model.coords = element.model.coords.slice(0, tailCoordIndex + 1);
    }
  }

  /**
   * 完成创建组件
   */
  finishCreatingElement(): IElement {
    if (this.currentCreatingElementId) {
      let element = this.getElementById(this.currentCreatingElementId);
      if (element) {
        this.currentCreatingElementId = null;
        const {
          model: { type },
        } = element;
        switch (type) {
          case CreatorTypes.arbitrary: {
            this._finishArbitraryElement(element as ElementArbitrary);
            break;
          }
        }
        this.updateElementById(element.id, { status: ElementStatus.finished });
        element.model.boxCoords = CommonUtils.getBoxByPoints(element.model.coords);
        element.refresh();
        return element;
      }
    }
  }

  /**
   * 查找组件
   *
   * @param predicate
   * @returns
   */
  findElements(predicate: (node: IElement) => boolean): IElement[] {
    const result = [];
    this._elementList.forEach(node => {
      if (predicate(node.value)) {
        result.push(node.value);
      }
    });
    return result;
  }

  /**
   * 形变
   *
   * @param elements
   * @param offset
   */
  updateElementsTransform(elements: IElement[], offset: IPoint): void {
    elements.forEach(element => {
      // 尝试调用组件本身的transform方法，如果组件是子组件或者当前是多选状态且所有选中的组件分属不同的组合，那么transform方法将会失效
      element.transform(offset);
      // 如果当前组件是组合且组件的父组件没有被选中，那么可以遍历所有子孙组件，调用transformBy方法
      if (element.isGroup && this._shouldElementUpdate(element)) {
        (element as IElementGroup).deepSubs.forEach(sub => {
          const {
            transformLockCoord,
            transformLockIndex,
            originalTransformMoveCoord,
            transformType,
            model: { angle, leanYAngle },
          } = element;
          sub.transformBy({
            lockCoord: transformLockCoord,
            lockIndex: transformLockIndex,
            originalMovingCoord: originalTransformMoveCoord,
            offset,
            groupAngle: angle,
            groupLeanYAngle: leanYAngle,
            transformType,
          });
        });
      }
    });
  }

  /**
   * 组件圆角半径
   *
   * @param elements
   * @param offset
   */
  updateElementsCorner(elements: IElement[], offset: IPoint): void {
    elements.forEach(element => {
      (element as IElementRect).updateCornerByOffset(offset);
    });
  }

  /**
   * 组件移动
   *
   * @param elements
   * @param offset
   */
  updateElementsCoordsByOffset(elements: IElement[], offset: IPoint): void {
    elements.forEach(element => {
      element.translateBy(offset);
      !element.isOnStage && this._updateElementStageStatusIfy(element);
    });
  }

  /**
   * 遍历所有节点
   *
   * @param callback
   */
  forEach(callback: (element: IElement, index: number) => void): void {
    this._elementList.forEach((node, index) => {
      callback(node.value, index);
    });
  }

  /**
   * 刷新model坐标
   *
   * @param elements
   * @param options
   */
  refreshElementsOriginals(elements: IElement[], options?: RefreshSubOptions): void {
    this._refreshElementsByFunc(elements, element => element.refreshOriginals(), options);
  }

  /**
   * 刷新组件角度
   *
   * @param elements
   * @param func
   * @param options
   */
  refreshElementsOriginalAngles(elements: IElement[], options?: RefreshSubOptions): void {
    this._refreshElementsByFunc(elements, element => element.refreshOriginalAngle(), options);
  }

  /**
   * 刷新组件属性
   *
   * @param elements
   * @param func
   * @param options
   */
  private _refreshElementsByFunc(elements: IElement[], func: (element: IElement) => void, options?: RefreshSubOptions): void {
    options = Object.assign({}, DefaultRefreshSubOptions, options || {});

    let ids = new Set<string>();
    /**
     * 刷新单个组件
     *
     * @param element
     */
    function refreshElement(element: IElement): void {
      if (ids.has(element.id)) return;
      ids.add(element.id);
      func(element);
    }

    elements.forEach(element => {
      refreshElement(element);
      if (element.isGroup) {
        if (options.deepSubs) {
          (element as IElementGroup).deepSubs.forEach(refreshElement);
        } else if (options.subs) {
          (element as IElementGroup).subs.forEach(refreshElement);
        }
      }
    });
    ids.clear();
    ids = null;
  }

  /**
   * 更新组件舞台状态
   *
   * @param element
   */
  private _updateElementStageStatusIfy(element: IElement): void {
    const isOnStage = element.id === this.currentCreatingElementId ? false : element.isModelPolygonOverlap(this.shield.stageWordRectCoords);
    this.updateElementById(element.id, { isOnStage });
  }

  /**
   * 刷新舞台上的所有组件，超出舞台范围的组件不予展示
   */
  refreshStageElements(): void {
    // 此处有性能问题
    this._elementList.forEach(({ value: element }) => {
      this._updateElementStageStatusIfy(element);
      element.refresh(LodashUtils.toBooleanObject(["points", "rotation", "originals", "outline", "strokes"]));
    });
  }

  /**
   * 刷新组件
   *
   * @param elements
   */
  refreshElements(elements: IElement[]): void {
    elements.forEach(element => {
      element.refresh();
    });
  }

  /**
   * 检查当前鼠标命中的组件是否都已经被选中
   *
   * @returns
   */
  isSelectedContainsTarget(): boolean {
    if (this.isTargetEmpty) return false;
    // 由于mobx对set进行了代理，所以every遍历时值并不是组件id而是代理实例名称，例如'ObservableSet@2'
    return every(Array.from(this._targetElementIds), id => {
      return this._selectedElementIds.has(id as string);
    });
  }

  /**
   * 计算旋转组件的中心点
   *
   * @param point
   */
  refreshRotatingStates(point: IPoint): void {
    this.refreshElementsRotationStates(this.rotatingTargetElements, point);
  }

  /**
   * 计算给定旋转组件的中心点
   *
   * @param point
   * @param elements
   *
   * @returns
   */
  refreshElementsRotationStates(elements: IElement[], point: IPoint): void {
    const { center, centerCoord, angle } = this.calcRotatingStatesByElements(point, elements);
    this._rotatingCenter = center;
    this._rotatingCenterCoord = centerCoord;
    this._rotatingOriginalAngle = angle;
  }

  /**
   * 计算给定旋转组件的中心点
   *
   * @param point
   * @param elements
   *
   * @returns
   */
  calcRotatingStatesByElements(point: IPoint, elements: IElement[]): { center: IPoint; centerCoord: IPoint; angle: number } {
    const centerCoord = MathUtils.calcCenter(elements.map(element => element.centerCoord).flat());
    const center = ElementUtils.calcStageRelativePoint(centerCoord);
    const angle = MathUtils.precise(MathUtils.calcAngle(center, point));
    return { center, centerCoord, angle };
  }

  /**
   * 清除旋转属性
   */
  clearRotatingStates(): void {
    this._rotatingCenter = null;
    this._rotatingCenterCoord = null;
    this._rotatingOriginalAngle = null;
  }

  /**
   * 组件旋转操作
   *
   * @param elements
   * @param angle
   * @param originalAngle
   * @param centerCoord
   */
  updateElementsRotation(elements: IElement[], point: IPoint): void {
    const angle = MathUtils.precise(MathUtils.calcAngle(this._rotatingCenter, point));
    this.rotateElements(elements, angle, this._rotatingOriginalAngle, this._rotatingCenterCoord, true);
  }

  /**
   * 组件旋转操作
   *
   * @param elements
   * @param angle
   * @param originalAngle
   * @param centerCoord
   * @param rotating
   */
  rotateElements(elements: IElement[], angle: number, originalAngle: number, centerCoord: IPoint, rotating: boolean = false): void {
    elements.forEach(element => {
      const elementOriginalAngle = element.originalAngle;
      if (element.model.type !== CreatorTypes.line) {
        angle = MathUtils.constraintAngle(elementOriginalAngle + angle - originalAngle);
        angle = MathUtils.precise(angle, 1);
      }
      if (rotating) {
        element.updateAngle(angle);
      } else {
        element.setAngle(angle);
      }
      !element.isOnStage && this._updateElementStageStatusIfy(element);
      if (element.isGroup) {
        (element as IElementGroup).deepSubs.forEach(sub => {
          sub.rotateBy(angle - elementOriginalAngle, centerCoord, rotating);
          !sub.isOnStage && this._updateElementStageStatusIfy(sub);
        });
      }
    });
  }

  /**
   * 创建图片组件
   *
   * @param image
   * @param options
   * @param position
   * @returns
   */
  async createImageElementModel(image: HTMLImageElement | ImageData, options: Partial<ImageData>, position?: IPoint): Promise<ElementObject> {
    const { colorSpace } = options;
    const { width, height } = image;
    const coords = CommonUtils.getBoxByCenter(position || GlobalConfig.stageParams.worldCoord, {
      width,
      height,
    });
    const center = MathUtils.calcCenter(coords);
    const object: ElementObject = {
      ...ElementUtils.createEmptyObject(),
      coords,
      boxCoords: CommonUtils.getBoxByPoints(coords),
      type: CreatorTypes.image,
      data: image,
      name: this._getElementName(CreatorTypes.image),
      width,
      height,
      length: 0,
      styles: getDefaultElementStyle(CreatorTypes.image),
      colorSpace,
      naturalWidth: width,
      naturalHeight: height,
      isRatioLocked: true,
      ...center,
      ...DefaultCornerModel,
    } as ElementObject;
    return object;
  }

  /**
   * 插入图片
   * 
   * @param image 
   * @param position
   * @returns 
   */
  async _insertImage(image:  (HTMLImageElement & { colorSpace: PredefinedColorSpace }), position: IPoint): Promise<IElement> {
    let colorSpace = image.colorSpace;
    const model = await this.createImageElementModel(image, { colorSpace: colorSpace }, position);
    return this.insertAfterElementByModel(model);
  }

  /**
   * 创建并插入图片组件
   *
   * @param images
   * @param position
   * @returns IElement[] 返回插入的组件列表
   */
  async insertImageElements(images: (HTMLImageElement[] | ImageData[]), position?: IPoint): Promise<IElement[]> {
    const result: IElement[] = [];
    images = await ImageUtils.convertImages(images);
    const placed = CommonUtils.packRectangles(images.map(image => ({ width: image.width, height: image.height })), position || GlobalConfig.stageParams.worldCoord, ImageMargin);
    await new Promise((resolve) => {
      let taskQueue = new TaskQueue();
      images.forEach((img, index) => {
        taskQueue.add(
          new QueueTask(async () => {
            const element = await this._insertImage(img as (HTMLImageElement & { colorSpace: PredefinedColorSpace }), placed[index]);
            result.push(element);
            if (index === images.length - 1) {
              resolve(null);
              await taskQueue.destroy();
              taskQueue = null;
            }
          }),
        );
      });
    });
    return result;
  }

  /**
   * 创建并插入文本组件
   *
   * @param text
   * @param fontStyle
   * @param coords
   */
  insertTextElement(text: string, fontStyle: FontStyle, coords?: IPoint[]): IElement {
    const textData = TextElementUtils.createTextData(text, fontStyle);
    const model = this.createElementModel(CreatorTypes.text, coords, textData);
    return this.insertAfterElementByModel(model);
  }

  /**
   * 删除选中组件
   */
  deleteSelects(): void {
    this.selectedElements.forEach(element => {
      this.removeElementById(element.id);
    });
  }

  /**
   * 选中组件
   *
   * @param element
   */
  selectElement(element: IElement): void {
    this.updateElementById(element.id, { isSelected: true });
  }

  /**
   * 取消选中组件
   *
   * @param element
   */
  deSelectElement(element: IElement): void {
    this.updateElementById(element.id, { isSelected: false });
  }

  /**
   * 批量选中组件
   *
   * @param elements
   */
  selectElements(elements: IElement[]): void {
    elements.forEach(element => {
      this.selectElement(element);
    });
  }

  /**
   * 批量取消选中组件
   *
   * @param elements
   */
  deSelectElements(elements: IElement[]): void {
    elements.forEach(element => {
      this.deSelectElement(element);
    });
  }

  /**
   * 切换选中状态
   *
   * @param element
   */
  toggleSelectElement(element: IElement): void {
    if (element.isSelected) {
      this.deSelectElement(element);
    } else {
      this.selectElement(element);
    }
  }

  /**
   * 批量切换选中状态
   *
   * @param elements
   */
  toggleSelectElements(elements: IElement[]): void {
    elements.forEach(element => {
      this.toggleSelectElement(element);
    });
  }

  /**
   * 全选
   */
  selectAll(): void {
    this._elementList.forEachRevert(node => {
      // 前置逻辑是，父组件选中状态变化，子组件一定会变化，此处减少子组件的重复选中操作
      if (!node.value.isGroupSubject) {
        this.selectElement(node.value);
      }
    });
  }

  /**
   * 取消全选
   */
  deSelectAll(): void {
    this._elementList.forEach(node => {
      // 前置逻辑是，父组件选中状态变化，子组件一定会变化，此处减少子组件的重复选中操作
      if (!node.value.isGroupSubject) {
        this.deSelectElement(node.value);
      }
    });
  }
  /**
   * 取消高亮目标组件
   */
  cancelTargetElements(): void {
    this.targetElements.forEach(element => {
      this.updateElementById(element.id, { isTarget: false });
    });
  }
  /**
   * 开始编辑组件
   *
   * @param elements
   */
  beginEditingElements(elements: IElement[]): void {
    this._setElementsEditing(elements, true);
  }

  /**
   * 结束编辑组件
   *
   * @param elements
   */
  endEditingElements(elements: IElement[]): void {
    this._setElementsEditing(elements, false);
  }

  /**
   * 获取已完成的选中组件
   *
   * @returns
   */
  getFinishedSelectedElements(isExcludeGroupSubs: boolean): IElement[] {
    return this.selectedElements.filter(element => element.status === ElementStatus.finished && (isExcludeGroupSubs ? !element.isGroupSubject : true));
  }

  /**
   * 获取选中的组件
   *
   * @returns
   */
  getSelectedElements(isExcludeGroupSubs: boolean): IElement[] {
    return this.selectedElements.filter(element => (isExcludeGroupSubs ? !element.isGroupSubject : true));
  }

  /**
   * 设置组件编辑状态
   *
   * @param elements
   * @param value
   */
  private _setElementsEditing(elements: IElement[], value: boolean): void {
    elements.forEach(element => {
      if (element.editingEnable) {
        if (value !== element.isEditing) {
          this.updateElementById(element.id, {
            isEditing: value,
            status: value ? ElementStatus.editing : ElementStatus.finished,
          });
          if (element.tfRefreshAfterEdChanged) {
            element.refresh();
          }
        }
      }
    });
  }

  /**
   * 判断选中的组件是否等于正在绘制的组件
   *
   * @returns
   */
  isSelectedEqCreating(): boolean {
    const selectedIds = new Set(this.selectedElements.map(element => element.id));
    const creatingIds = new Set(this.creatingElements.map(element => element.id));
    return isEqual(selectedIds, creatingIds);
  }

  /**
   * 绑定组件组合
   *
   * @param group
   */
  private _bindElementsGroup(group: IElementGroup): void {
    group.subs.forEach(element => {
      this.updateElementModel(element.id, { groupId: group.id });
    });
  }

  /**
   * 取消组件组合
   *
   * @param group
   */
  private _unbindElementsGroup(group: IElementGroup): void {
    this.updateElementsModel(group.getSubs(), { groupId: undefined });
    this.updateElementModel(group.id, { subIds: [] });
  }

  /**
   * 创建组合的数据对象
   *
   * @param elements
   */
  private _createElementGroupObject(elements: (IElement | IElementGroup)[]): ElementObject {
    // 获取组合组件的子组件id
    const subIds = elements.map(element => element.id);
    // 获取组合组件的坐标
    const coords = CommonUtils.getBoxByPoints(elements.map(element => element.rotateCoords).flat());
    // 获取组合组件的宽高
    const { width, height, x, y } = CommonUtils.getRect(coords);
    // 返回组合组件的数据对象
    return {
      ...ElementUtils.createEmptyGroupObject(),
      name: this._getElementName(CreatorTypes.group),
      subIds,
      coords,
      boxCoords: CommonUtils.getBoxByPoints(coords),
      width,
      height,
      x: x + width / 2,
      y: y + height / 2,
    } as ElementObject;
  }

  /**
   * 删除组合
   *
   * @param group
   */
  removeElementGroup(group: IElementGroup): void {
    if (this.hasElement(group.id)) {
      // 取消绑定组合组件的子组件
      this._unbindElementsGroup(group);
      // 取消选中组合
      this.deSelectElement(group);
      // 删除组合组件
      this.removeElementById(group.id);
    }
  }

  /**
   * 插入组合
   *
   * @param group
   * @param targetElement
   */
  private _insertNewGroup(group: IElementGroup, targetElement: IElement): void {
    // 绑定组合组件的子组件
    this._bindElementsGroup(group);
    // 添加组合组件
    this.addElement(group, targetElement);
    // 设置组合组件状态
    this.updateElementById(group.id, {
      status: ElementStatus.finished,
      isOnStage: true,
    });
    // 刷新组合组件
    group.refresh();
  }

  /**
   * 计算移动组件位置时，受影响的组件
   *
   * @param elements
   * @param targetElementGroup
   * @param targetElementGroupAncestors
   * @returns
   */
  private _calcEffectedElementsOfMoved(
    elements: IElement[],
    targetElementGroup?: IElementGroup,
  ): {
    actionParams: ElementsActionParam[];
    removedGroups: IElementGroup[];
    updatedGroups: IElementGroup[];
    outerLayerIdSet: Set<string>;
    elementIdSet: Set<string>;
    updatedGroupIdSet: Set<string>;
    removedGroupIdSet: Set<string>;
  } {
    // 目标组合的所有祖先节点
    const targetElementGroupAncestors = targetElementGroup?.ancestorGroups || [];
    // 组件id集合
    const elementIdSet: Set<string> = new Set(elements.map(element => element.id));
    // 需要删除或者更新的组合
    const groupIdSet: Set<string> = new Set();
    // 需要删除的组合id集合，用于后续删除组合
    const removedGroupIdSet: Set<string> = new Set();
    // 需要更新的组合id集合，用于后续更新组合
    const updatedGroupIdSet: Set<string> = new Set();
    // 外层组件id集合
    const outerLayerIdSet: Set<string> = new Set();
    // 组件移动参数
    const movedActionParams: ElementsActionParam[] = [];
    // 组合更新或者删除参数
    const groupActionParams: ElementsActionParam[] = [];
    // 找到需要删除或者更新的组合
    elements.forEach(element => {
      if (element.isGroupSubject) {
        const groupId = element.model.groupId;
        if (!elementIdSet.has(groupId)) {
          groupIdSet.add(groupId);
          outerLayerIdSet.add(element.id);
        }
      } else {
        outerLayerIdSet.add(element.id);
      }
      // 标记需要移动位置的组件
      movedActionParams.push({
        type: ElementActionTypes.Moved,
        data: [element],
      });
    });
    // 获取排序后的组合集合
    const groups: IElement[] = this.getOrderedElementsByIds(Array.from(groupIdSet));
    // 判断是否需要删除组合
    function groupShouldRemove(group: IElementGroup): boolean {
      const subIds = group.model.subIds;
      // 如果组合内的所有子组件都在给定的组件集合内，则需要删除组合
      return (
        subIds.every(id => elementIdSet.has(id) || subIds.every(id => removedGroupIdSet.has(id))) &&
        group.id !== targetElementGroup?.id &&
        targetElementGroupAncestors?.findIndex(ancestor => ancestor.id === group.id) === -1
      );
    }
    // 找到需要删除或者更新的组合
    groups.forEach(group => {
      // 如果组合内的所有子组件都在给定的组件集合内，则需要删除组合
      if (groupShouldRemove(group as IElementGroup)) {
        removedGroupIdSet.add(group.id);
      } else {
        updatedGroupIdSet.add(group.id);
      }
      // 找到组合的祖先组件，判断是否需要删除或者更新
      let ancestor = group.group;
      while (ancestor) {
        if (groupShouldRemove(ancestor)) {
          removedGroupIdSet.add(ancestor.id);
        } else {
          updatedGroupIdSet.add(ancestor.id);
        }
        ancestor = ancestor.group;
      }
    });

    // 获取需要删除的组合
    const removedGroups = this.getOrderedElementsByIds(Array.from(removedGroupIdSet)) as IElementGroup[];
    removedGroups.forEach(group => {
      groupActionParams.push({
        type: ElementActionTypes.Removed,
        data: [group],
      });
    });
    // 获取需要更新的组合
    const updatedGroups = this.getOrderedElementsByIds(Array.from([...updatedGroupIdSet, ...(targetElementGroupAncestors?.map(group => group.id).flat() || [])])) as IElementGroup[];
    updatedGroups.forEach(group => {
      groupActionParams.push({
        type: ElementActionTypes.GroupUpdated,
        data: [group],
      });
    });
    // redo操作时，优先处理组合的更新和删除操作，因为组合的更新和删除操作会影响到组合内的子组件的位置
    const actionParams: ElementsActionParam[] = [...groupActionParams, ...movedActionParams];
    return {
      actionParams,
      removedGroups,
      updatedGroups,
      outerLayerIdSet,
      elementIdSet,
      updatedGroupIdSet,
      removedGroupIdSet,
    };
  }

  /**
   * 处理移动组件位置时，受影响的组件
   *
   * @param removedGroups
   * @param updatedGroups
   * @param elementIdSet
   * @param removedGroupIdSet
   */
  private _processEffectedElementGroups({
    removedGroups,
    updatedGroups,
    excludeElementIdSet,
    excludeGroupIdSet,
  }: {
    removedGroups?: IElementGroup[];
    updatedGroups?: IElementGroup[];
    excludeElementIdSet?: Set<string>;
    excludeGroupIdSet?: Set<string>;
  }): void {
    // 移除需要删除的组合
    removedGroups?.forEach(rGroup => {
      this.removeElement(rGroup);
    });
    // 更新需要更新的组合
    updatedGroups?.forEach(uGroup => {
      // 计算组合的子组件id集合
      const subIds = uGroup.model.subIds.filter(id => !excludeElementIdSet?.has(id) && !excludeGroupIdSet?.has(id));
      // 更新组合的子组件id集合
      this.updateElementModel(uGroup.id, { subIds });
      // 因为组合内的子组件发生变化，需要刷新组合的尺寸和位置
      (uGroup as IElementGroup).refreshBySubs();
      uGroup.refreshOriginals();
    });
  }

  /**
   * 将选中的组件转换为组合
   *
   * 处理组件的流程如下：
   *
   * 1. 将被选中的组件移动到被选中的层级最高的组件之前
   * 2. 查找需要删除和更新的组合
   * 3. 在层级最高的组件后插入新的组合
   * 4. 删除或者更新需要删除和更新的组合
   *
   * @param elements
   */
  async createElementGroup(elements: IElement[], undoActionCallback: ElementActionCallback, redoActionCallback: ElementActionCallback): Promise<IElementGroup> {
    if (elements.length < 1) return;
    // 对给定的组件所属的链表节点进行重新排序
    const sortedElements = this.sortElements(elements);
    // 找到给定组件的层级最高的组件，我们将要把组合组件插入到这个组件之后
    const targetElement = sortedElements[sortedElements.length - 1];
    // 目标组件所属的组合
    const targetElementGroup = targetElement.group;
    // 目标组件在目标组件所属的组合中的索引
    let targetIndexOfGroupSubs = -1;
    // 计算目标组件在目标组件所属的组合中的索引
    targetIndexOfGroupSubs = targetElementGroup?.model.subIds.indexOf(targetElement.id);
    // 计算移动组件位置时，受影响的组件
    const { actionParams, removedGroups, updatedGroups, outerLayerIdSet, elementIdSet, removedGroupIdSet } = this._calcEffectedElementsOfMoved(sortedElements, targetElementGroup);
    // 顶层组合集合
    const outerLayerElements: IElement[] = this.getOrderedElementsByIds(Array.from(outerLayerIdSet));
    await undoActionCallback(actionParams);
    // 创建组合组件
    const nGroup = new ElementGroup(this._createElementGroupObject(outerLayerElements), this.shield);
    // 将前n-1个组件从链表中删除
    const removedNodes = this._removeNodesByElements(sortedElements.slice(0, sortedElements.length - 1));
    // 将removeNodes移动到targetElement之前
    removedNodes.forEach(node => {
      // 插入到targetElement之前
      this._elementList.insertBefore(node, targetElement.node, false);
      // 这里只更新非子组件的groupId
      if (outerLayerIdSet.has(node.value.id)) {
        // 更新组件的groupId
        this.updateElementModel(node.value.id, { groupId: nGroup.id });
      }
    });
    // 如果目标组合存在，则需要维护目标组合与新建组合的父子关系
    if (targetElementGroup) {
      // 原始的目标组合的子组件id集合
      const subIds = [...targetElementGroup.model.subIds];
      // 将目标组件id替换为新建组合的id
      subIds.splice(targetIndexOfGroupSubs, 1, nGroup.id);
      // 更新目标组合的子组件id集合
      this.updateElementModel(targetElementGroup.id, { subIds });
      // 更新新建组合的groupId
      nGroup.model.groupId = targetElementGroup.id;
    }
    // 将新建组合插入到targetElement之后
    this._insertNewGroup(nGroup, targetElement);
    const groupAddedParams: ElementsActionParam = {
      type: ElementActionTypes.Added,
      data: [nGroup],
    };
    await undoActionCallback([groupAddedParams]);
    // 组合添加之前的回调函数的参数
    actionParams.push(groupAddedParams);
    this._processEffectedElementGroups({ removedGroups, updatedGroups, excludeElementIdSet: elementIdSet, excludeGroupIdSet: removedGroupIdSet });
    await redoActionCallback(actionParams);
  }

  /**
   * 取消组合
   */
  cancelGroups(groups: IElementGroup[]): void {
    groups.forEach(group => {
      this.removeElementGroup(group);
    });
  }

  /**
   * 获取选中的组合
   */
  getSelectedElementGroups(): IElementGroup[] {
    return this.selectedElements.filter(element => element.model.type === CreatorTypes.group) as IElementGroup[];
  }

  /**
   * 获取选中的根组合
   */
  getSelectedAncestorElementGroups(): IElementGroup[] {
    return ElementUtils.getNonHomologousElements(this.getSelectedElementGroups()) as IElementGroup[];
  }

  /**
   * 对给定的组件列表进行排序
   *
   * @param elements 组件列表
   * @returns 排序后的组件列表
   */
  sortElements(elements: IElement[]): IElement[] {
    const ids = elements.map(element => element.id);
    return this.getElementsByIds(ids);
  }

  /**
   * 复制组件
   */
  async copySelectElements(): Promise<Array<ElementObject>> {
    return Promise.all(this.selectedElements.map(async element => await element.toJson()));
  }

  /**
   * 粘贴组件
   *
   * @param elementsJson
   * @param undoActionCallback
   * @param redoActionCallback
   * @returns
   */
  async pasteElements(elementsJson: Array<ElementObject>, undoActionCallback: ElementActionCallback, redoActionCallback: ElementActionCallback): Promise<IElement[]> {
    // 原始的组件id集合，用以判断目标组合是否包含在原始组件集合内
    const outerLevelElementIds: Set<string> = ElementUtils.calcOuterLayerElementIds(elementsJson);
    // 被选中组件中的最高层级组件
    let topLevelSelectedElement = this.selectedElements[this.selectedElements.length - 1];
    // 默认允许直接将内容插入到目标组合内部
    let groupIn: boolean = !outerLevelElementIds.has(topLevelSelectedElement?.id || "");
    // 目标组件的节点，新的组件将插入到这个组件之后
    let targetElement: IElement | null = null;
    // 目标组合的id
    let targetGroupId: string | undefined = undefined;
    // 目标组合
    let targetGroup: IElementGroup | undefined = undefined;
    // 目标组合的子组件id集合
    let targetSubIds: string[] = [];
    // 目标组件在目标组合中的索引
    let targetIndexOfGroupSubs = -1;
    if (topLevelSelectedElement) {
      // 如果被选中组件中存在组合，则将新的组件插入到这个组合的最后一个节点之后
      if (topLevelSelectedElement.isGroup && groupIn) {
        targetGroupId = topLevelSelectedElement.id;
        targetSubIds = topLevelSelectedElement.model.subIds;
        targetElement = this._elementsMap.get(targetSubIds[targetSubIds.length - 1]);
      } else {
        // targetElement可能是组件也可能是组合
        targetElement = topLevelSelectedElement;
        if (targetElement.isGroupSubject) {
          targetGroupId = targetElement.model.groupId;
          targetSubIds = this._elementsMap.get(targetGroupId)?.model.subIds || [];
          targetIndexOfGroupSubs = targetSubIds.indexOf(targetElement.id);
        }
      }
    }
    const actionParams: ElementsActionParam[] = [];
    const result: IElement[] = [];
    const models = ElementUtils.convertElementsJson(elementsJson);
    const groupModelIds: Set<string> = new Set();
    models.forEach(model => {
      if (model.type === CreatorTypes.group) {
        groupModelIds.add(model.id);
      }
    });
    let newSubIds: string[] = [];
    for (const model of models) {
      await ElementUtils.convertElementModel(model);
      model.name = this._getElementName(model.type);
      if (!groupModelIds.has(model.groupId)) {
        model.groupId = targetGroupId;
        newSubIds.push(model.id);
      }
      const element = this.insertAfterElementByModel(model, targetElement);
      actionParams.push({
        type: ElementActionTypes.Added,
        data: [element],
      });
      result.push(element);
      targetElement = element;
    }
    if (targetGroupId) {
      actionParams.push({
        type: ElementActionTypes.GroupUpdated,
        data: [this.getElementById(targetGroupId)],
      });
      targetGroup = this.getElementById(targetGroupId) as IElementGroup;
    }
    await undoActionCallback(actionParams);
    if (targetGroup) {
      if (targetIndexOfGroupSubs > -1) {
        targetSubIds.splice(targetIndexOfGroupSubs + 1, 0, ...newSubIds);
      } else {
        targetSubIds.push(...newSubIds);
      }
      this.updateElementModel(targetGroupId, { subIds: targetSubIds });
      targetGroup.refreshBySubs();
      targetGroup.refreshOriginals();
    }
    await redoActionCallback(actionParams);
    return result;
  }

  /**
   * 移动组件
   *
   * @param element
   * @param targetElement
   * @param isPrepend
   */
  moveElementAfter(element: IElement, targetElement?: IElement, isPrepend?: boolean): void {
    const { node } = element;
    this._elementList.remove(node, false);
    if (targetElement) {
      this._elementList.insertAfter(node, targetElement.node, false);
    } else {
      if (isPrepend) {
        this._elementList.prepend(node, false);
      } else {
        this._elementList.insert(node, false);
      }
    }
  }

  /**
   * 移动组件
   *
   * @param element
   * @param targetElement
   * @param isAppend
   */
  moveElementBefore(element: IElement, targetElement?: IElement, isAppend?: boolean): void {
    const { node } = element;
    this._elementList.remove(node, false);
    if (targetElement) {
      this._elementList.insertBefore(node, targetElement.node, false);
    } else {
      if (isAppend) {
        this._elementList.insert(node, false);
      } else {
        this._elementList.prepend(node, false);
      }
    }
  }

  /**
   * 移除组件节点
   *
   * @param elements
   * @returns
   */
  private _removeNodesByElements(elements: IElement[]): ILinkedNode<IElement>[] {
    const removedNodes: ILinkedNode<IElement>[] = [];
    elements.forEach(element => {
      const [node] = this._elementList.removeBy(node => node.value.id === element.id, false);
      removedNodes.push(node);
    });
    return removedNodes;
  }

  /**
   * 获取组合的最底层的第一个子孙组件
   *
   * @param group
   */
  private _getGroupFirstDeepSubNode(groupNode: ILinkedNode<IElement>): ILinkedNode<IElement> | null {
    if (!groupNode.value.isGroup) return groupNode;
    return this._elementsMap.get((groupNode.value as IElementGroup).deepSubIds[0])?.node;
  }

  /**
   * 将给定的组件在所属组合的内部降低层级
   *
   * 注意组件没有变化，变化的是组件所属链表节点在链表中的位置
   *
   * @param elements
   * @param isGroupInternal 是否是组合内部提升
   */
  private _doElementsGoDownIfy(elements: IElement[], isGroupInternal: boolean = false): void {
    const elementIds = elements.map(el => el.id);
    const group: IElementGroup = elements[0].group;
    elements = ElementUtils.flatElementsWithDeepSubs(elements);
    const headNode: ILinkedNode<IElement> = elements[0].node;
    let targetNode: ILinkedNode<IElement> | null = headNode.prev;
    if (!targetNode) return;
    let groupSubIds: string[] = [];
    // 判断是否是组合内部子组件移动排序
    if (isGroupInternal) {
      let targetId: string;
      const subIds = group.subIds;
      const isHeadInGroup = subIds[0] === headNode.value.id;
      if (isHeadInGroup) {
        for (let i = 0; i < subIds.length; i++) {
          if (!elementIds.includes(subIds[i])) {
            targetId = subIds[i];
            break;
          }
        }
      } else {
        const headIndex = subIds.findIndex(id => id === headNode.value.id);
        targetId = subIds[headIndex - 1];
      }
      if (targetId) {
        targetNode = this._elementsMap.get(targetId)?.node;
        groupSubIds = LodashUtils.moveArryElementsBefore(subIds, elementIds, targetId);
        if (targetNode && targetNode.value.isGroup) {
          targetNode = this._getGroupFirstDeepSubNode(targetNode);
        }
      }
    } else if (targetNode?.value.isGroup) {
      // 如果目标节点是组合，那么应该将目标节点替换为最顶层的组合节点
      targetNode = this._getGroupFirstDeepSubNode(targetNode);
    }
    this._moveElememntsBeforeTarget(elements, targetNode);
    if (isGroupInternal) {
      this.updateElementModel(group.id, { subIds: groupSubIds });
    }
  }

  /**
   * 移动组件到目标节点之前
   *
   * @param elements 要移动层级的组件集合
   * @param targetNode 目标节点
   */
  private _moveElememntsBeforeTarget(elements: IElement[], targetNode: ILinkedNode<IElement> | null): void {
    const removedNodes = this._removeNodesByElements(elements);
    if (targetNode) {
      removedNodes.forEach(node => {
        this._elementList.insertBefore(node, targetNode, false);
      });
    } else {
      removedNodes.reverse().forEach(node => {
        this._elementList.prepend(node, false);
      });
    }
  }

  /**
   * 重新整理组件的顺序
   *
   * @param elements 要重新整理的组件集合
   * @param executeFunction 执行组件重新整理的函数
   * @param undoActionCallback 在执行操作前的回调函数
   * @param redoActionCallback 在执行操作后的回调函数
   */
  private async _doElementsLayerChange(
    elements: IElement[],
    executeFunction: ElementsLayerExecuteFunction,
    undoActionCallback: ElementActionCallback,
    redoActionCallback: ElementActionCallback,
  ): Promise<void> {
    const groupElements = this._divideElementsByGroup(elements);
    const noGroupElements: IElement[] = [];
    await Promise.all(
      groupElements.map(partElements => {
        return new Promise<void>(async resolve => {
          if (isArray(partElements)) {
            // 获取组件所属的组合
            const group = partElements[0].group;
            // 如果组合内子组件全部调整顺序相当于没有调整顺序，无意义的操作
            if (partElements.length === group.model.subIds.length) return resolve();
            // 组合更新参数
            const actionParams: ElementsActionParam[] = [
              {
                type: ElementActionTypes.Moved,
                data: partElements,
              },
              {
                type: ElementActionTypes.GroupUpdated,
                data: [group],
              },
            ];
            await undoActionCallback(actionParams);
            executeFunction(partElements, true);
            await redoActionCallback(actionParams);
          } else {
            noGroupElements.push(partElements);
          }
          resolve();
        });
      }),
    );
    if (noGroupElements.length) {
      const actionParams: ElementsActionParam[] = [
        {
          type: ElementActionTypes.Moved,
          data: noGroupElements,
        },
      ];
      await undoActionCallback(actionParams);
      executeFunction(noGroupElements, false);
      await redoActionCallback(actionParams);
    }
  }

  /**
   * 组件下移
   *
   * @param elements 要移动层级的组件集合
   * @param undoActionCallback 在执行操作前的回调函数
   * @param redoActionCallback 在执行操作后的回调函数
   */
  async setElementsGoDown(elements: IElement[], undoActionCallback: ElementActionCallback, redoActionCallback: ElementActionCallback): Promise<void> {
    if (elements.length === 0) return;
    await this._doElementsLayerChange(elements, (partElements, isGroupInternal) => this._doElementsGoDownIfy(partElements, isGroupInternal), undoActionCallback, redoActionCallback);
    this.reactionElements();
    this.emitElementsLayerChanged();
    this.throttleRefreshTreeNodes();
  }

  /**
   * 获取分组组件中的最后一个组件
   *
   * @param elements
   * @returns
   */
  private _getTailOfDividedGroupElements(elements: GroupedElements): IElement {
    if (elements.length) {
      const tail = elements[elements.length - 1];
      if (isArray(tail)) return tail[tail.length - 1];
      return tail;
    }
  }

  /**
   * 将给定的组件按照组合进行分组
   *
   * @param elements
   * @param forceGroup
   */
  private _divideElementsByGroup(elements: IElement[], forceGroup: boolean = false): GroupedElements {
    const result: GroupedElements = [];
    const noGroupElements: IElement[] = [];
    elements.forEach(element => {
      if (element.isGroupSubject) {
        const tail = this._getTailOfDividedGroupElements(result);
        if (tail && tail.model.groupId === element.model.groupId) {
          result[result.length - 1] = [...(result[result.length - 1] as IElement[]), element];
        } else {
          result.push([element]);
        }
      } else {
        if (forceGroup) {
          noGroupElements.push(element);
        } else {
          result.push(element);
        }
      }
    });
    if (forceGroup) return [...result, noGroupElements];
    return result;
  }

  /**
   * 将给定的组件移动到目标组件之后，或者移动到链表末尾
   *
   * @param elements 给定的组件集合
   * @param targetNode 目标组件的链表节点
   */
  private _moveElementsAfterTarget(elements: IElement[], targetNode: ILinkedNode<IElement> | null): void {
    // 先将要排序的组件从链表中移除
    const removedNodes = this._removeNodesByElements(elements);
    // 判断是否存在目标节点
    if (targetNode) {
      // 按顺序将被临时移除的组件节点插入到目标节点前
      removedNodes.forEach(node => {
        this._elementList.insertAfter(node, targetNode, false);
        // 更新目标节点
        targetNode = node;
      });
    } else {
      // 如果不存在目标节点，那么将被临时移除的组件节点插入到链表的末尾
      removedNodes.forEach(node => {
        this._elementList.insert(node, false);
      });
    }
  }

  /**
   * 将给定的组件在所属组合的内部提升层级
   *
   * 注意组件没有变化，变化的是组件所属链表节点在链表中的位置
   *
   * @param elements
   * @param isGroupInternal 是否是组合内部提升
   */
  private _doElementsShiftMoveIfy(elements: IElement[], isGroupInternal: boolean = false): void {
    const elementIds = elements.map(el => el.id);
    const group = elements[0].group;
    elements = ElementUtils.flatElementsWithDeepSubs(elements);
    // 待调整顺序组件集合的末尾节点
    const tailNode: ILinkedNode<IElement> = elements[elements.length - 1].node;
    // 因为是上移，所以目标节点是尾节点的下一个节点
    let targetNode: ILinkedNode<IElement> | null = tailNode.next;
    let groupSubIds: string[] = [];
    // 判断是否是组合内部子组件移动排序
    if (isGroupInternal) {
      let targetId: string;
      const subIds = group.subIds;
      const isTailInGroup = subIds[subIds.length - 1] === tailNode.value.id;
      if (isTailInGroup) {
        // 因为多个子组件在组合内部是不连续的，且tailNode可能是组合中最后一个子组件，所以，需要倒序查找第一个不在给定子组件集合中的子组件作为插入目标节点
        for (let i = subIds.length - 1; i >= 0; i--) {
          const targetIndex = elementIds.findIndex(id => id === subIds[i]);
          if (targetIndex === -1) {
            targetId = subIds[i];
            break;
          }
        }
      } else {
        const tailIndex = subIds.findIndex(id => id === tailNode.value.id);
        targetId = subIds[tailIndex + 1];
      }
      if (targetId) {
        targetNode = this._elementsMap.get(targetId)?.node;
        groupSubIds = LodashUtils.moveArrayElementsAfter(subIds, elementIds, targetId);
        // 如果要插入的目标节点是当前组合，表示数据出现异常，终止节点移动
        if (targetNode && targetNode.value === group) {
          console.log(`组合内部子组件向上移动排序时，目标节点是当前组合，表示数据出现异常，终止节点移动, 组合id: ${group.id}, 需要向上移动的子组件集合: ${elements.map(el => el.id).join(", ")}`);
          return;
        }
      }
    } else if (targetNode?.value.isGroupSubject) {
      // 如果目标节点是子组件，那么应该将目标节点替换为最顶层的组合节点
      targetNode = targetNode.value.ancestorGroup.node;
    }
    if (targetNode) {
      this._moveElementsAfterTarget(elements, targetNode);
      if (isGroupInternal) {
        this.updateElementModel(group.id, { subIds: groupSubIds });
      }
    }
  }

  /**
   * 组件上移
   *
   * @param elements 要移动层级的组件集合
   * @param undoActionCallback 在执行操作前的回调函数
   * @param redoActionCallback 在执行操作后的回调函数
   */
  async setElementsShiftMove(elements: IElement[], undoActionCallback: ElementActionCallback, redoActionCallback: ElementActionCallback): Promise<void> {
    if (elements.length === 0) return;
    await this._doElementsLayerChange(elements, (partElements, isGroupInternal) => this._doElementsShiftMoveIfy(partElements, isGroupInternal), undoActionCallback, redoActionCallback);
    this.reactionElements();
    this.emitElementsLayerChanged();
    this.throttleRefreshTreeNodes();
  }

  /**
   * 设置组件段落间距
   *
   * @param elements
   * @param value
   */
  async setElementsParagraphSpacing(elements: IElement[], value: number): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setParagraphSpacing(value);
      }
    });
  }

  /**
   * 设置组件文本大小写
   *
   * @param elements
   * @param value
   */
  async setElementsTextCase(elements: IElement[], value: TextCase): Promise<void> {
    elements.forEach(element => {
      if (this.hasElement(element.id)) {
        element.setTextCase(value);
      }
    });
  }

  /**
   * 切换目标
   *
   * @param ids 目标id集合
   * @param isTarget 是否目标
   */
  toggleElementsTarget(ids: string[], isTarget: boolean): void {
    ids.forEach(id => {
      if (this.hasElement(id)) {
        this.updateElementById(id, { isTarget });
      }
    });
  }

  /**
   * 设置组件脱离组合的独立选中状态
   *
   * @param ids 组件id集合
   * @param isDetachedSelected 是否选中
   */
  setElementsDetachedSelectedByIds(ids: string[], isDetachedSelected: boolean): void {
    // 先取消选中先前的组件
    if (isDetachedSelected) {
      this._selectedElementIds.forEach(id => {
        if (this.hasElement(id) && !ids.includes(id) && !this._detachedSelectedElementIds.has(id)) {
          this.updateElementById(id, { isSelected: false });
        }
      });
      this._detachedSelectedElementIds.forEach(id => {
        if (this.hasElement(id) && !ids.includes(id)) {
          this.updateElementById(id, { isDetachedSelected: false });
        }
      });
    }
    ids.forEach(id => {
      if (this.hasElement(id)) {
        this.updateElementById(id, { isDetachedSelected });
      }
    });
  }
  /**
   * 设置组件脱离组合的独立选中状态
   *
   * @param elements 组件集合
   * @param isDetachedSelected 是否选中
   */
  setElementsDetachedSelected(elements: IElement[], isDetachedSelected: boolean): void {
    const ids = elements.map(el => el.id);
    this.setElementsDetachedSelectedByIds(ids, isDetachedSelected);
  }

  /**
   * 树节点多选
   *
   * @param ids
   */
  private _setElementsMixinDetachedSelected(ids: string[]): void {
    ids.forEach(id => {
      if (this.hasElement(id)) {
        const element = this.getElementById(id);
        const { isSelected, isGroup, isGroupSubject } = element;
        // 如果是子组要取消选中，且父组已选中，则不取消
        if (isSelected && isGroupSubject && element.group.isSelected) return;
        // 如果当前是组合且被选中，则先取消子组件的选中状态
        if (!isSelected && isGroup) {
          (element as IElementGroup).deepSubs.forEach(sub => {
            this.updateElementById(sub.id, { isSelected: false });
          });
        }
        this.updateElementById(id, { isDetachedSelected: !isSelected });
      }
    });
  }

  /**
   * 切换组件选中状态(组件脱离组合的独立选中状态切换)
   *
   * @param ids 组件id集合
   * @param isDetachedSelected 是否选中
   */
  toggleElementsDetachedSelected(ids: string[]): void {
    if (this.shield.event.isCtrl) {
      this._setElementsMixinDetachedSelected(ids);
    } else {
      this.setElementsDetachedSelectedByIds(ids, true);
    }
  }

  /**
   * 删除组件之前先标记哪些组件的父组件需要删除，哪些父组件需要更新
   *
   * @param elements
   * @param store
   * @returns
   */
  findRemovedElemements(elements: IElement[]): {
    list: IElement[];
    ancestors: IElement[];
  } {
    const elementIds: Set<string> = new Set(elements.map(element => element.id));
    const ancestorIdsSet: Set<string> = new Set();
    const ancestorMap = new Map<string, IElement>();
    elements.forEach(element => {
      // 检查父组件是否未选中
      if (ElementUtils.isDetachedElementAncestorUnNotSelected(element)) {
        let group = element.group;
        // 遍历祖先组件
        while (group && !group.isSelected) {
          const { id } = group;
          // 如果父组件的所有子组件都需要被删除，那么父组件也需要被删除，否则就是更新
          if (group.model.subIds.every(subId => elementIds.has(subId))) {
            elementIds.add(id);
          } else {
            ancestorIdsSet.add(id);
          }
          ancestorMap.set(id, group);
          group = group.group;
        }
      }
    });
    let ancestorIds = this.getOrderedElementIds(Array.from(ancestorIdsSet));
    ancestorIds.filter(ancestorId => {
      const ancestor = ancestorMap.get(ancestorId);
      if (ancestor.model.subIds.every(subId => elementIds.has(subId))) {
        elementIds.add(ancestorId);
        ancestorIdsSet.delete(ancestorId);
      }
    });
    const ancestors: IElement[] = this.getOrderedElementsByIds(Array.from(ancestorIdsSet));
    const list: IElement[] = this.getOrderedElementsByIds(Array.from(elementIds));
    return { list, ancestors };
  }

  /**
   * 获取独立组件的祖先组件集合
   *
   * @param elements
   * @returns
   */
  getAncestorsByDetachedElements(elements: IElement[]): IElementGroup[] {
    const ancestors: string[] = ElementUtils.getAncestorIdsByDetachedElements(elements);
    return this.getOrderedElementsByIds(Array.from(ancestors)) as IElementGroup[];
  }

  /**
   * 给定组件集合，返回该集合中的所有外层组件
   *
   * @param elements
   * @returns
   */
  getOuterLayerElements(elements: IElement[]): IElement[] {
    const result = ElementUtils.calcOuterLayerElements(elements);
    return this.sortElements(result);
  }

  /**
   * 执行将组件移动到指定位置
   *
   * @param ids
   * @param target
   * @param dropType
   * @param undoActionCallback
   * @param redoActionCallback
   * @returns
   */
  async _doMoveElementsTo(ids: string[], target: string, dropType: TreeNodeDropType, undoActionCallback: ElementActionCallback, redoActionCallback: ElementActionCallback): Promise<void> {
    // 需要移动位置的组件集合
    const elements = this.getOrderedElementsByIds(ids);
    // 目标组件
    let targetElement = this.getElementById(target);
    // 目标组合的id
    let targetGroupId: string | undefined = undefined;
    // 目标组合
    let targetGroup: IElementGroup | undefined = undefined;
    // 目标组合的子组件id集合
    let targetSubIds: string[] = [];
    // 插入到组合内部的操作
    if (targetElement.isGroupSubject) {
      targetGroupId = targetElement.model.groupId;
      targetSubIds = this._elementsMap.get(targetGroupId)?.model.subIds || [];
      targetGroup = this._elementsMap.get(targetGroupId) as IElementGroup;
    }
    const actionParams: ElementsActionParam[] = [];
    // 查找需要删除或者更新的组合
    let {
      updatedGroups,
      removedGroups,
      actionParams: effectedActionParams,
      outerLayerIdSet,
      elementIdSet,
      removedGroupIdSet,
      updatedGroupIdSet,
    } = this._calcEffectedElementsOfMoved(elements, targetGroup);
    actionParams.push(...effectedActionParams);
    if (targetGroup && !updatedGroupIdSet.has(targetGroup.id)) {
      actionParams.push({
        type: ElementActionTypes.GroupUpdated,
        data: [targetGroup],
      });
    }
    // undo数据回调
    await undoActionCallback(actionParams);
    // 将组件从链表中移除
    const removedNodes = this._removeNodesByElements(elements);
    // 按顺序将被临时移除的组件节点插入到目标节点前
    let targetNode: ILinkedNode<IElement> = targetElement.node;
    removedNodes.forEach(node => {
      const {
        id,
        model: { groupId },
      } = node.value;
      // 树节点的after和before操作，与当前链表中的顺序是相反的
      switch (dropType) {
        case TreeNodeDropType.after:
          this._elementList.insertBefore(node, targetNode, false);
          break;
        case TreeNodeDropType.before:
          this._elementList.insertAfter(node, targetNode, false);
          break;
        default: {
          break;
        }
      }
      // 判断是否是组内平级移动
      if (groupId && groupId === targetElement.model.groupId) {
        targetGroup = this._elementsMap.get(groupId) as IElementGroup;
        targetSubIds = targetGroup.model.subIds;
      }
      // 如果组件移动到了不同的组合，那么需要更新组件的组合id（仅更新层级最高的组件的组合id）
      if (outerLayerIdSet.has(id)) {
        this.updateElementModel(id, { groupId: targetGroupId });
      }
      targetNode = node;
    });
    // 组内平级移动以及移动到其他组内，targetGroup都会存在
    if (targetGroup) {
      // 外层组件的id集合
      const outerLayerIds = this.getOrderedElementIds(Array.from(outerLayerIdSet));
      // 过滤掉已经被删除的组件id
      let subIds = targetSubIds.filter(id => !elementIdSet.has(id) && !removedGroupIdSet.has(id));
      // 目标组件的索引
      const targetIndex = subIds.findIndex(id => id === targetElement.id);
      // 重新插入组件id
      subIds = LodashUtils.insertToArray(subIds, targetIndex, dropType === TreeNodeDropType.after, ...outerLayerIds);
      // 更新目标组合的子组件id集合
      this.updateElementModel(targetGroup.id, { subIds });
      // 更新组合的尺寸及位置
      targetGroup.refreshBySubs();
      // 更新组合的原始数据
      targetGroup.refreshOriginals();
    }
    // 剔除掉已经更新子组件id的组合
    updatedGroups = updatedGroups.filter(group => group.id !== targetGroupId);
    // 删除或者更新组合的子组件id集合
    this._processEffectedElementGroups({ updatedGroups, removedGroups, excludeElementIdSet: elementIdSet, excludeGroupIdSet: removedGroupIdSet });
    // redo数据回调
    await redoActionCallback(actionParams);
  }

  /**
   * 将组件移动到指定位置
   *
   * @param ids
   * @param target
   * @param dropType
   * @param undoActionCallback
   * @param redoActionCallback
   * @returns
   */
  async moveElementsTo(ids: string[], target: string, dropType: TreeNodeDropType, undoActionCallback: ElementActionCallback, redoActionCallback: ElementActionCallback): Promise<void> {
    if (ids.length === 0 || !target) return;
    await this._doMoveElementsTo(ids, target, dropType, undoActionCallback, redoActionCallback);
    this.reactionElements();
    this.emitElementsLayerChanged();
    this.throttleRefreshTreeNodes();
  }

  /**
   * 清除正在创建的组件
   */
  clearCreatingElements(): void {
    this.removeElements(this.creatingElements);
    this.currentCreatingElementId = null;
  }
}
