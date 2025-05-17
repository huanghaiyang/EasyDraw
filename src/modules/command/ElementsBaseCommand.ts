import ICommand from "@/types/ICommand";
import IStageStore from "@/types/IStageStore";

export default class ElementsBaseCommand<T> implements ICommand<T> {
  id: string;
  payload: T;
  store?: IStageStore;
  relationId?: string;

  constructor(id: string, payload: T, store?: IStageStore, relationId?: string) {
    this.id = id;
    this.payload = payload;
    this.store = store;
    this.relationId = relationId;
  }

  async undo(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async redo(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
