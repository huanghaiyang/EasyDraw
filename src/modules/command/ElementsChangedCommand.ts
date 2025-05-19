import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { IElementsCommandPayload } from "@/types/ICommand";
import CommandHelper from "@/modules/command/helpers/CommandHelper";

export default class ElementsChangedCommand extends ElementsBaseCommand<IElementsCommandPayload> {
  async undo(): Promise<void> {
    if (!this.payload.uDataList) return;
    CommandHelper.restoreDataList(this.payload.uDataList, false, this.store);
    this.store.retrieveElements();
    this.store.emitElementsLayerChanged();
  }

  async redo(): Promise<void> {
    if (!this.payload.rDataList) return;
    CommandHelper.restoreDataList(this.payload.rDataList, true, this.store);
    this.store.retrieveElements();
    this.store.emitElementsLayerChanged();
  }
}
