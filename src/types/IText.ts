import { TextFontStyle } from "@/styles/ElementStyles";
import { Direction, IPoint, ISize } from "@/types";

// 文本节点
export type ITextNode = Partial<IPoint> &
  Partial<ISize> & {
    id: string;
    content: string;
    fontStyle: TextFontStyle;
    selected?: boolean;
    updateId?: string;
  };

// 文本行
export type ITextLine = Partial<IPoint> &
  Partial<ISize> & {
    nodes: ITextNode[]; // 文本节点
    selected?: boolean; // 是否在选区中
    isTailBreak?: boolean; // 行尾是否是换行
    isFull?: boolean; // 是否是完整行
    fontStyle?: TextFontStyle; // 行字体样式
  };

// 文本数据
export default interface ITextData {
  lines: ITextLine[];
}

// 文本光标
export type ITextCursor = Partial<IPoint> &
  Partial<ISize> & {
    nodeId?: string;
    lineNumber?: number;
    pos?: Direction;
    renderRect?: Partial<DOMRect>;
  };

// 文本选区
export type ITextSelection = {
  startCursor?: ITextCursor;
  endCursor?: ITextCursor;
};

// 文本选区光标类型
export enum TextSelectionCursorType {
  START,
  END,
}

// 文本更新结果
export type TextUpdateResult = {
  reflow?: boolean; // 是否需要重新排版
  changed?: boolean; // 是否有内容更新
};

// 文本编辑器操作类型
export enum TextEditorOperations {
  NONE,
  INPUT,
  DELETE_SELECTION,
  DELETE_PREV,
  INSERT_NEWLINE,
  SELECT_ALL,
  COPY_SELECTION,
  CUT_SELECTION,
  PASTE_TEXT,
  UNDO,
  REDO,
  MOVE_CURSOR,
  MOVE_SELECTION,
}
