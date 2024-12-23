import LinkedList from "@/modules/struct/LinkedList";
import { IElementList, IStageElement } from "@/types";
import { ILinkedNode } from "@/modules/struct/LinkedNode";
import { observable, reaction, runInAction } from "mobx";
import { ElementReactionPropNames, ElementsSizeChangedName } from "@/modules/elements/ElementUtils";

export default class ElementList extends LinkedList<IStageElement> implements IElementList {

  constructor() {
    super();
    this.nodes = observable.set(this.nodes);
    reaction(() => this.nodes.size, (size) => this.emit(ElementsSizeChangedName, size));
  }

  /**
   * 给节点添加属性监听
   * 
   * @param element 
   */
  private _addElementObserve(element: IStageElement): void {
    ElementReactionPropNames.forEach(propName => {
      reaction(() => {
        return element[propName];
      }, (value) => {
        this.emit(`element${propName}Changed`, element, value);
      });
    })
  }

  /**
   * 插入元素
   *
   * @param node 
   */
  insert(node: ILinkedNode<IStageElement>): void {
    runInAction(() => {
      this._addElementObserve(node.value);
      super.insert(node);
    })
  }

  /**
   * 向前插入元素
   * 
   * @param node 
   * @param target 
   */
  insertBefore(node: ILinkedNode<IStageElement>, target: ILinkedNode<IStageElement>): void {
    runInAction(() => {
      this._addElementObserve(node.value);
      super.insertBefore(node, target);
    })
  }

  /**
   * 向后插入元素
   *
   * @param node 
   * @param target 
   */
  insertAfter(node: ILinkedNode<IStageElement>, target: ILinkedNode<IStageElement>): void {
    runInAction(() => {
      this._addElementObserve(node.value);
      super.insertAfter(node, target);
    })
  }

  /**
   * 向头部插入元素
   *
   * @param node 
   */
  prepend(node: ILinkedNode<IStageElement>): void {
    runInAction(() => {
      this._addElementObserve(node.value);
      super.prepend(node);
    })
  }

  /**
   * 移除元素
   *
   * @param node 
   */
  remove(node: ILinkedNode<IStageElement>): void {
    runInAction(() => {
      super.remove(node);
    })
  }

  /**
   * 根据条件移除元素
   *
   * @param predicate 
   */
  removeBy(predicate: (node: ILinkedNode<IStageElement>) => boolean): void {
    runInAction(() => {
      super.removeBy(predicate);
    })
  }

}