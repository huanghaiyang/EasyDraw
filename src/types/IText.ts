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
    nearestNodeId?: string;
    rotateBoxRect?: Partial<DOMRect>;
  };
