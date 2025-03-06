import ICommand, { ICommandPayload } from "@/types/ICommand";
import { ElementObject } from "@/types/IElement";
import IStageStore from "@/types/IStageStore";

export default class ElementsAddedCommand implements ICommand {
  payload: ICommandPayload;
  store: IStageStore;

  constructor(payload: ICommandPayload, store: IStageStore) {
    this.payload = payload;
    this.store = store;
  }

  undo(): void {
    this.payload.data.forEach(data => {
      const { id } = data;
      this.store.removeElement(id);
    });
  }

  redo(): void {
    this.payload.data.forEach(data => {
      this.store.addElementByModel(data as ElementObject);
    });
  }
}
