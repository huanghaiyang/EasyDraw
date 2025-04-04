import ICommand from "@/types/ICommand";
import { IElementText } from "@/types/IElement";

export default class TextEditorBaseCommand<T> implements ICommand<T> {
  payload: T;
  element: IElementText;

  constructor(payload: T, element: IElementText) {
    this.payload = payload;
    this.element = element;
  }

  async undo(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async redo(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
