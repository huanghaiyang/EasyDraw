import { ILinkedNode, ILinkedNodeData } from "@/modules/struct/LinkedNode";

export interface ILinkedList<T> {
  nodes: Set<T>;
  get length(): number;
  get tail(): T | null;
  get head(): T | null;
  insert(node: T): void;
  insertBefore(node: T, target: T): void;
  insertAfter(node: T, target: T): void;
  prepend(node: T): void;
  remove(node: T): void;
  removeBy(predicate: (node: T) => boolean): T;
  forEach(callback: (node: T, index: number) => void): void;
  forEachRevert(callback: (node: T, index: number) => void): void;
  forEachBreak(callback: (node: T, index: number) => void, predicate?: (node: T, index: number) => boolean): void;
  forEachBreakRevert(callback: (node: T, index: number) => void, predicate?: (node: T, index: number) => boolean): void;
  getNodeIndex(node: T): number;
}

export default class LinkedList<T extends ILinkedNodeData> implements ILinkedList<ILinkedNode<ILinkedNodeData>> {
  nodes: Set<ILinkedNode<T>>;
  private _head: ILinkedNode<T>;
  private _tail: ILinkedNode<T>;

  get head(): ILinkedNode<T> {
    return this._head;
  }

  get tail(): ILinkedNode<T> {
    return this._tail;
  }

  get length(): number {
    return this.nodes.size;
  }

  constructor() {
    this.nodes = new Set();
    this._head = null;
    this._tail = null;
  }

  /**
   * 插入节点到链表的尾部
   * 
   * @param node 
   */
  insert(node: ILinkedNode<T>): void {
    if (this._tail) {
      this.insertAfter(node, this._tail);
    } else {
      this._tail = node;
    }
    if (!this._head) {
      this._head = node;
    }
  }

  /**
   * 插入节点到链表的头部
   * 
   * @param node 
   */
  prepend(node: ILinkedNode<T>): void {
    if (this._head) {
      this.insertBefore(node, this._head);
    } else {
      this._head = node;
    }
    if (!this._tail) {
      this._tail = node;
    }
  }

  /**
   * 删除节点
   * 
   * @param node 
   */
  remove(node: ILinkedNode<T>): void {
    this.nodes.delete(node);
    if (node.prev) {
      node.prev.next = node.next;
      node.prev = null;
    }
    if (node.next) {
      node.next.prev = node.prev;
      node.next = null;
    }
  }

  /**
   * 根据条件删除节点
   * 
   * @param predicate 
   */
  removeBy(predicate: (node: ILinkedNode<T>) => boolean): ILinkedNode<T> {
    const node = Array.from(this.nodes).find(node => predicate(node));
    if (node) {
      this.remove(node);
    }
    return node;
  }

  /**
   * 插入节点到目标节点的前面
   * 
   * @param node 
   * @param target 
   */
  insertBefore(node: ILinkedNode<T>, target: ILinkedNode<T>): void {
    if (target) {
      target.insertBefore(node);
      this.nodes.add(node);
      if (target.isHead) {
        this._head = node;
      }
    }
  }

  /**
   * 插入节点到目标节点的后面
   * 
   * @param node 
   * @param target 
   */
  insertAfter(node: ILinkedNode<T>, target: ILinkedNode<T>): void {
    if (target) {
      target.insertAfter(node);
      this.nodes.add(node);
      if (target.isTail) {
        this._tail = node;
      }
    }
  }

  /**
   * 遍历链表
   * 
   * @param callback 
   */
  forEach(callback: (node: ILinkedNode<T>, index: number) => void): void {
    this.forEachBreak(callback, () => false);
  }

  /**
   * 遍历链表，并中断遍历
   * 
   * @param callback 
   * @param predicate 
   * @returns 
   */
  forEachBreak(callback: (node: ILinkedNode<T>, index: number) => void, predicate?: (node: ILinkedNode<T>, index: number) => boolean): void {
    let index = 0;
    let current = this._head;
    while (current) {
      if (predicate && predicate(current, index)) {
        return;
      }
      callback(current, index);
      current = current.next;
      index++;
    }
  }



  /**
   * 倒序遍历链表
   * 
   * @param callback 
   */
  forEachRevert(callback: (node: ILinkedNode<T>, index: number) => void): void {
    this.forEachBreakRevert(callback, () => false);
  }

  /**
   * 倒序遍历链表，并中断遍历
   * 
   * @param callback 
   * @param predicate 
   * @returns 
   */
  forEachBreakRevert(callback: (node: ILinkedNode<T>, index: number) => void, predicate?: (node: ILinkedNode<T>, index: number) => boolean): void {
    let index = this.length - 1;
    let current = this._tail;
    while (current) {
      if (predicate && predicate(current, index)) {
        return;
      }
      callback(current, index);
      current = current.prev;
      index--;
    }
  }

  /**
   * 获取节点在链表中的位置
   * 
   * @param node 
   * @returns 
   */
  getNodeIndex(node: ILinkedNode<T>): number {
    let index = -1;
    let current = this._head;
    while (current) {
      index++;
      if (current === node) {
        return index;
      }
      current = current.next;
    }
    return index;
  }
}