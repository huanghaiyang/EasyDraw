import { ElementObject } from "@/types/IElement";

export default interface ICommand {
  payload: ICommandPayload;
  undo(): void;
  redo(): void;
}

export interface ICommandPayload {
  type: CommandTypes;
  dataList: Array<Partial<ElementObject>>;
  rDataList?: Array<Partial<ElementObject>>;
}

export enum CommandTypes {
  ElementsAdded = "elements_added",
  ElementsRemoved = "elements_removed",
  ElementsUpdated = "elements_updated",
}
