import { TextFontStyle } from "@/styles/ElementStyles";
import { IPoint, ISize } from "@/types";

// 文本节点
export type ITextNode = Partial<IPoint> &
  Partial<ISize> & {
    id: string;
    content: string;
    fontStyle: TextFontStyle;
    inSelection?: boolean;
  };

// 文本行
export type ITextLine = Partial<IPoint> &
  Partial<ISize> & {
    nodes: ITextNode[];
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
    pos?: number; // 0 表示左侧，1 表示右侧
    renderRect?: Partial<DOMRect>;
  };

// 文本选区节点
export type ITextSelectionNode = ITextCursor;

// 文本选区
export type ITextSelection = {
  startNode?: ITextSelectionNode;
  endNode?: ITextSelectionNode;
};
