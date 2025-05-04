import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { IElementCommandPayload } from "@/types/ICommand";
import CommandHelper from "@/modules/command/helpers/CommandHelper";

export default class ElementsChangedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  async undo(): Promise<void> {
    if (!this.payload.uDataList) return;
    CommandHelper.restoreDataList(this.payload.uDataList, false, this.store);
    CommandHelper.refreshStoreAfterLayerChanged(this.store);
  }

  async redo(): Promise<void> {
    if (!this.payload.rDataList) return;
    CommandHelper.restoreDataList(this.payload.rDataList, true, this.store);
    CommandHelper.refreshStoreAfterLayerChanged(this.store);
  }
}
