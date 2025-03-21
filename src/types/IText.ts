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

// 文本光标位置
export enum TextRenderDirection {
  LEFT,
  RIGHT,
}

// 文本光标
export type ITextCursor = Partial<IPoint> &
  Partial<ISize> & {
    nodeId?: string;
    lineNumber?: number;
    pos?: TextRenderDirection;
    renderRect?: Partial<DOMRect>;
  };

// 文本选区
export type ITextSelection = {
  startCursor?: ITextCursor;
  endCursor?: ITextCursor;
};
