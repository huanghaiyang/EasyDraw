import { EventEmitter } from "events";

export type CompareFn<K, V> = (a: V, b: V) => number;

export default class SortedMap<K, V> extends EventEmitter {
  protected map: Map<K, V>;
  protected keys: K[];
  protected compareFn: CompareFn<K, V>;

  get size(): number {
    return this.map.size;
  }

  constructor(compareFn: CompareFn<K, V>) {
    super();
    this.map = new Map<K, V>();
    this.keys = [];
    this.compareFn = compareFn;
  }

  set(key: K, value: V): void {
    if (!this.map.has(key)) {
      this.keys.push(key);
    }
    this.map.set(key, value);
    this.keys.sort((a, b) => {
      const aValue = this.map.get(a);
      const bValue = this.map.get(b);
      return this.compareFn(aValue, bValue);
    });
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  delete(key: K): boolean {
    if (this.map.delete(key)) {
      const index = this.keys.indexOf(key);
      if (index > -1) {
        this.keys.splice(index, 1);
      }
      return true;
    }
    return false;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  clear(): void {
    this.map.clear();
    this.keys = [];
  }

  entries(): [K, V][] {
    return this.keys.map(key => [key, this.map.get(key) as V]);
  }

  keysArray(): K[] {
    return [...this.keys];
  }

  valuesArray(): V[] {
    return this.keys.map(key => this.map.get(key) as V);
  }
}
