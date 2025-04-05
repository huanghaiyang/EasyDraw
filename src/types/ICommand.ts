import { ElementObject } from "@/types/IElement";
import ITextData, { ITextCursor, ITextSelection, TextEditorOperations } from "@/types/IText";

// 通用组件命令
export type ICommandElementObject = {
  model: Partial<ElementObject>;
};

// 组件移出前的前后组件ID关系
export type INodeRelation = {
  prevId?: string;
  nextId?: string;
};

// 组件删除命令
export type IRemovedCommandElementObject = ICommandElementObject & INodeRelation;

// 组件顺序调整命令
export type IRearrangeCommandElementObject = ICommandElementObject & INodeRelation;

// 组合命令
export type IGroupCommandElementObject = ICommandElementObject &
  INodeRelation & {
    isGroup?: boolean;
    isGroupSubject?: boolean;
  };

// 命令
export default interface ICommand<T> {
  payload: T;
  undo(): Promise<void>;
  redo(): Promise<void>;
}

// 组件操作数据
export interface IElementCommandPayload {
  type: ElementCommandTypes;
  dataList: Array<ICommandElementObject>;
  rDataList?: Array<ICommandElementObject>;
}

// 组件命令类型
export enum ElementCommandTypes {
  ElementsAdded = "elements_added",
  ElementsRemoved = "elements_removed",
  ElementsUpdated = "elements_updated",
  ElementsRearranged = "elements_rearranged",
  GroupAdded = "group_added",
  GroupRemoved = "group_removed",
}

// 文本编辑器命令类型
export enum TextEeditorCommandTypes {
  TextUpdated = "text_updated",
  CursorSelectionUpdated = "cursor_selection_updated",
}

// 文本组件编辑命令对象
export type ICommandTextEditorObject = {
  textData?: ITextData;
  textCursor?: ITextCursor;
  textSelection?: ITextSelection;
};

// 文本组件编辑命令的保存数据
export interface ITextEditorCommandPayload {
  type: TextEeditorCommandTypes;
  operation: TextEditorOperations;
  updateId?: string;
  data: ICommandTextEditorObject;
  rData?: ICommandTextEditorObject;
}
