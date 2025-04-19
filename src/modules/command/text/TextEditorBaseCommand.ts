import ICommand from "@/types/ICommand";
import { IElementText } from "@/types/IElement";

export default class TextEditorBaseCommand<T> implements ICommand<T> {
  payload: T;
  element: IElementText;
  id: string;
  relationId?: string;

  constructor(id: string, payload: T, element: IElementText, relationId?: string) {
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
