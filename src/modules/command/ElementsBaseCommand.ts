import ICommand, { ICommandPayload } from "@/types/ICommand";
import IStageStore from "@/types/IStageStore";

export default class ElementsBaseCommand implements ICommand {
  payload: ICommandPayload;
  store: IStageStore;

  constructor(payload: ICommandPayload, store: IStageStore) {
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
