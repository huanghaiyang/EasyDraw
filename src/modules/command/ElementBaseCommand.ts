import ICommand from "@/types/ICommand";
import IElement from "@/types/IElement";

export default class ElementBaseCommand<T> implements ICommand<T> {
  payload: T;
  element: IElement;
  id: string;
  relationId?: string;

  constructor(id: string, payload: T, element: IElement, relationId?: string) {
    this.payload = payload;
    this.element = element;
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
