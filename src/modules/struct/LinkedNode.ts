export interface ILinkedNodeData { }

export interface ILinkedNode<T> {
  prev: ILinkedNode<T> | null;
  next: ILinkedNode<T> | null;
  data: T;

  get isHead(): boolean;
  get isTail(): boolean;
  get isEmpty(): boolean;

  insertAfter(node: ILinkedNode<T>): void;
  insertBefore(node: ILinkedNode<T>): void;
}

export default class LinkedNode<T extends ILinkedNodeData> implements ILinkedNode<ILinkedNodeData> {
  prev: ILinkedNode<T> | null = null;
  next: ILinkedNode<T> | null = null;
  data: T;

  constructor(data: T) {
    this.data = data;
  }

  get isHead(): boolean {
    return this.prev === null;
  }

  get isTail(): boolean {
    return this.next === null;
  }

  get isEmpty(): boolean {
    return this.data === null;
  }

  /**
   * 插入到当前节点之后
   * 
   * @param node 
   */
  insertAfter(node: ILinkedNode<T>): void {
    const next = this.next;
    this.next = node;
    node.prev = this;
    node.next = next;
    if (next) {
      next.prev = node;
    }
  }

  /**
   * 插入到当前节点之前
   * 
   * @param node 
   */
  insertBefore(node: ILinkedNode<T>): void {
    const prev = this.prev;
    this.prev = node;
    node.next = this;
    node.prev = prev;
    if (prev) {
      prev.next = node;
    }
  }
}