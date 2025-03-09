import { ElementObject } from "@/types/IElement";

// 通用组件命令对象
export type ICommandElementObject = {
  model: Partial<ElementObject>;
};

// 组件删除命令对象
export type IRemovedCommandElementObject = ICommandElementObject & {
  prevId?: string;
  nextId?: string;
};

export default interface ICommand {
  payload: ICommandPayload;
  undo(): void;
  redo(): void;
}

export interface ICommandPayload {
  type: CommandTypes;
  dataList: Array<ICommandElementObject>;
  rDataList?: Array<ICommandElementObject>;
}

export enum CommandTypes {
  ElementsAdded = "elements_added",
  ElementsRemoved = "elements_removed",
  ElementsUpdated = "elements_updated",
}
