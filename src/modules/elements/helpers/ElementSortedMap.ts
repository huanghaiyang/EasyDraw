import SortedMap, { CompareFn } from "@/modules/struct/SortedMap";
import { observable, reaction } from "mobx";

export enum ElementSortedMapEventNames {
  changed = "changed",
}

export default class ElementSortedMap<K, V> extends SortedMap<K, V> {
  constructor(compareFn: CompareFn<K, V>) {
    super(compareFn);
    this.keys = observable.array(this.keys);
    reaction(
      () => this.keys.join(","),
      () => {
        this.emit(ElementSortedMapEventNames.changed);
      },
    );
  }
}
