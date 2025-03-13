import { TextFontStyle } from "@/styles/ElementStyles";

export type ITextNode = {
  content: string;
  fontStyle: TextFontStyle;
};

export type ITextLine = {
  nodes: ITextNode[];
};

export default interface ITextData {
  lines: ITextLine[];
}
