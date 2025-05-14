import { IArbitraryCommandPayload } from "@/types/ICommand";
import ElementBaseCommand from "@/modules/command/ElementBaseCommand";

export default class ArbitraryEditorUpdatedCommand extends ElementBaseCommand<IArbitraryCommandPayload> {
  async undo(): Promise<void> {
    const { uData, type } = this.payload;
    if (!uData) {
      return;
    }
  }

  async redo(): Promise<void> {
    const { rData, type } = this.payload;
    if (!rData) {
      return;
    }
  }
}
