import { ElementObject } from "@/types/IElement";

// 通用组件命令对象
export type ICommandElementObject = {
  model: Partial<ElementObject>;
};

// 组件移出前的前后组件ID关系
export type IRemovedRelation = {
  prevId?: string;
  nextId?: string;
};

// 组件删除命令对象
export type IRemovedCommandElementObject = ICommandElementObject & IRemovedRelation;

// 组件样式命令对象
export type IStyleCommandElementObject = ICommandElementObject & {
  isStyle?: boolean;
  isStroke?: boolean;
  isFill?: boolean;
};

// 组合命令对象
export type IGroupCommandElementObject = ICommandElementObject & {
  isGroup?: boolean;
};

// 组合删除命令对象
export type IGroupRemovedCommandElementObject = IGroupCommandElementObject & IRemovedRelation;

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
  GroupAdded = "group_added",
  GroupRemoved = "group_removed",
}
