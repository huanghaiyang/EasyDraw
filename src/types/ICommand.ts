import IElement, { ElementObject } from "@/types/IElement";
import ITextData, { ITextCursor, ITextSelection, TextEditorOperations } from "@/types/IText";
import { IPoint, ISize } from "@/types/index";

// 通用组件命令
export type IBaseCommandElementObject = {
  model: Partial<ElementObject>;
};

// 组件移出前的前后组件ID关系
export type IRelationNode = {
  prevId?: string;
  nextId?: string;
};

// 组合关系
export type IGroupNode = {
  isGroup?: boolean;
  isGroupSubject?: boolean;
};

// 组件变更类型
export enum ElementActionTypes {
  Added = "Added", // 组件添加
  Updated = "Updated", // 组件更新
  Removed = "removed",
  Moved = "moved", // 组件移动位置
  GroupUpdated = "GroupUpdated",
}

// 层级变更，数据操作回调函数参数
export type ElementsActionParam = {
  type: ElementActionTypes;
  data: IElement[];
};

// 层级变更，数据回传函数
export interface ElementActionCallback {
  (params: ElementsActionParam[]): Promise<void>;
}

// 独立组件移除命令
export type ICommandElementObject = IBaseCommandElementObject &
  IRelationNode &
  IGroupNode & {
    type?: ElementActionTypes;
  };

// 命令
export default interface ICommand<T> {
  id: string;
  relationId?: string;
  payload: T;
  undo(): Promise<void>;
  redo(): Promise<void>;
}

// 组件操作数据
export interface IElementsCommandPayload {
  type: ElementsCommandTypes;
  uDataList: Array<ICommandElementObject>;
  rDataList?: Array<ICommandElementObject>;
}

// 组件命令类型
export enum ElementsCommandTypes {
  ElementsAdded = "elements_added",
  ElementsRemoved = "elements_removed",
  ElementsUpdated = "elements_updated",
  ElementsRearranged = "elements_rearranged",
  ElementsMoved = "elements_moved",
  GroupAdded = "group_added",
  GroupRemoved = "group_removed",
  DetachedElementsRemoved = "detached_elements_removed",
}

// 单个组件操作数据
export type IElementCommandPayload = { }

// 文本编辑器命令类型
export enum TextEditorCommandTypes {
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
export interface ITextEditorCommandPayload extends IElementCommandPayload {
  type: TextEditorCommandTypes;
  operation: TextEditorOperations;
  updateId?: string;
  uData: ICommandTextEditorObject;
  rData?: ICommandTextEditorObject;
}

// 自由折线组件操作类型
export enum ArbitraryOperations {
  coord_create = "coord_create",
  coord_move = "coord_move"
};

// 自由折线组件命令类型
export enum ArbitraryCommandTypes {
  CoordsUpdated = "coords_updated"
}

// 自由折线组件命令对象
export type ICommandArbitraryObject = {
  coords: IPoint[];
  boxCoords?: IPoint[];
  size?: ISize;
  position?: IPoint;
  tailCoordIndex?: number;
  editingCoordIndex?: number;
}

// 自由折线组件命令的保存数据
export interface IArbitraryCommandPayload extends IElementCommandPayload {
  type: ArbitraryCommandTypes;
  operation: ArbitraryOperations;
  updateId?: string;
  uData: ICommandArbitraryObject;
  rData?: ICommandArbitraryObject
}