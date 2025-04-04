import { ICommandTextEditorObject, ITextEditorCommandPayload } from "@/types/ICommand";
import TextEditorBaseCommand from "@/modules/command/text/TextEditorBaseCommand";
export default class TextEditorUpdatedCommand extends TextEditorBaseCommand<ITextEditorCommandPayload> {
  /**
   * 恢复数据
   *
   * @param data
   */
  private async _restoreElementsFromData(data: ICommandTextEditorObject): Promise<void> {
    const { textData, textCursor, textSelection } = data;
    this.element.model.data = textData;
    this.element.updateTextCursors(textCursor, textSelection);
  }

  async undo(): Promise<void> {
    if (!this.payload.data) {
      return;
    }
    await this._restoreElementsFromData(this.payload.data);
  }

  async redo(): Promise<void> {
    if (!this.payload.rData) {
      return;
    }
    await this._restoreElementsFromData(this.payload.rData);
  }
}
