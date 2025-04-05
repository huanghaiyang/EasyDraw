import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { ICommandElementObject, IElementCommandPayload, IRearrangeCommandElementObject } from "@/types/ICommand";

export default class ElementsRearrangeCommand extends ElementsBaseCommand<IElementCommandPayload> {
  /**
   * 重新调整组件位置
   *
   * @param uDataList
   */
  private async _rearrange(uDataList: Array<ICommandElementObject>): Promise<void> {
    uDataList.forEach(data => {
      const {
        model: { id },
        prevId,
      } = data as IRearrangeCommandElementObject;
      const element = this.store.getElementById(id);
      if (element) {
        this.store.rearrangeElementAfter(element, prevId ? this.store.getElementById(prevId) : null, true);
      }
    });
    this.store.resortElementsArray();
    this.store.emitElementsLayerChanged();
  }
  async undo(): Promise<void> {
    if (!this.payload.uDataList) {
      return;
    }
    await this._rearrange(this.payload.uDataList);
  }

  async redo(): Promise<void> {
    if (!this.payload.rDataList) {
      return;
    }
    await this._rearrange(this.payload.rDataList);
  }
}
