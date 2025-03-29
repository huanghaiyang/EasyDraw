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
