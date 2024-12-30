import LinkedList from "@/modules/struct/LinkedList";
import { ILinkedNode } from "@/modules/struct/LinkedNode";
import { observable, reaction, runInAction } from "mobx";
import { ElementListEventNames, ElementReactionPropNames } from "@/modules/elements/ElementUtils";
import IElement from "@/types/IElement";
import IElementList from "@/types/IElementList";

export default class ElementList extends LinkedList<IElement> implements IElementList {

  constructor() {
    super();
    this.nodes = observable.set(this.nodes);
    reaction(() => this.nodes.size, (size) => this.emit(ElementListEventNames.sizeChanged, size));
  }

  /**
   * 给节点添加属性监听
   * 
   * @param element 
   */
  private _addElementObserve(node: ILinkedNode<IElement>): void {
    Object.keys(ElementReactionPropNames).forEach(propName => {
      reaction(() => node.value[propName], () => {
        this.emit(propName, node.value, node.value[propName]);
      });
    });
  }

  /**
   * 插入元素
   *
   * @param node 
   */
  insert(node: ILinkedNode<IElement>): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.insert(node);
      this.emit(ElementListEventNames.added, node);
    })
  }

  /**
   * 向前插入元素
   * 
   * @param node 
   * @param target 
   */
  insertBefore(node: ILinkedNode<IElement>, target: ILinkedNode<IElement>): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.insertBefore(node, target);
      this.emit(ElementListEventNames.added, node);
    })
  }

  /**
   * 向后插入元素
   *
   * @param node 
   * @param target 
   */
  insertAfter(node: ILinkedNode<IElement>, target: ILinkedNode<IElement>): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.insertAfter(node, target);
      this.emit(ElementListEventNames.added, node);
    })
  }

  /**
   * 向头部插入元素
   *
   * @param node 
   */
  prepend(node: ILinkedNode<IElement>): void {
    runInAction(() => {
      this._addElementObserve(node);
      super.prepend(node);
      this.emit(ElementListEventNames.added, node);
    })
  }

  /**
   * 移除元素
   *
   * @param node 
   */
  remove(node: ILinkedNode<IElement>): void {
    runInAction(() => {
      super.remove(node);
      this.emit(ElementListEventNames.removed, node);
    })
  }

  /**
   * 根据条件移除元素
   *
   * @param predicate 
   */
  removeBy(predicate: (node: ILinkedNode<IElement>) => boolean): ILinkedNode<IElement>[] {
    let result: ILinkedNode<IElement>[] = [];
    runInAction(() => {
      result = super.removeBy(predicate);
      result.forEach(node => {
        this.emit(ElementListEventNames.removed, node);
      });
    })
    return result;
  }

}