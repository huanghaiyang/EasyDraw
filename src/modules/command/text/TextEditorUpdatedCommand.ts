import { ICommandTextEditorObject, ITextEditorCommandPayload, TextEeditorCommandTypes } from "@/types/ICommand";
import TextEditorBaseCommand from "@/modules/command/text/TextEditorBaseCommand";
export default class TextEditorUpdatedCommand extends TextEditorBaseCommand<ITextEditorCommandPayload> {
  /**
   * 恢复数据
   *
   * @param data
   * @param type
   *
   */
  private async _restoreElementsFromData(data: ICommandTextEditorObject, type: TextEeditorCommandTypes): Promise<void> {
    const { textData, textCursor, textSelection } = data;
    if (type === TextEeditorCommandTypes.TextUpdated) {
      this.element.model.data = textData;
    }
    this.element.updateTextCursors(textCursor, textSelection);
  }

  async undo(): Promise<void> {
    const { uData, type } = this.payload;
    if (!uData) {
      return;
    }
    await this._restoreElementsFromData(uData, type);
  }

  async redo(): Promise<void> {
    const { rData, type } = this.payload;
    if (!rData) {
      return;
    }
    await this._restoreElementsFromData(rData, type);
  }
}
