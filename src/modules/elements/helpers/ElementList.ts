import LinkedList from "@/modules/struct/LinkedList";
import { ILinkedNode } from "@/modules/struct/LinkedNode";
import { observable, reaction, runInAction } from "mobx";
import { ElementListEventNames, ElementReactionPropNames } from "@/modules/elements/utils/ElementUtils";
import IElement from "@/types/IElement";
import IElementList from "@/types/IElementList";

export default class ElementList extends LinkedList<IElement> implements IElementList {
  constructor() {
    super();
    this.nodes = observable.set(this.nodes);
  }

  /**
   * 给节点添加属性监听
   *
   * @param element
   */
  private _addElementObserve(node: ILinkedNode<IElement>): void {
    Object.keys(ElementReactionPropNames).forEach(propName => {
      reaction(
        () => node.value[propName],
        () => {
          this.emit(propName, node.value, node.value[propName]);
        },
      );
    });
  }

  /**
   * 插入组件
   *
   * @param node
   * @param autoEmit
   */
  insert(node: ILinkedNode<IElement>, autoEmit: boolean = true): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.insert(node);
      if (autoEmit) {
        this.emit(ElementListEventNames.added, node);
      }
    });
  }

  /**
   * 向前插入组件
   *
   * @param node
   * @param target
   */
  insertBefore(node: ILinkedNode<IElement>, target: ILinkedNode<IElement>, autoEmit: boolean = true): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.insertBefore(node, target);
      if (autoEmit) {
        this.emit(ElementListEventNames.added, node);
      }
    });
  }

  /**
   * 向后插入组件
   *
   * @param node
   * @param target
   */
  insertAfter(node: ILinkedNode<IElement>, target: ILinkedNode<IElement>, autoEmit: boolean = true): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.insertAfter(node, target);
      if (autoEmit) {
        this.emit(ElementListEventNames.added, node);
      }
    });
  }

  /**
   * 向头部插入组件
   *
   * @param node
   * @param autoEmit
   */
  prepend(node: ILinkedNode<IElement>, autoEmit: boolean = true): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.prepend(node);
      if (autoEmit) {
        this.emit(ElementListEventNames.added, node);
      }
    });
  }

  /**
   * 移除组件
   *
   * @param node
   * @param autoEmit
   */
  remove(node: ILinkedNode<IElement>, autoEmit: boolean = true): void {
    runInAction(() => {
      super.remove(node);
      if (autoEmit) {
        this.emit(ElementListEventNames.removed, node);
      }
    });
  }

  /**
   * 根据条件移除组件
   *
   * @param predicate
   * @param autoEmit
   */
  removeBy(predicate: (node: ILinkedNode<IElement>) => boolean, autoEmit: boolean = true): ILinkedNode<IElement>[] {
    let result: ILinkedNode<IElement>[] = [];
    runInAction(() => {
      result = super.removeBy(predicate, autoEmit);
    });
    return result;
  }
}
