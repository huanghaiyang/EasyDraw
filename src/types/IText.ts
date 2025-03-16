import { TextFontStyle } from "@/styles/ElementStyles";
import { IPoint, ISize } from "@/types";

export type ITextNode = Partial<IPoint> &
  Partial<ISize> & {
    id: string;
    content: string;
    fontStyle: TextFontStyle;
  };

export type ITextLine = {
  nodes: ITextNode[];
};

export default interface ITextData {
  lines: ITextLine[];
}

export type ITextCursor = Partial<IPoint> &
  Partial<ISize> & {
    nodeId?: string;
    pos: number; // 0 表示左侧，1 表示右侧
    rotateBoxRect?: Partial<DOMRect>;
  };
