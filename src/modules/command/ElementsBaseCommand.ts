import ICommand from "@/types/ICommand";
import IStageStore from "@/types/IStageStore";

export default class ElementsBaseCommand<T> implements ICommand<T> {
  payload: T;
  store: IStageStore;

  constructor(payload: T, store: IStageStore) {
    this.payload = payload;
    this.store = store;
  }

  undo(): void {
    throw new Error("Method not implemented.");
  }

  redo(): void {
    throw new Error("Method not implemented.");
  }
}
