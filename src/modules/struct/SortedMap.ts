import { EventEmitter } from "events";

export default class SortedMap<K, V> extends EventEmitter{
  protected map: Map<K, V>;
  protected keys: K[];

  get size(): number {
    return this.map.size;
  }

  constructor() {
    super();
    this.map = new Map<K, V>();
    this.keys = [];
  }

  set(key: K, value: V): void {
    if (!this.map.has(key)) {
      this.keys.push(key);
      this.keys.sort((a, b) => this.compareKeys(a, b));
    }
    this.map.set(key, value);
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

  private compareKeys(a: K, b: K): number {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, 'en', { numeric: true });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      throw new Error('Unsupported key type');
    }
  }
}