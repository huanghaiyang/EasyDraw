import { ILinkedNode, ILinkedNodeValue } from "@/modules/struct/LinkedNode";
import { EventEmitter } from "events";

export type LinkedNodeEqFunc<T> = (a: T, b: T) => boolean;

export interface ILinkedList<T> extends EventEmitter {
  nodes: Set<T>;
  get length(): number;
  get tail(): T | null;
  get head(): T | null;
  insert(node: T): void;
  insertBefore(node: T, target: T): void;
  insertAfter(node: T, target: T): void;
  prepend(node: T): void;
  remove(node: T): void;
  removeBy(predicate: (node: T) => boolean): T[];
  forEach(callback: (node: T, index: number) => void): void;
  forEachRevert(callback: (node: T, index: number) => void): void;
  forEachBreak(callback: (node: T, index: number) => void, predicate?: (node: T, index: number) => boolean): void;
  forEachBreakRevert(callback: (node: T, index: number) => void, predicate?: (node: T, index: number) => boolean): void;
  getIndex(node: T): number;
  filter(predicate: (node: T) => boolean): T[];
}

export default class LinkedList<T extends ILinkedNodeValue> extends EventEmitter implements ILinkedList<ILinkedNode<ILinkedNodeValue>> {
  nodes: Set<ILinkedNode<T>>;
  private _head: ILinkedNode<T>;
  private _tail: ILinkedNode<T>;
  private _eqFunc: LinkedNodeEqFunc<ILinkedNode<T>> = (a, b) => a === b;

  get head(): ILinkedNode<T> {
    return this._head;
  }

  get tail(): ILinkedNode<T> {
    return this._tail;
  }

  get length(): number {
    return this.nodes.size;
  }

  constructor(eqFunc?: LinkedNodeEqFunc<ILinkedNode<T>>) {
    super();
    this.nodes = new Set();
    this._head = null;
    this._tail = null;
    this._eqFunc = eqFunc;
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
      this.nodes.add(node);
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
      this.nodes.add(node);
    }
    if (!this._tail) {
      this._tail = node;
    }
  }

  /**
   * 删除节点
   *
   * @param node
   * @param options
   */
  remove(node: ILinkedNode<T>, options?: any): void {
    this.nodes.delete(node);
    const prev = node.prev;
    const next = node.next;
    if (prev) {
      prev.next = next;
    }
    if (next) {
      next.prev = prev;
    }
    node.prev = null;
    node.next = null;
    if (this._eqFunc(node, this._tail)) {
      this._tail = prev;
    }
    if (this._eqFunc(node, this._head)) {
      this._head = next;
    }
  }

  /**
   * 根据条件删除节点
   *
   * @param predicate
   * @param options
   * @returns
   */
  removeBy(predicate: (node: ILinkedNode<T>) => boolean, options?: any): ILinkedNode<T>[] {
    let result: ILinkedNode<T>[] = [];
    Array.from(this.nodes).forEach(node => {
      if (predicate(node)) {
        this.remove(node, options);
        result.push(node);
      }
    });
    return result;
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
      if (node.isHead) {
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
      if (node.isTail) {
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
  getIndex(node: ILinkedNode<T>): number {
    let index = -1;
    let current = this._head;
    while (current) {
      index++;
      if (this._eqFunc(current, node)) {
        return index;
      }
      current = current.next;
    }
    return index;
  }

  /**
   * 过滤链表中满足条件的节点
   *
   * @param predicate
   * @returns
   */
  filter(predicate: (node: ILinkedNode<T>) => boolean): ILinkedNode<T>[] {
    const result: ILinkedNode<T>[] = [];
    this.forEach(node => {
      if (predicate(node)) {
        result.push(node);
      }
    });
    return result;
  }
}
