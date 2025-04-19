import { TextFontStyle } from "@/styles/ElementStyles";
import { Direction, IPoint, ISize } from "@/types";

// 文本字符大小(实际渲染大小)
export type CharRenderSize = {
  renderWidth: number;
  renderHeight: number;
};

// 文本字符位置(实际渲染位置)
export type CharRenderPoint = {
  renderX: number;
  renderY: number;
};

// 文本字符缩进
export type CharIndent = {
  indentX: number;
  indentY: number;
};

// 文本节点
export type ITextNode = Partial<IPoint> &
  Partial<TextMetrics> &
  Partial<CharRenderSize> &
  Partial<CharRenderPoint> &
  Partial<CharIndent> &
  Partial<ISize> & {
    id: string;
    content: string;
    renderContent?: string;
    fontStyle: TextFontStyle;
    selected?: boolean;
    updateId?: string;
    baseline?: number; // 基线Y坐标
  };

// 文本行大小(实际渲染大小)
export type LineRenderSize = {
  renderWidth: number;
  renderHeight: number;
};

// 文本行位置(实际渲染位置)
export type LineRenderPoint = {
  renderX: number;
  renderY: number;
};

// 文本行
export type ITextLine = Partial<IPoint> &
  Partial<ISize> &
  Partial<LineRenderPoint> &
  Partial<LineRenderSize> & {
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
  NONE = "none",
  INPUT = "input",
  DELETE_SELECTION = "delete_selection",
  DELETE_PREV = "delete_prev",
  INSERT_NEWLINE = "insert_newline",
  SELECT_ALL = "select_all",
  COPY_SELECTION = "copy_selection",
  CUT_SELECTION = "cut_selection",
  PASTE_TEXT = "paste_text",
  UNDO = "undo",
  REDO = "redo",
  MOVE_CURSOR = "move_cursor",
  MOVE_SELECTION = "move_selection",
}

// 文本编辑器鼠标按压类型
export enum TextEditorPressTypes {
  PRESS_DOWN = "press_down",
  PRESS_MOVE = "press_move",
  PRESS_UP = "press_up",
}

// 文本字体样式更新类型
export enum TextFontStyleUpdateTypes {
  FONT_SIZE = "font_size",
  FONT_FAMILY = "font_family",
  FONT_STYLER = "font_styler",
  FONT_COLOR = "font_color",
  FONT_COLOR_OPACITY = "font_color_opacity",
  FONT_ALIGN = "font_align",
  FONT_LINE_HEIGHT = "font_line_height",
  FONT_LINE_HEIGHT_FACTOR = "font_line_height_factor",
  FONT_LINE_HEIGHT_AUTO_FIT = "font_line_height_auto_fit",
  FONT_LETTER_SPACING = "font_letter_spacing",
  FONT_PARAGRAPH_SPACING = "font_paragraph_spacing",
  FONT_TEXT_CASE = "font_text_case",
  FONT_TEXT_ALIGN = "font_text_align",
  FONT_TEXT_VERTICAL_ALIGN = "font_text_vertical_align",
  FONT_TEXT_DECORATION = "font_text_decoration",
  FONT_TEXT_DECORATION_COLOR = "font_text_decoration_color",
  FONT_TEXT_DECORATION_OPACITY = "font_text_decoration_opacity",
  FONT_TEXT_DECORATION_THICKNESS = "font_text_decoration_thickness",
  FONT_TEXT_BASELINE = "font_text_baseline",
}
