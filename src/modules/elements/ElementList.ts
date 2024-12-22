import LinkedList from "@/modules/struct/LinkedList";
import { IElementList, IStageElement } from "@/types";
import { ILinkedNode } from "@/modules/struct/LinkedNode";
import { observable, reaction, runInAction } from "mobx";

export default class ElementList extends LinkedList<IStageElement> implements IElementList {

  constructor() {
    super();
    this.nodes = observable.set(this.nodes);

    reaction(() => {
      return this.nodes.size
    }, (size) => {
      this.emit("sizeChange", size);
    });
  }

  /**
   * 插入元素
   *
   * @param node 
   */
  insert(node: ILinkedNode<IStageElement>): void {
    runInAction(() => {
      node.data = observable(node.data);
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
      node.data = observable(node.data);
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
      node.data = observable(node.data);
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
      node.data = observable(node.data);
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