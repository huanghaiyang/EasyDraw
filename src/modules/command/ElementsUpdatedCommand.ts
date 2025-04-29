import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { IElementCommandPayload } from "@/types/ICommand";
import CommandHelper from "@/modules/command/helpers/CommandHelper";
export default class ElementsUpdatedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  async undo(): Promise<void> {
    if (!this.payload.uDataList) {
      return;
    }
    await CommandHelper.restoreElementsFromData(this.payload.uDataList, this.store);
  }

  async redo(): Promise<void> {
    if (!this.payload.rDataList) {
      return;
    }
    await CommandHelper.restoreElementsFromData(this.payload.rDataList, this.store);
  }
}
