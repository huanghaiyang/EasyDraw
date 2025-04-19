import ICommand from "@/types/ICommand";
import IStageStore from "@/types/IStageStore";

export default class ElementsBaseCommand<T> implements ICommand<T> {
  payload: T;
  store: IStageStore;
  id: string;
  relationId?: string;

  constructor(id: string, payload: T, store: IStageStore, relationId?: string) {
    this.payload = payload;
    this.store = store;
    this.id = id;
    this.relationId = relationId;
  }

  async undo(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async redo(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
