import { ICommandTextEditorObject, ITextEditorCommandPayload, TextEditorCommandTypes } from "@/types/ICommand";
import ElementBaseCommand from "@/modules/command/ElementBaseCommand";
import { IElementText } from "@/types/IElement";

export default class TextEditorUpdatedCommand extends ElementBaseCommand<ITextEditorCommandPayload> {
  /**
   * 恢复数据
   *
   * @param data
   * @param type
   *
   */
  private async _restoreElementsFromData(data: ICommandTextEditorObject, type: TextEditorCommandTypes): Promise<void> {
    const { textData, textCursor, textSelection } = data;
    if (type === TextEditorCommandTypes.TextUpdated) {
      this.element.model.data = textData;
    }
    (this.element as IElementText).updateTextCursors(textCursor, textSelection);
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
