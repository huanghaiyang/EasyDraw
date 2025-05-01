import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { IElementCommandPayload, IRearrangeCommandElementObject } from "@/types/ICommand";
import CommandHelper from "@/modules/command/helpers/CommandHelper";

export default class ElementsRearrangeCommand extends ElementsBaseCommand<IElementCommandPayload> {
  private;

  async undo(): Promise<void> {
    if (!this.payload.uDataList) {
      return;
    }
    CommandHelper.restoreRearrangeDataList(this.payload.uDataList as IRearrangeCommandElementObject[], this.store);
    CommandHelper.refreshStoreAfterLayerChanged(this.store);
  }

  async redo(): Promise<void> {
    if (!this.payload.rDataList) {
      return;
    }
    CommandHelper.restoreRearrangeDataList(this.payload.rDataList as IRearrangeCommandElementObject[], this.store);
    CommandHelper.refreshStoreAfterLayerChanged(this.store);
  }
}
